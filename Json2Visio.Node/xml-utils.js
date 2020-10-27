var jsdom = require('jsdom');
var window = (new jsdom.JSDOM()).window;
var document = window.document;

var self = {
  PAGE_HEIGHT: 1200,
  CONVERSION_FACTOR: 40 * 2.54, //screenCoordinatesPerCm (40) x CENTIMETERS_PER_INCHES (2.54)
  XMLNS: "http://schemas.microsoft.com/office/visio/2012/main",
  XMLNS_R: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
};

self.createXmlDocument = function()
{
  return document.implementation.createDocument("", "", null);
};

self.createEltWithIX = function(xmlDoc, name, ix)
{
  var el = self.createElt(xmlDoc, name);
  el.setAttribute("IX", ix);
  return el;
};

self.createElt = function(xmlDoc, name)
{
  return (xmlDoc.createElementNS != null) ? xmlDoc.createElementNS(self.XMLNS, name) : xmlDoc.createElement(name);
};

self.createCellElemScaled = function(xmlDoc, name, val, formula)
{
  return self.createCellElem(xmlDoc, name, val / self.CONVERSION_FACTOR, formula);
};

self.createCellElem = function(xmlDoc, name, val, formula)
{
  var cell = self.createElt(xmlDoc, "Cell");
  cell.setAttribute("N", name);
  cell.setAttribute("V", val);
  
  if (formula) cell.setAttribute("F", formula);
  
  return cell;
};

self.createRowScaled = function(xmlDoc, type, index, x, y, xF, yF, a, b, d, aF, bF, dF) 
{
  return self.createRowRel(xmlDoc, type, index, x / self.CONVERSION_FACTOR, y / self.CONVERSION_FACTOR, xF, yF,
    a / self.CONVERSION_FACTOR, b / self.CONVERSION_FACTOR, d, aF, bF, dF);
};

self.createRowRel = function(xmlDoc, type, index, x, y, xF, yF, a, b, d, aF, bF, dF) 
{
	var row = self.createElt(xmlDoc, "Row");
	row.setAttribute("T", type);
	row.setAttribute("IX", index);
	row.appendChild(self.createCellElem(xmlDoc, "X", x, xF));
  row.appendChild(self.createCellElem(xmlDoc, "Y", y, yF));
  
  if (a !== undefined && a !== null)
  {
    row.appendChild(self.createCellElem(xmlDoc, "A", a, aF));
    row.appendChild(self.createCellElem(xmlDoc, "B", b, bF));
    row.appendChild(self.createCellElem(xmlDoc, "D", d, dF));
  }
	
	return row;
};

self.createTextElem = function(xmlDoc, name, subName)
{
  var textElt = self.createElt(xmlDoc, "Text");
  if (subName)
  {
    textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 0));
    textElt.appendChild(self.createEltWithIX(xmlDoc, "pp", 0));
    textElt.appendChild(self.createEltWithIX(xmlDoc, "tp", 0));
    textElt.appendChild(xmlDoc.createTextNode(name + "\n"));
    textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 1));
    textElt.appendChild(xmlDoc.createTextNode(subName));
  }
  else
  {
    textElt.appendChild(xmlDoc.createTextNode(name));
  }
  return textElt;
};

self.xmlToString = function(xmlDoc)
{
  var content = (new window.XMLSerializer()).serializeToString(xmlDoc);
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + content;
};

module.exports = self;