var jsdom = require('jsdom');
var window = (new jsdom.JSDOM()).window;
var document = window.document;

var that = {
  XMLNS: "http://schemas.microsoft.com/office/visio/2012/main"
};

function createXmlDocument()
{
  return document.implementation.createDocument("", "", null);
}

function createElt(doc, ns, name)
{
  return (doc.createElementNS != null) ? doc.createElementNS(ns, name) : doc.createElement(name);
}

function xmlToString(xmlDoc)
{
  var content = (new window.XMLSerializer()).serializeToString(xmlDoc);
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + content;
};

function getPageXml(input)
{
  var xmlDoc = createXmlDocument();
  var root = createElt(xmlDoc, that.XMLNS, "PageContents");

  //TODO: process input

  xmlDoc.appendChild(root);
  var content = xmlToString(xmlDoc);

  return content;
};

module.exports = getPageXml;