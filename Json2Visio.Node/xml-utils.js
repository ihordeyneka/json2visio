var jsdom = require('jsdom');
var window = (new jsdom.JSDOM()).window;
var document = window.document;

var self = {
  CONVERSION_FACTOR: 40 * 2.54, //screenCoordinatesPerCm (40) x CENTIMETERS_PER_INCHES (2.54)
  XMLNS: "http://schemas.microsoft.com/office/visio/2012/main",
  XMLNS_R: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  RELS_XMLNS: "http://schemas.openxmlformats.org/package/2006/relationships"
};


var DIRECTION = {
  TOP: 0,
  RIGHT: 1,
  BOTTOM: 2,
  LEFT: 3
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
  textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 0));
  textElt.appendChild(self.createEltWithIX(xmlDoc, "pp", 0));
  textElt.appendChild(self.createEltWithIX(xmlDoc, "tp", 0));
  textElt.appendChild(xmlDoc.createTextNode(name + "\n"));
  textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 1));
  textElt.appendChild(xmlDoc.createTextNode(subName || ""));
  // if (subName) {
  //   textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 0));
  //   textElt.appendChild(self.createEltWithIX(xmlDoc, "pp", 0));
  //   textElt.appendChild(self.createEltWithIX(xmlDoc, "tp", 0));
  //   textElt.appendChild(xmlDoc.createTextNode(name + "\n"));
  //   textElt.appendChild(self.createEltWithIX(xmlDoc, "cp", 1));
  //   textElt.appendChild(xmlDoc.createTextNode(subName || ""));
  // }
  // else {
  //   textElt.appendChild(xmlDoc.createTextNode(name));
  // }
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

self.createRightAngleGeo = function(xmlDoc, connectPoints, fromShape, toShape) {
  var section = self.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", 0);

  var index = 2;
  var horizontal = connectPoints[0].x;
  var vertical = connectPoints[0].y;

  var goVertical = null;
  var corners = [connectPoints[0]];

  //walk through connect points and determine coords of corner points
  for (var i = 1; i < connectPoints.length; i++) {
    if (i + 1 < connectPoints.length && goVertical == null) {
      var vectAngle = Math.abs(self.getVectorsAngle(connectPoints[i - 1], connectPoints[i + 1]));
      goVertical = vectAngle > Math.PI / 4 && vectAngle < Math.PI * 3 / 4;
    }

    if (goVertical) {
      vertical = connectPoints[i].y;
      corners.push({x: horizontal, y: vertical});

      horizontal = connectPoints[i].x;
      corners.push({x: horizontal, y: vertical});

      goVertical = horizontal == 0;
    } else {
      horizontal = connectPoints[i].x;
      corners.push({x: horizontal, y: vertical});

      vertical = connectPoints[i].y;
      corners.push({x: horizontal, y: vertical});

      goVertical = vertical != 0;
    }
  }

  //add more corners to walk around shapes if needed
  var beginWalkAroundCorners = self.produceWalkAroundCorners(corners[0], corners[1], fromShape.element)
  if (beginWalkAroundCorners.length > 0) {
    corners.splice(1, 0, ...(beginWalkAroundCorners.reverse()));
  }

  var last = corners.length - 1;
  var endWalkAroundCorners = self.produceWalkAroundCorners(corners[last], corners[last - 1], toShape.element)
  if (endWalkAroundCorners.length > 0) {
    corners.splice(last, 0, ...endWalkAroundCorners);
  }

  //remove points which are not corners (on the same line as previous and next)
  //this helps in Visio Online when dragging
  //then draw lines
  for (var i = 1; i < corners.length; i++) {
    var redundant = (i > 0 && i + 1 < corners.length) &&
      (corners[i - 1].x === corners[i + 1].x || corners[i - 1].y === corners[i + 1].y);
    if (redundant) {
      corners.splice(i, 1);
      i--;      
    } else {
      section.appendChild(self.createRowScaled(xmlDoc, "LineTo", index++, corners[i].x - connectPoints[0].x, corners[i].y - connectPoints[0].y));
    }
  }
  
  return section;
};

self.produceWalkAroundCorners = function(shapeConnect, cornerConnect, shape) {
  var walkAroundCorners = [];

  var shapeLeft = shape.x - shape.width/2;
  var shapeTop = self.PAGE_HEIGHT - shape.y + shape.height/2;
  var shapeRight = shape.x + shape.width/2;
  var shapeBottom = self.PAGE_HEIGHT - shape.y - shape.height/2;

  var margin = 20;

  var side = self.getShapeConnectSide(shape, shapeConnect);

  if (cornerConnect.x > shapeConnect.x)
  {
    if (side.primary == DIRECTION.LEFT) {
      var walkAroundY = side.secondary == DIRECTION.TOP ? shapeTop + margin : shapeBottom - margin;
      walkAroundCorners.push({x: cornerConnect.x, y: walkAroundY});
      walkAroundCorners.push({x: shapeConnect.x - margin, y: walkAroundY});
      walkAroundCorners.push({x: shapeConnect.x - margin, y: shapeConnect.y});
    } else if (side.primary == DIRECTION.TOP) {
      walkAroundCorners.push({x: cornerConnect.x, y: shapeTop + margin});
      walkAroundCorners.push({x: shapeConnect.x, y: shapeTop + margin});
    } else if (side.primary == DIRECTION.BOTTOM) {
      walkAroundCorners.push({x: cornerConnect.x, y: shapeBottom - margin});
      walkAroundCorners.push({x: shapeConnect.x, y: shapeBottom - margin});
    }
  } else if (cornerConnect.x < shapeConnect.x)
  {
    if (side.primary == DIRECTION.RIGHT) {
      var walkAroundY = side.secondary == DIRECTION.TOP ? shapeTop + margin : shapeBottom - margin;
      walkAroundCorners.push({x: cornerConnect.x, y: walkAroundY});
      walkAroundCorners.push({x: shapeConnect.x + margin, y: walkAroundY});
      walkAroundCorners.push({x: shapeConnect.x + margin, y: shapeConnect.y});
    } else if (side.primary == DIRECTION.TOP) {
      walkAroundCorners.push({x: cornerConnect.x, y: shapeTop + margin});
      walkAroundCorners.push({x: shapeConnect.x, y: shapeTop + margin});
    } else if (side.primary == DIRECTION.BOTTOM) {
      walkAroundCorners.push({x: cornerConnect.x, y: shapeBottom - margin});
      walkAroundCorners.push({x: shapeConnect.x, y: shapeBottom - margin});
    }
  }
  else if (cornerConnect.y > shapeConnect.y)
  {
    if (side.primary == DIRECTION.BOTTOM) {
      var walkAroundX = side.secondary == DIRECTION.RIGHT ? shapeRight + margin : shapeLeft - margin;
      walkAroundCorners.push({x: walkAroundX, y: cornerConnect.y});
        walkAroundCorners.push({x: walkAroundX, y: shapeConnect.y - margin});
        walkAroundCorners.push({x: shapeConnect.x, y: shapeConnect.y - margin});
    } else if (side.primary == DIRECTION.RIGHT) {
      walkAroundCorners.push({x: shapeRight + margin, y: cornerConnect.y});
      walkAroundCorners.push({x: shapeRight + margin, y: shapeConnect.y});
    } else if (side.primary == DIRECTION.LEFT) {
      walkAroundCorners.push({x: shapeLeft - margin, y: cornerConnect.y});
      walkAroundCorners.push({x: shapeLeft - margin, y: shapeConnect.y});
    }
  }
  else if (cornerConnect.y < shapeConnect.y)
  {
    if (side.primary == DIRECTION.TOP) {
      var walkAroundX = side.secondary == DIRECTION.RIGHT ? shapeRight + margin : shapeLeft - margin;
      walkAroundCorners.push({x: walkAroundX, y: cornerConnect.y});
      walkAroundCorners.push({x: walkAroundX, y: shapeConnect.y + margin});
      walkAroundCorners.push({x: shapeConnect.x, y: shapeConnect.y + margin});
    } else if (side.primary == DIRECTION.RIGHT) {
      walkAroundCorners.push({x: shapeRight + margin, y: cornerConnect.y});
      walkAroundCorners.push({x: shapeRight + margin, y: shapeConnect.y});
    } else if (side.primary == DIRECTION.LEFT) {
      walkAroundCorners.push({x: shapeLeft - margin, y: cornerConnect.y});
      walkAroundCorners.push({x: shapeLeft - margin, y: shapeConnect.y});
    }
  }

  return walkAroundCorners;
}

self.getShapeConnectSide = function(shape, shapeConnect) {
  var shapeLeft = shape.x - shape.width/2;
  var shapeTop = self.PAGE_HEIGHT - shape.y + shape.height/2;
  var shapeRight = shape.x + shape.width/2;
  var shapeBottom = self.PAGE_HEIGHT - shape.y - shape.height/2;

  var distances = [
    {side: DIRECTION.LEFT, isHorizontal: true, distance: Math.abs(shapeLeft - shapeConnect.x)},
    {side: DIRECTION.TOP, isHorizontal: false, distance: Math.abs(shapeTop - shapeConnect.y)},
    {side: DIRECTION.RIGHT, isHorizontal: true, distance: Math.abs(shapeRight - shapeConnect.x)},
    {side: DIRECTION.BOTTOM, isHorizontal: false, distance: Math.abs(shapeBottom - shapeConnect.y)},
  ];

  distances = distances.sort((d1, d2) => d1.distance - d2.distance);

  var primaryDistance = distances[0];
  var secondaryDistance = distances.find(d => d.isHorizontal != primaryDistance.isHorizontal);

  return {
    primary: primaryDistance.side,
    secondary: secondaryDistance.side
  }
}

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
  var normalized = -degrees; //counterclockwise change to clockwise
  return normalized * (Math.PI / 180);
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