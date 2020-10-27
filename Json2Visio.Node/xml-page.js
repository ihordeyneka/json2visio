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

function createEdge(shapes, connection, input)
{
  var shape = xmlUtils.createElt(xmlDoc, "Shape");
  var connectionId = mapId(connection.fromElementId + connection.toElementId);

  var bounds = getConnectBounds(connection, input);
  var layerIndex = 0;

  shape.setAttribute("ID", connectionId);
  shape.setAttribute("NameU", "Dynamic connector." + connectionId);
  shape.setAttribute("Name", "Dynamic connector." + connectionId);
  shape.setAttribute("Type", "Shape");
  shape.setAttribute("Master", "4"); //Dynamic Connector Master

  var beginX = bounds.from.x;
  var endX = bounds.to.x;
  var beginY = xmlUtils.PAGE_HEIGHT - bounds.from.y;
  var endY = xmlUtils.PAGE_HEIGHT - bounds.to.y;

  // beginX = 525;
  // endX = 440;
  // beginY = 880;
  // endY = 720;

  var width = endX - beginX;
  var height = endY - beginY;

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", (beginX + endX)/2, "GUARD((BeginX+EndX)/2)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", (beginY + endY)/2, "GUARD((BeginY+EndY)/2)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", width, "GUARD(EndX-BeginX)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", height, "GUARD(EndY-BeginY)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", width/2, "GUARD(Width*0.5)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", height/2, "GUARD(Height*0.5)"));

  //Formula is used to make the edge dynamic 
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "BeginX", beginX, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "BeginY", beginY, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));
  
  //Formula is used to make the edge dynamic 
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "EndX", endX, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "EndY", endY, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));

  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LayerMember", layerIndex + ""));

  //Formula is used to make the edge dynamic (specify source id and target id)
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BegTrigger", "2", "_XFTRIGGER(Sheet."+ mapId(bounds.from.id) +"!EventXFMod)"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndTrigger", "2", "_XFTRIGGER(Sheet."+ mapId(bounds.to.id) +"!EventXFMod)"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ShapeRouteStyle", "16"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ConFixedCode", "6"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ConLineRouteExt", "1"));

  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndArrowSize", "2"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BeginArrow", "0"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndArrow", "1"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BeginArrowSize", "2"));
  //missing FillPattern, LineColor, Rounding, TextBkgnd

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinX", width, "Inh"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinY", height, "Inh"));

  shape.appendChild(createConnectionSectionControl(width, height));
  shape.appendChild(createConnectionSectionGeo(width, height));

  shapes.appendChild(shape);
}

function createConnect(connects, connection)
{
  var connectionId = mapId(connection.fromElementId + connection.toElementId);

  var connectBegin = xmlUtils.createElt(xmlDoc, "Connect");
  connectBegin.setAttribute("FromSheet", connectionId);
  connectBegin.setAttribute("FromCell", "BeginX");
  connectBegin.setAttribute("ToSheet", mapId(connection.fromElementId));
  connects.appendChild(connectBegin);

  var connectEnd = xmlUtils.createElt(xmlDoc, "Connect");
  connectEnd.setAttribute("FromSheet", connectionId);
  connectEnd.setAttribute("FromCell", "EndX");
  connectEnd.setAttribute("ToSheet", mapId(connection.toElementId));
  connects.appendChild(connectEnd);    
}

function getConnectBounds(connection, input)
{
  var fromElement, toElement;
  for (var element of input.elements)
  {
    if (element.id == connection.fromElementId)
      fromElement = element;
    if (element.id == connection.toElementId)
      toElement = element;
  }

  return {
    width: toElement.x - fromElement.x,
    height: toElement.y - fromElement.y,
    from: { x: fromElement.x, y: fromElement.y, id: fromElement.id },
    to: { x: toElement.x, y: toElement.y, id: toElement.id }
  };
}

function createConnectionSectionGeo(width, height)
{
  var section = xmlUtils.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", 0);
  //missing NoShow, NoSnap, NoQuickDrag

	section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", 2, width, height));

  return section;
}

function createConnectionSectionControl(width, height)
{
  var section = xmlUtils.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Control");

  var row = xmlUtils.createElt(xmlDoc, "Row");
  row.setAttribute("N", "TextPosition");

  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "X", width));
  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Y", height));
  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "XDyn", width, "Inh"));
  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "YDyn", height, "Inh"));

  section.appendChild(row);

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
    createEdge(shapes, connection, input);
    createConnect(connects, connection);
  }

  xmlDoc.appendChild(root);
  var content = xmlUtils.xmlToString(xmlDoc);

  return content;
}

module.exports = getPageXml;