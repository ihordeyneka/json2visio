using Json2Visio.Web.Models;
//using IVisio = Microsoft.Office.Interop.Visio;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using VisioAutomation.VDX;
using VisioAutomation.VDX.Elements;

namespace Json2Visio.ConsoleApp
{
    class Program
    {
        private static readonly string ROOT_DIR = System.IO.Path.Combine(Environment.CurrentDirectory, @"..\..");

        static void Main(string[] args)
        {
            var input = ParseInput();
            GenerateVisio(input);
        }

        private static Input ParseInput()
        {
            var inputPath = System.IO.Path.Combine(ROOT_DIR, @"Input\data.json");

            var json = File.ReadAllText(inputPath);
            var input = JsonConvert.DeserializeObject<Input>(json);

            return input;
        }

        public static void GenerateVisio(Input input)
        {
            var outputPath = System.IO.Path.Combine(ROOT_DIR, @"Output\result.vdx");

            var template = new Template();
            var doc = new Drawing(template);

            var w1 = new DocumentWindow();
            w1.ShowGrid = false;
            w1.ShowGuides = false;
            w1.ShowConnectionPoints = false;
            w1.ShowPageBreaks = false;

            var page = GeneratePage(doc);

            w1.Page = page.ID;

            doc.Windows.Add(w1);

            doc.Save(outputPath);
        }

        private static Page GeneratePage(Drawing doc)
        {
            var page = new Page(800, 400);
            doc.Pages.Add(page);

            int rounded_rect_id = doc.GetMasterMetaData("Rounded REctAngle").ID;

            var shape1 = new Shape(rounded_rect_id, 40, 30);
            page.Shapes.Add(shape1);

            return page;
        }

        //private static void GenerateVisioWithInterop(Input input)
        //{
        //    var application = new Application();
        //    var outputPath = System.IO.Path.Combine(ROOT_DIR, @"Output\result.vsdx");
        //    var document = application.Documents.Add("");

        //    var visioPage = application.ActivePage;

        //    var visioShape = visioPage.DrawLine(5, 4, 7.5, 1);

        //    document.SaveAs(outputPath);
        //}
    }
}
