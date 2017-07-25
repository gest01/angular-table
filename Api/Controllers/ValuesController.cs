using Api.App_Start;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace Api.Controllers
{
    [RoutePrefix("api/values")]
    public class ValuesController : ApiController
    {
        [HttpGet]
        [Route("")]
        public async Task<IHttpActionResult> Get()
        {
            var result = await GetValuesAsync();
            return Ok(result);
        }

        [HttpPost]
        [Route("all")]
        public async Task<IHttpActionResult> GetAll(FilterDto filter)
        {
            var total = await GetValuesAsync();
            var result = total.Skip(filter.Count * (filter.Page - 1 )).Take(filter.Count);
            result = result.AsQueryable().ApplyFilter(filter);
            return Ok(new {
                Total = total.Count(),
                Data = result
            });
        }

        private Task<IEnumerable<Data>> GetValuesAsync()
        {
            int typeCount = 0;

            List<Data> values = new List<Data>();
            for (int i = 1; i < 476; i++)
            {
                values.Add(new Data
                {
                    Id = i,
                    Name = "name " + i.ToString(),
                    Type = ++typeCount,
                    DateFrom = DateTime.Now.AddDays(i * -1),
                    DateTo = DateTime.Now.AddDays(i + 1)
                });

                if (typeCount >= 3) {
                    typeCount = 0;
                }
            }

            return Task.FromResult(values.AsEnumerable());
        }
    }

    public class Data
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
    }
}
