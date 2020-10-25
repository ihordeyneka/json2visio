using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Json2Visio.Web.Models
{
    [XmlRoot(ElementName = "PageContents")]
    public class Output
    {
        public List<OutputShape> Shapes { get; set; }
        public List<OutputConnect> Connects { get; set; }

        public Output()
        {
            Shapes = new List<OutputShape>();
            Connects = new List<OutputConnect>();
        }
    }
}
