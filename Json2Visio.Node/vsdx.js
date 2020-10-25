var JSZip = require('JSZip');
var path = require('path');
var fs = require('fs');

function createVsdxSkeleton(zip)
{
  var files = [
    '[Content_Types].xml',
    '_rels/.rels',
    'docProps/app.xml',
    'docProps/core.xml',
    'docProps/custom.xml',
    'docProps/thumbnail.emf',
    'visio/document.xml',
    'visio/windows.xml',
    'visio/_rels/document.xml.rels',
    'visio/pages/pages.xml',
    'visio/pages/_rels/pages.xml.rels'
  ];

  for (var file of files)
  {
    var templatePath = path.join('visio_template', file);
    var data = fs.readFileSync(templatePath);
    zip.file(file, data)
  }
};

function addPageXML(zip, input)
{
  var filePath = 'visio/pages/page1.xml';
  var fileContent = '<?xml version="1.0" encoding="utf-8"?><PageContents xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns="http://schemas.microsoft.com/office/visio/2012/main"><Shapes><OutputShape /><OutputShape /><OutputShape /></Shapes><Connects><OutputConnect /><OutputConnect /><OutputConnect /></Connects></PageContents>';
  zip.file(filePath, fileContent);
}

function VsdxExport(input, options)
{
  var zip = new JSZip();
  createVsdxSkeleton(zip);
  addPageXML(zip, input);

  zip.generateAsync({type:'base64'}).then(
    function(content) {
      fs.writeFile(options.exportPath, content, 'base64', () => {});
    }
  );
};

module.exports = VsdxExport;