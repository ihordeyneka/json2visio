using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Xml;
using System.Xml.Serialization;
using Json2Visio.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;

namespace Json2Visio.Web.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VisioController : ControllerBase
    {
        private IHostEnvironment _hostEnvironment;

        public VisioController(IHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
        }

        [HttpGet]
        public object Get()
        {
            var input = ParseInput();
            var visio = GenerateVisio(input);
            return File(visio, "application/octet-stream", "visio.vsdx");
        }

        private Input ParseInput()
        {
            var inputPath = Path.Combine(_hostEnvironment.ContentRootPath, @"_Resources\data.json");

            var json = System.IO.File.ReadAllText(inputPath);
            var input = JsonConvert.DeserializeObject<Input>(json);

            return input;
        }

        private byte[] GenerateVisio(Input input)
        {
            byte[] bytes = null;

            using (MemoryStream zipStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
                {
                    AddTemplateFileToZip(archive, @"[Content_Types].xml");
                    AddTemplateFileToZip(archive, @"_rels\.rels");
                    AddTemplateFileToZip(archive, @"docProps\app.xml");
                    AddTemplateFileToZip(archive, @"docProps\core.xml");
                    AddTemplateFileToZip(archive, @"docProps\custom.xml");
                    AddTemplateFileToZip(archive, @"docProps\thumbnail.emf");
                    AddTemplateFileToZip(archive, @"visio\document.xml");
                    AddTemplateFileToZip(archive, @"visio\windows.xml");
                    AddTemplateFileToZip(archive, @"visio\_rels\document.xml.rels");
                    AddTemplateFileToZip(archive, @"visio\pages\pages.xml");
                    AddTemplateFileToZip(archive, @"visio\pages\_rels\pages.xml.rels");

                    AddVisioPageToZip(archive, input);
                }
                zipStream.Position = 0; //reset memory stream position.
                bytes = zipStream.ToArray(); //get all flushed data
            }

            return bytes;
        }

        private void AddTemplateFileToZip(ZipArchive archive, string relativePath)
        {
            var entry = archive.CreateEntry(relativePath);

            var templatePath = Path.Combine(_hostEnvironment.ContentRootPath, @"_Resources\visio_template", relativePath);

            using (var zipEntry = entry.Open())
            using (var file = new FileStream(templatePath, FileMode.Open))
            {
                file.CopyTo(zipEntry);
            }
        }

        private void AddVisioPageToZip(ZipArchive archive, Input input)
        {
            var entry = archive.CreateEntry(@"visio\pages\page1.xml");

            var output = ConvertData(input);
            var xml = SerializeOutput(output);

            using (var writer = new StreamWriter(entry.Open()))
            {
                writer.Write(xml);
            }
        }

        private Output ConvertData(Input input)
        {
            if (input == null)
                throw new ArgumentNullException(nameof(input));

            var output = new Output();

            output.Shapes = input.Elements
                .Select(e => new OutputShape
                {
                    //map properties
                })
                .ToList();

            output.Connects = input.Connections
                .Select(e => new OutputConnect
                {
                    //map properties
                })
                .ToList();

            //map data prop

            return output;
        }

        private string SerializeOutput(Output output)
        {
            var serializer = new XmlSerializer(output.GetType(), "http://schemas.microsoft.com/office/visio/2012/main");

            var namespaces = new XmlSerializerNamespaces();
            namespaces.Add("r", "http://schemas.openxmlformats.org/officeDocument/2006/relationships");

            var settings = new XmlWriterSettings();
            settings.Encoding = Encoding.UTF8;
            settings.Indent = false;
            settings.OmitXmlDeclaration = false;

            using (var stream = new StringWriter())
            using (var writer = XmlWriter.Create(stream, settings))
            {
                serializer.Serialize(writer, output, namespaces);
                return stream.ToString();
            }
        }
    }
}
