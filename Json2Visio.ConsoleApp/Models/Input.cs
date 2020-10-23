using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Json2Visio.Web.Models
{
    public class Input
    {
        public IEnumerable<InputElement> Elements { get; set; }
        public IEnumerable<InputData> Data { get; set; }
        public IEnumerable<InputConnection> Connections { get; set; }
    }
}
