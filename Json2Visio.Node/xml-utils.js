var jsdom = require('jsdom');
var window = (new jsdom.JSDOM()).window;
var document = window.document;

var self = {
  CONVERSION_FACTOR: 40 * 2.54, //screenCoordinatesPerCm (40) x CENTIMETERS_PER_INCHES (2.54)
  XMLNS: "http://schemas.microsoft.com/office/visio/2012/main",
  XMLNS_R: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  RELS_XMLNS: "http://schemas.openxmlformats.org/package/2006/relationships"
};

self.PAGE_HEIGHT = 11 * self.CONVERSION_FACTOR;

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

self.createElt = function(xmlDoc, name, ns)
{
  if (!ns)
    ns = self.XMLNS;

  return (xmlDoc.createElementNS != null) ? xmlDoc.createElementNS(ns, name) : xmlDoc.createElement(name);
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

self.createRowScaled = function(xmlDoc, type, index, x, y, xF, yF, a, b, c, d, aF, bF, cF, dF, aU, bU) 
{
  return self.createRowRel(xmlDoc, type, index, x / self.CONVERSION_FACTOR, y / self.CONVERSION_FACTOR, xF, yF,
    a / self.CONVERSION_FACTOR, b / self.CONVERSION_FACTOR, c, d, aF, bF, cF, dF, aU, bU);
};

self.createRowRel = function(xmlDoc, type, index, x, y, xF, yF, a, b, c, d, aF, bF, cF, dF, aU, bU) 
{
	var row = self.createElt(xmlDoc, "Row");
	row.setAttribute("T", type);
	row.setAttribute("IX", index);
	row.appendChild(self.createCellElem(xmlDoc, "X", x, xF));
  row.appendChild(self.createCellElem(xmlDoc, "Y", y, yF));
  
  if (a !== undefined && a !== null && !Number.isNaN(a))
  {
    row.appendChild(self.createCellElem(xmlDoc, "A", a, aF, aU));
    row.appendChild(self.createCellElem(xmlDoc, "B", b, bF, bU));
    row.appendChild(self.createCellElem(xmlDoc, "C", c, cF));
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

self.getLinePattern = function(pattern) {
  switch (pattern) {
    case 'dash':
      return 2;
    case 'transparent':
      return 0;
    default:
      return 1;
  }
};

self.createStraightLineGeo = function(xmlDoc, width, height)
{
  var section = self.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", 0);
  //missing NoShow, NoSnap, NoQuickDrag

	section.appendChild(self.createRowScaled(xmlDoc, "LineTo", 2, width, height));

  return section;
}

self.createRightAngleGeo = function(xmlDoc, connectPoints) {
  var section = self.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", 0);

  var index = 2;
  var horizontal = 0;
  var vertical = 0;

  for (var i = 1; i < connectPoints.length; i++) {
    horizontal = connectPoints[i].x - connectPoints[0].x;
    section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));

    vertical = connectPoints[i].y - connectPoints[0].y;
    section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));
  }

  return section;
};

self.createShapeConnects = function(xmlDoc, shape, connectPoints) {
  var section = self.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Connection");
  section.setAttribute("IX", 0);
  //missing NoShow, NoSnap, NoQuickDrag

  var rowIndex = 0;
  for (var point of connectPoints) {
    section.appendChild(self.createRowScaled(xmlDoc, "Connection", rowIndex++, point.x, point.y));
  }

  shape.appendChild(section);
};

self.degressToRadians = function(degrees) {
  return degrees * (Math.PI/180);
};

self.rotatePoint = function(point, center, degrees) {
  if (!degrees)
    return point;

  var radians = self.degressToRadians(degrees);
  var pX = point.x - center.x;
  var pY = point.y - center.y;
  xNew = Math.sqrt(pX * pX + pY * pY) * Math.cos(Math.atan(pY / pX) - radians) + center.x;
  yNew = Math.sqrt(pX * pX + pY * pY) * Math.sin(Math.atan(pY / pX) - radians) + center.y;
  return { x: xNew, y: yNew };
}

self.xmlToString = function(xmlDoc)
{
  var content = (new window.XMLSerializer()).serializeToString(xmlDoc);
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + content;
};

module.exports = self;