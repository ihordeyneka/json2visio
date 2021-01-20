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

self.createXmlDocument = function() {
  return document.implementation.createDocument("", "", null);
};

self.createEltWithIX = function(xmlDoc, name, ix) {
  var el = self.createElt(xmlDoc, name);
  el.setAttribute("IX", ix);
  return el;
};

self.createElt = function(xmlDoc, name, ns) {
  if (!ns)
    ns = self.XMLNS;

  return (xmlDoc.createElementNS != null) ? xmlDoc.createElementNS(ns, name) : xmlDoc.createElement(name);
};

self.createCellElemScaled = function(xmlDoc, name, val, formula) {
  return self.createCellElem(xmlDoc, name, val / self.CONVERSION_FACTOR, formula);
};

self.createCellElem = function(xmlDoc, name, val, formula) {
  var cell = self.createElt(xmlDoc, "Cell");
  cell.setAttribute("N", name);
  cell.setAttribute("V", val);

  if (formula) cell.setAttribute("F", formula);

  return cell;
};

self.createRowScaled = function(xmlDoc, type, index, x, y, xF, yF, a, b, c, d, aF, bF, cF, dF, aU, bU) {
  return self.createRowRel(xmlDoc, type, index, x / self.CONVERSION_FACTOR, y / self.CONVERSION_FACTOR, xF, yF,
    a / self.CONVERSION_FACTOR, b / self.CONVERSION_FACTOR, c, d, aF, bF, cF, dF, aU, bU);
};

self.createRowRel = function(xmlDoc, type, index, x, y, xF, yF, a, b, c, d, aF, bF, cF, dF, aU, bU) {
  var row = self.createElt(xmlDoc, "Row");
  row.setAttribute("T", type);
  row.setAttribute("IX", index);
  row.appendChild(self.createCellElem(xmlDoc, "X", x, xF));
  row.appendChild(self.createCellElem(xmlDoc, "Y", y, yF));

  if (a !== undefined && a !== null && !Number.isNaN(a)) {
    row.appendChild(self.createCellElem(xmlDoc, "A", a, aF, aU));
    row.appendChild(self.createCellElem(xmlDoc, "B", b, bF, bU));
    row.appendChild(self.createCellElem(xmlDoc, "C", c, cF));
    row.appendChild(self.createCellElem(xmlDoc, "D", d, dF));
  }

  return row;
};

self.createTextElem = function(xmlDoc, name, subName) {
  var textElt = self.createElt(xmlDoc, "Text");
  if (subName) {
    textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 0));
    textElt.appendChild(self.createEltWithIX(xmlDoc, "pp", 0));
    textElt.appendChild(self.createEltWithIX(xmlDoc, "tp", 0));
    textElt.appendChild(xmlDoc.createTextNode(name + "\n"));
    textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 1));
    textElt.appendChild(xmlDoc.createTextNode(subName));
  }
  else {
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

self.createStraightLineGeo = function(xmlDoc, width, height) {
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
  var len = connectPoints.length;
  var vectAngle = Math.abs(self.getVectorsAngle(connectPoints[0], connectPoints[len - 1]));
  if (vectAngle > Math.PI / 4 && vectAngle < Math.PI * 3 / 4) {
    vertical = connectPoints[1].y - connectPoints[0].y;
    section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));

    horizontal = connectPoints[1].x - connectPoints[0].x;
    section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));

    for (var i = 2; i < connectPoints.length; i++) {
      horizontal = connectPoints[i].x - connectPoints[0].x;
      section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));

      vertical = connectPoints[i].y - connectPoints[0].y;
      section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));
    }
  }
  else {
    horizontal = connectPoints[1].x - connectPoints[0].x;
    section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));

    vertical = connectPoints[1].y - connectPoints[0].y;
    section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));

    for (var i = 2; i < connectPoints.length; i++) {
      vertical = connectPoints[i].y - connectPoints[0].y;
      section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));

      horizontal = connectPoints[i].x - connectPoints[0].x;
      section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, horizontal, vertical));
    }
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
  return degrees * (Math.PI / 180);
};

self.rotatePoint = function(point, center, degrees) {
  if (!degrees)
    return point;

  var radians = self.degressToRadians(degrees);
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  var nx = (cos * (point.x - center.x)) + (sin * (point.y - center.y)) + center.x;
  var ny = (cos * (point.y - center.y)) - (sin * (point.x - center.x)) + center.y;
  return { x: nx, y: ny };
}

self.xmlToString = function(xmlDoc) {
  var content = (new window.XMLSerializer()).serializeToString(xmlDoc);
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + content;
};

//find angle between vector (beginPoint,endPoint) and (0,1)
self.getVectorsAngle = function(beginPoint, endPoint)
{
  var dist = Math.sqrt((endPoint.x - beginPoint.x) * (endPoint.x - beginPoint.x) +
    (endPoint.y - beginPoint.y) * (endPoint.y - beginPoint.y));
  return Math.acos(((endPoint.y - beginPoint.y) / dist));
}

module.exports = self;