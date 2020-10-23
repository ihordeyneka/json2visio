using System;
using System.IO;
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
            return File(visio, "application/octet-stream");
            //Mime type:	application/visio, application/x-visio, application/vnd.visio, application/visio.drawing, application/vsd, application/x-vsd, image/x-vsd, zz-application/zz-winassoc-vsd
        }

        private Input ParseInput()
        {
            var webRoot = _hostEnvironment.ContentRootPath;
            var inputPath = Path.Combine(webRoot, @"_Resources\data.json");

            var json = System.IO.File.ReadAllText(inputPath);
            var input = JsonConvert.DeserializeObject<Input>(json);

            return input;
        }

        private Stream GenerateVisio(Input input)
        {
            return null;
        }
    }
}
