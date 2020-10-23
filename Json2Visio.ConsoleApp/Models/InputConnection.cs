using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Json2Visio.Web.Models
{
    public class InputConnection
    {
        public string FromElementId { get; set; }
        public string ToElementId { get; set; }
        public string Color { get; set; }
        public string Label { get; set; }
        public int? DataX { get; set; }
        public int? DataY { get; set; }
        public string DataId { get; set; }
        public string Shape { get; set; }
    }
}
