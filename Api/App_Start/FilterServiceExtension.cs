using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Web;

namespace Api.App_Start
{
    public static class FilterServiceExtension
    {
        public static IQueryable<TValue> ApplyFilter<TValue>(this IQueryable<TValue> list, FilterDto filter)
        {
            if (filter == null)
                return list;

            if (filter.Filter != null)
            {
                foreach (var pair in filter.Filter)
                {
                    if (pair.Value?.Type == JTokenType.Object)
                    {
                        var range = pair.Value.ToObject<RangeDto>();
                        if (range != null && range.IsValid)
                        {
                            if (range.From != null)
                                list = list.Where(GreaterThanOrEqual<TValue>(pair.Key, range.From));
                            if (range.To != null)
                                list = list.Where(LessThanOrEqual<TValue>(pair.Key, range.To));
                        }

                        var contains = pair.Value.ToObject<ContainsDto>();
                        if (contains != null && contains.IsValid)
                        {
                            list = list.Where(ContainsAny<TValue>(pair.Key, contains.Any));
                        }
                    }
                    else
                    {
                        var value = ((JValue)pair.Value)?.Value;
                        list = list.Where(Where<TValue>(pair.Key, value));
                    }
                }
            }

            if (filter.Sorting != null)
            {
                foreach (var sorting in filter.Sorting)
                {
                    list = sorting.Value == FilterDto.SortOrder.Asc ? list.OrderBy(KeySelector<TValue>(sorting.Key)) : list.OrderByDescending(KeySelector<TValue>(sorting.Key));
                }
            }

            return list;
        }

        private static Expression<Func<TValue, object>> KeySelector<TValue>(string field)
        {
            var entityType = typeof(TValue);

            var parameter = Expression.Parameter(entityType, "entity");
            var body = Expression.Convert(CreatePropertyExpression<TValue>(field, parameter), typeof(object));

            return Expression.Lambda<Func<TValue, object>>(body, parameter);
        }

        private static Expression CreatePropertyExpression<TValue>(string propertyName, ParameterExpression parameter)
        {
            var type = typeof(TValue);

            var param = Expression.Parameter(type, "x");
            Expression body = param;
            foreach (var member in propertyName.Split('.'))
            {
                if (typeof(JObject).IsAssignableFrom(body.Type))
                {
                    body = Expression.MakeIndex(body, typeof(JObject).GetProperty("Item", new[] { typeof(string) }), new[] { Expression.Constant(member) });
                }
                else
                {
                    body = Expression.PropertyOrField(body, member);
                }
            }

            body = NullSafeEvalWrapper(body, Expression.Default(body.Type));

            return Expression.Invoke(Expression.Lambda(body, param), parameter);
        }

        private static Expression NullSafeEvalWrapper(Expression expr, Expression defaultValue)
        {
            Expression obj;
            Expression safe = expr;

            while (!IsNullSafe(expr, out obj))
            {
                var isNull = Expression.Equal(obj, Expression.Constant(null));

                safe = Expression.Condition(isNull, defaultValue, safe);
                expr = obj;
            }
            return safe;
        }

        private static bool IsNullSafe(Expression expr, out Expression nullableObject)
        {
            nullableObject = null;

            if (expr is MemberExpression || expr is MethodCallExpression)
            {
                Expression obj;
                MemberExpression memberExpr = expr as MemberExpression;
                MethodCallExpression callExpr = expr as MethodCallExpression;

                if (memberExpr != null)
                {
                    // Static fields don't require an instance
                    FieldInfo field = memberExpr.Member as FieldInfo;
                    if (field != null && field.IsStatic)
                        return true;

                    // Static properties don't require an instance
                    PropertyInfo property = memberExpr.Member as PropertyInfo;
                    if (property != null)
                    {
                        MethodInfo getter = property.GetGetMethod();
                        if (getter != null && getter.IsStatic)
                            return true;
                    }
                    obj = memberExpr.Expression;
                }
                else
                {
                    // Static methods don't require an instance
                    if (callExpr.Method.IsStatic)
                        return true;

                    obj = callExpr.Object;
                }

                // Value types can't be null
                if (obj.Type.IsValueType)
                    return true;

                // Instance member access or instance method call is not safe
                nullableObject = obj;
                return false;
            }
            return true;
        }

        private static Type GetPropertyType(string propertyName, Type type)
        {
            foreach (var member in propertyName.Split('.'))
            {
                if (type.IsAssignableFrom(typeof(JObject)))
                    return typeof(JObject);

                var result = type.GetProperty(member, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

                if (result == null)
                    throw new Exception($"Unable to find property '{member}' on type '{type}'");

                type = result.PropertyType;
            }
            return type;
        }

        private static Expression<Func<TValue, bool>> GreaterThanOrEqual<TValue>(string field, object value)
        {
            var entityType = typeof(TValue);

            var parameter = Expression.Parameter(entityType, "entity");
            var propertyType = GetPropertyType(field, entityType);
            var propertyExpression = CreatePropertyExpression<TValue>(field, parameter);

            var body = Expression.GreaterThanOrEqual(propertyExpression, Expression.Convert(Expression.Constant(value), propertyType));

            return Expression.Lambda<Func<TValue, bool>>(body, parameter);
        }

        private static bool EqualWithId(object value1, object value2)
        {
            var enumerable = value2 as IEnumerable;
            if (enumerable != null && value2.GetType() != typeof(string))
            {
                foreach (var val2 in enumerable.OfType<object>())
                {
                    if (EqualWithId(value1, val2))
                        return true;
                }
            }

            var obj = value1 as JObject;
            var idValue = obj?["id"].ToObject<object>();
            if (idValue != null)
                return EqualsConvert(idValue, value2);

            return EqualsConvert(value1, value2);
        }

        private static bool EqualsConvert(object value1, object value2)
        {
            var idStringValue = value1 as string;
            if (value2 is Guid && idStringValue != null)
                value1 = Guid.Parse(idStringValue);

            return Equals(value1, value2);
        }

        private static Expression<Func<TValue, bool>> ContainsAny<TValue>(string field, IEnumerable<object> values)
        {
            var entityType = typeof(TValue);

            var parameter = Expression.Parameter(entityType, "entity");
            var propertyType = GetPropertyType(field, entityType);
            var propertyExpression = CreatePropertyExpression<TValue>(field, parameter);
            if (values == null)
                values = new List<object>();

            var listValues = values as IList<object> ?? values.ToList();

            Expression<Func<object, bool>> equals = i => !listValues.Any() || listValues.Any(a => EqualWithId(a, i));
            Expression body = Expression.Invoke(equals, Expression.Convert(propertyExpression, typeof(object)));

            body = WrapByTryCatch(body, propertyType);
            return Expression.Lambda<Func<TValue, bool>>(body, parameter);
        }

        private static Expression<Func<TValue, bool>> LessThanOrEqual<TValue>(string field, object value)
        {
            var entityType = typeof(TValue);

            var parameter = Expression.Parameter(entityType, "entity");
            var propertyType = GetPropertyType(field, entityType);
            var propertyExpression = CreatePropertyExpression<TValue>(field, parameter);
            Expression body = Expression.LessThanOrEqual(propertyExpression, Expression.Convert(Expression.Constant(value), propertyType));

            body = WrapByTryCatch(body, propertyType);
            return Expression.Lambda<Func<TValue, bool>>(body, parameter);
        }

        private static Expression<Func<TValue, bool>> Where<TValue>(string field, object value)
        {
            var entityType = typeof(TValue);

            var propertyType = GetPropertyType(field, entityType);
            Expression valueExpression;
            if (typeof(JToken).IsAssignableFrom(propertyType))
            {
                valueExpression = ConvertToType(Expression.Constant(new JValue(value)), typeof(JToken));
            }
            else
            {
                valueExpression = ConvertToType(Expression.Constant(value), propertyType);
            }

            var parameter = Expression.Parameter(entityType, "entity");
            var propertyExpression = CreatePropertyExpression<TValue>(field, parameter);

            Expression body;
            if (propertyType == typeof(string) && value != null)
            {
                var method = typeof(string).GetMethod("IndexOf", new[] { typeof(string), typeof(StringComparison) });
                body = Expression.NotEqual(Expression.Call(Expression.Convert(propertyExpression, typeof(string)), method, valueExpression, Expression.Constant(StringComparison.OrdinalIgnoreCase)), Expression.Constant(-1));
            }
            else
            {
                if (ReferenceEquals(null, value))
                {
                    body = Expression.Equal(propertyExpression, valueExpression);
                }
                else
                {
                    var method = propertyExpression.Type.GetMethod("Equals", new[] { typeof(object) });
                    var paramType = method.GetParameters()[0].ParameterType;
                    body = Expression.Call(propertyExpression, method, Expression.Convert(valueExpression, paramType));
                }
            }
            body = WrapByTryCatch(body, propertyType);
            return Expression.Lambda<Func<TValue, bool>>(body, parameter);
        }

        private static TryExpression WrapByTryCatch(Expression body, Type propertyType)
        {
            if (propertyType == typeof(string))
                return Expression.TryCatch(body, Expression.Catch(typeof(Exception), Expression.Constant(false)));

            return Expression.TryCatch(body, Expression.Catch(typeof(Exception), Expression.Constant(true)));
        }

        private static Expression ConvertToType(
                 Expression source,
                 Type targetType)
        {
            if (targetType == typeof(Guid))
            {
                var tostringMethod = typeof(object).GetMethod("ToString");
                var body = Expression.Call(source, tostringMethod);

                var parseMethod = typeof(Guid).GetMethod("Parse", new[] { typeof(string) });
                return Expression.Convert(Expression.Call(parseMethod, body), targetType);
            }
            if (targetType.IsGenericType && targetType.GetGenericTypeDefinition() == typeof(Nullable<>))
            {
                var innerType = targetType.GenericTypeArguments[0];

                var innerConvert = ConvertToType(source, innerType);
                var res = Expression.Convert(innerConvert, targetType);

                Expression conditionTest = Expression.Empty();
                if (source.Type == typeof(Int64))
                {
                    conditionTest = Expression.Equal(source, Expression.Constant(-1L));
                }
                else
                {
                    conditionTest = Expression.Equal(source, Expression.Constant(null));
                }

                return Expression.Condition(
                   conditionTest, // Test
                   Expression.Convert(Expression.Constant(null), targetType),  // IfTrue
                   res // IfFalse
                   );

            }
            if (targetType.IsEnum)
            {
                var tostringMethod = typeof(object).GetMethod("ToString");
                var body = Expression.Call(source, tostringMethod);

                var parseMethod = typeof(Enum).GetMethod("Parse", new[] { typeof(Type), typeof(string), typeof(bool) });
                return Expression.Convert(Expression.Call(parseMethod, new Expression[] { Expression.Constant(targetType), body, Expression.Constant(true) }), targetType);
            }
            else
            {
                var changeTypeMethod = typeof(Convert).GetMethod("ChangeType", new[] { typeof(object), typeof(Type) });
                var body = Expression.Call(changeTypeMethod, Expression.Convert(source, typeof(object)), Expression.Constant(targetType));

                return Expression.Convert(body, targetType);
            }
        }

        internal class RangeDto
        {
            public object From { get; set; }
            public object To { get; set; }
            public bool IsValid => From != null || To != null;
        }

        internal class ContainsDto
        {
            public IEnumerable<object> Any { get; set; }
            public bool IsValid => Any != null;
        }
    }

}