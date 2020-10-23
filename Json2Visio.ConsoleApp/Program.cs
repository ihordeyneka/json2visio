using Json2Visio.Web.Models;
using Microsoft.Office.Interop.Visio;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

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

        private static void GenerateVisio(Input input)
        {
            var application = new Application();
            var outputPath = System.IO.Path.Combine(ROOT_DIR, @"Output\result.vsdx");
            var document = application.Documents.Add("");

            var visioPage = application.ActivePage;

            var visioShape = visioPage.DrawLine(5, 4, 7.5, 1);

            document.SaveAs(outputPath);
        }
    }
}
