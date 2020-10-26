var jsdom = require('jsdom');
var window = (new jsdom.JSDOM()).window;
var document = window.document;

var xmlDoc = null;

var that = {
  CONVERSION_FACTOR: 40 * 2.54, //screenCoordinatesPerCm (40) x CENTIMETERS_PER_INCHES (2.54)
  XMLNS: "http://schemas.microsoft.com/office/visio/2012/main",
  XMLNS_R: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
}

var idsMap = {};
var idsCounter = 1;

function createXmlDocument()
{
  xmlDoc = document.implementation.createDocument("", "", null);
}

function createElt(name)
{
  return (xmlDoc.createElementNS != null) ? xmlDoc.createElementNS(that.XMLNS, name) : xmlDoc.createElement(name);
}

function createCellElemScaled(name, val, formula)
{
  return createCellElem(name, val / that.CONVERSION_FACTOR, formula);
};

function createCellElem(name, val, formula)
{
  var cell = createElt("Cell");
  cell.setAttribute("N", name);
  cell.setAttribute("V", val);
  
  if (formula) cell.setAttribute("F", formula);
  
  return cell;
};

function createRowScaled(type, index, x, y, xF, yF) 
{
	return createRowRel(type, index, x / that.CONVERSION_FACTOR, y / that.CONVERSION_FACTOR, xF, yF);
};

function createRowRel(type, index, x, y, xF, yF) 
{
	var row = createElt("Row");
	row.setAttribute("T", type);
	row.setAttribute("IX", index);
	row.appendChild(createCellElem("X", x, xF));
	row.appendChild(createCellElem("Y", y, yF));
	
	return row;
};

function createRectSectionElem(geo)
{
  var geoIndex = 0;
  var section = createElt("Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", geoIndex++);

  section.appendChild(createCellElem("NoFill", "0"));
  section.appendChild(createCellElem("NoLine", "1"));
  //missing NoShow, NoSnap, NoQuickDrag

  //hardcode rect
  var x = geo.x;
  var y = geo.y;
  var w = geo.width;
	var h = geo.height;

  section.appendChild(createRowScaled("MoveTo", geoIndex++, x, y));
	section.appendChild(createRowScaled("LineTo", geoIndex++, x + w, y));
	section.appendChild(createRowScaled("LineTo", geoIndex++, x + w, y - h));
	section.appendChild(createRowScaled("LineTo", geoIndex++, x, y - h));
	section.appendChild(createRowScaled("LineTo", geoIndex++, x, y));

  return section;
}

function createConnectionSectionElem(points)
{
  var geoIndex = 0;
  var section = createElt("Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", geoIndex++);

  section.appendChild(createCellElem("NoFill", "0"));
  section.appendChild(createCellElem("NoLine", "1"));
  //missing NoShow, NoSnap, NoQuickDrag

  section.appendChild(createRowScaled("MoveTo", geoIndex++, points[0].x, points[0].y));
	section.appendChild(createRowScaled("LineTo", geoIndex++, points[1].x, points[1].y));

  return section;
}

function createTextElem(val)
{
  var textElt = createElt("Text");
  var text = xmlDoc.createTextNode(val);
  textElt.appendChild(text);
  return textElt;
};

function xmlToString()
{
  var content = (new window.XMLSerializer()).serializeToString(xmlDoc);
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + content;
}

function mapId(inputId)
{
  var generatedId = idsMap[inputId];
  
  if (generatedId == null)
  {
    generatedId = idsCounter++;
    idsMap[inputId] = generatedId;
  }
  return generatedId;
}

function getGeoByElement(element)
{
  return {
    width: 120, //hardcoded
    height: 60,
    x: element.x,
    y: element.y
  };
}

function getConnectBounds(connection)
{
  return {
    width: 120, //hardcoded
    height: 120,
    x: 200,
    y: 300
  };
}

function createShape(shapes, element)
{
  var shape = createElt("Shape");
  var shapeId = mapId(element.id);

  var geo = getGeoByElement(element);
  var parentHeight = 1200; //hardcoded
  var layerIndex = 0;
		
  shape.setAttribute("ID", shapeId);
  shape.setAttribute("NameU", "Shape" + shapeId);
  shape.setAttribute("LineStyle", "0");
  shape.setAttribute("FillStyle", "0");
  shape.setAttribute("TextStyle", "0");
  //missing IsCustomNameU, Name, IsCustomName, Type
  
  var hw = geo.width/2, hh = geo.height/2;
  
  shape.appendChild(createCellElemScaled("PinX", geo.x + hw));
  shape.appendChild(createCellElemScaled("PinY", parentHeight - geo.y - hh));
  shape.appendChild(createCellElemScaled("Width", geo.width));
  shape.appendChild(createCellElemScaled("Height", geo.height));
  shape.appendChild(createCellElemScaled("LocPinX", hw));
  shape.appendChild(createCellElemScaled("LocPinY", hh));
  shape.appendChild(createCellElem("LayerMember", layerIndex + ""));
  //missing Angle, FlipX, FlipY, ResizeMode, FillForegnd, LineColor, Rounding

  shape.appendChild(createRectSectionElem(geo));
  shape.appendChild(createTextElem(element.name));
  shape.setAttribute("Type", "Shape");
  
  shapes.appendChild(shape);
}

function createEdge(shapes, connection)
{
  var shape = createElt("Shape");
  var connectionId = mapId(connection.fromElementId + connection.toElementId);

  var bounds = getConnectBounds(connection);
  var parentHeight = 1200; //hardcoded
  var layerIndex = 0;

  shape.setAttribute("ID", connectionId);
  shape.setAttribute("NameU", "Dynamic connector." + connectionId);
  shape.setAttribute("Name", "Dynamic connector." + connectionId);
  shape.setAttribute("Type", "Shape");
  shape.setAttribute("Master", "4"); //Dynamic Connector Master

  var hw = bounds.width/2, hh = bounds.height/2;

  shape.appendChild(createCellElemScaled("PinX", bounds.x + hw));
  shape.appendChild(createCellElemScaled("PinY", parentHeight - bounds.y - hh));
  shape.appendChild(createCellElemScaled("Width", bounds.width));
  shape.appendChild(createCellElemScaled("Height", bounds.height));
  shape.appendChild(createCellElemScaled("LocPinX", hw));
  shape.appendChild(createCellElemScaled("LocPinY", hh));

  var points = [{x: 120, y: 120}, {x: 240, y: 240}]; 
  var calcVsdxPoint = function(p, noHeight) 
  {
    var x = p.x, y = p.y;
    //x = (x - bounds.x + s.dx);
    //y = ((noHeight? 0 : bounds.height) - y * s.scale + bounds.y - s.dy - (isChild? 0 : vsdxCanvas.shiftY)) ;
    return {x: x, y: y};
  };

  var p0 = calcVsdxPoint(points[0], true);
  
  //Formula is used to make the edge dynamic 
  shape.appendChild(createCellElemScaled("BeginX", bounds.x + p0.x, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));
  shape.appendChild(createCellElemScaled("BeginY", parentHeight - bounds.y + p0.y, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));

  var pe = calcVsdxPoint(points[points.length - 1], true);
  
  //Formula is used to make the edge dynamic 
  shape.appendChild(createCellElemScaled("EndX", bounds.x + pe.x, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));
  shape.appendChild(createCellElemScaled("EndY", parentHeight - bounds.y + pe.y, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));

  //Formula is used to make the edge dynamic (specify source id and target id)
  shape.appendChild(createCellElem("BegTrigger", "2", cell.source? "_XFTRIGGER(Sheet."+ getCellVsdxId(cell.source.id) +"!EventXFMod)" : null));
  shape.appendChild(createCellElem("EndTrigger", "2", cell.target? "_XFTRIGGER(Sheet."+ getCellVsdxId(cell.target.id) +"!EventXFMod)" : null));
  shape.appendChild(createCellElem("ConFixedCode", "6"));
  shape.appendChild(createCellElem("LayerMember", layerIndex + ""));

  shape.appendChild(createCellElem("BeginArrow", "0"));
  shape.appendChild(createCellElem("BeginArrowSize", "2"));
  shape.appendChild(createCellElem("EndArrow", "1"));
  shape.appendChild(createCellElem("EndArrowSize", "2"));
  //missing FillPattern, LineColor, Rounding, TextBkgnd

  createConnectionSectionElem(points);

  shapes.appendChild(shape);
}

function createConnect(connects, connection)
{
  var connectionId = mapId(connection.fromElementId + connection.toElementId);

  var connectBegin = createElt("Connect");
  connectBegin.setAttribute("FromSheet", mapId(connectionId));
  connectBegin.setAttribute("FromCell", "BeginX");
  connectBegin.setAttribute("ToSheet", mapId(connection.fromElementId));
  connects.appendChild(connectBegin);

  var connectEnd = createElt("Connect");
  connectEnd.setAttribute("FromSheet", mapId(connectionId));
  connectEnd.setAttribute("FromCell", "EndX");
  connectEnd.setAttribute("ToSheet", mapId(connection.toElementId));
  connects.appendChild(connectEnd);    
}

function getPageXml(input)
{
  createXmlDocument();
  var root = createElt("PageContents");

  root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', that.XMLNS);
  root.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:r", that.XMLNS_R);

  //Elements
  var shapes = createElt("Shapes");
  root.appendChild(shapes);

  for (var element of input.elements) 
  {
    createShape(shapes, element);
  }

  //Connects
  var connects = createElt("Connects");
  root.appendChild(connects);

  for (var connection of input.connections) 
  {
    createEdge(shapes, connection);
    createConnect(connects, connection);
  }

  xmlDoc.appendChild(root);
  var content = xmlToString();

  return content;
}

module.exports = getPageXml;