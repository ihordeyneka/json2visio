using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Json2Visio.Web.Models
{
    public class InputElement
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string SubName { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public string Shape { get; set; }
        public string BackgroundColor { get; set; }
        public string BorderColor { get; set; }
    }
}
