using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace Api.App_Start
{
    public class FilterDto
    {
        public enum SortOrder
        {
            Asc,
            Desc
        }

        public IDictionary<string, JToken> Filter { get; set; }
        public IDictionary<string, SortOrder> Sorting { get; set; }
        public int Count { get; set; }
        public int Page { get; set; }

        public FilterDto()
        {
            Page = 1;
            Count = 10;
        }
    }

}