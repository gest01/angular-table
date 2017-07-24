using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Api.App_Start
{
    public class FilterFlattener
    {
        public FilterDto Flatten(FilterDto filter)
        {
            var res = new FilterDto
            {
                Count = filter.Count,
                Page = filter.Page,
                Sorting = filter.Sorting
            };

            var queue = new Queue<Tuple<string, JToken>>();
            foreach (var pair in filter.Filter)
            {
                queue.Enqueue(Tuple.Create(pair.Key, pair.Value));
            }

            var resFilter = new Dictionary<string, JToken>();
            while (queue.Count > 0)
            {
                var item = queue.Dequeue();

                var jObject = item.Item2 as JObject;
                if (jObject != null)
                {
                    var range = jObject.ToObject<FilterServiceExtension.RangeDto>();
                    var contains = jObject.ToObject<FilterServiceExtension.ContainsDto>();
                    if ((range != null && range.IsValid) || (contains != null && contains.IsValid))
                    {
                        resFilter[item.Item1] = item.Item2;
                        continue;
                    }

                    foreach (var pair in jObject)
                    {
                        queue.Enqueue(Tuple.Create($"{item.Item1}.{pair.Key}", pair.Value));
                    }
                }
                else
                {
                    resFilter[item.Item1] = item.Item2;
                }
            }
            res.Filter = resFilter;

            return res;
        }
    }

}