var JSZip = require('JSZip');
var path = require('path');
var fs = require('fs');
var xmlPage = require('./xml-page');

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
    'visio/masters/master2.xml',
    'visio/masters/master4.xml',
    'visio/masters/master5.xml',
    'visio/masters/_rels/masters.xml.rels',
    'visio/_rels/document.xml.rels',
    'visio/pages/pages.xml',
    'visio/pages/_rels/pages.xml.rels'
    //'visio/pages/page1.xml', //this file is the actual diagram and we will replace its content based on the input
    //'visio/pages/_rels/page1.xml.rels' //this file is also updated
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
  var pageRel = 'visio/pages/_rels/page1.xml.rels';
  var pageRelContent = xmlPage.getPageRelXml(zip, input);
  zip.file(pageRel, pageRelContent);

  for(var data of input.data) {
    var mediaPath = 'visio/media/' + data.file;
    var mediaContent = fs.readFileSync('input/' + data.file);
    zip.file(mediaPath, mediaContent); 
  }
  
  var page = 'visio/pages/page1.xml';
  var pageContent = xmlPage.getPageXml(input);
  zip.file(page, pageContent);
}

function vsdxExport(input, options)
{
  var zip = new JSZip();
  createVsdxSkeleton(zip);
  addPageXML(zip, input);

  zip.generateAsync({type:'base64', compression: "DEFLATE"}).then(
    function(content) {
      fs.writeFile(options.exportPath, content, 'base64', () => {
        console.log('VSDX generated');
      });
    }
  );
};

module.exports = vsdxExport;