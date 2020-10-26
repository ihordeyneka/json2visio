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
    'visio/masters/masters.xml',
    'visio/masters/master1.xml',
    'visio/masters/_rels/masters.xml.rels',
    'visio/_rels/document.xml.rels',
    'visio/pages/pages.xml',
    'visio/pages/_rels/pages.xml.rels',
    'visio/pages/_rels/page1.xml.rels'
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
  var file = 'visio/pages/page1.xml';

  var templatePath = path.join('visio_template', file);
  var data = fs.readFileSync(templatePath);
  zip.file(file, data);
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