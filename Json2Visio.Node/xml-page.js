var xmlUtils = require('./xml-utils');
var Rect = require('./shapes/rect');

var xmlDoc = null;

var idsMap = {};
var idsCounter = 1;

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

function createShape(shapes, element)
{
  var figure;
  switch (element.shape)
  {
    case 'ellipse':
      figure = new Rect(element); //should instantiate Ellipse
      break;
    case 'box':
    default:
      figure = new Rect(element);
      break;
  }
  
  var shapeId = mapId(element.id);
  var shape = figure.createShape(xmlDoc, shapeId);
  shape.setAttribute("Type", "Shape");
  
  shapes.appendChild(shape);
}

function createEdge(shapes, connection)
{
  var shape = xmlUtils.createElt(xmlDoc, "Shape");
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

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", bounds.x + hw));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", parentHeight - bounds.y - hh));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", bounds.width));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", bounds.height));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", hw));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", hh));

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
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "BeginX", bounds.x + p0.x, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "BeginY", parentHeight - bounds.y + p0.y, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));

  var pe = calcVsdxPoint(points[points.length - 1], true);
  
  //Formula is used to make the edge dynamic 
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "EndX", bounds.x + pe.x, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "EndY", parentHeight - bounds.y + pe.y, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));

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

  var connectBegin = xmlUtils.createElt(xmlDoc, "Connect");
  connectBegin.setAttribute("FromSheet", mapId(connectionId));
  connectBegin.setAttribute("FromCell", "BeginX");
  connectBegin.setAttribute("ToSheet", mapId(connection.fromElementId));
  connects.appendChild(connectBegin);

  var connectEnd = xmlUtils.createElt(xmlDoc, "Connect");
  connectEnd.setAttribute("FromSheet", mapId(connectionId));
  connectEnd.setAttribute("FromCell", "EndX");
  connectEnd.setAttribute("ToSheet", mapId(connection.toElementId));
  connects.appendChild(connectEnd);    
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

function createConnectionSectionElem(points)
{
  var geoIndex = 0;
  var section = xmlUtils.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", geoIndex++);

  section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoFill", "0"));
  section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoLine", "1"));
  //missing NoShow, NoSnap, NoQuickDrag

  section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, points[0].x, points[0].y));
	section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, points[1].x, points[1].y));

  return section;
}

function getPageXml(input)
{
  xmlDoc = xmlUtils.createXmlDocument();
  var root = xmlUtils.createElt(xmlDoc, "PageContents");

  root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', xmlUtils.XMLNS);
  root.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:r", xmlUtils.XMLNS_R);

  //Elements
  var shapes = xmlUtils.createElt(xmlDoc, "Shapes");
  root.appendChild(shapes);

  for (var element of input.elements) 
  {
    createShape(shapes, element);
  }

  //Connects
  var connects = xmlUtils.createElt(xmlDoc, "Connects");
  root.appendChild(connects);

  for (var connection of input.connections) 
  {
    createEdge(shapes, connection);
    createConnect(connects, connection);
  }

  xmlDoc.appendChild(root);
  var content = xmlUtils.xmlToString(xmlDoc);

  return content;
}

module.exports = getPageXml;