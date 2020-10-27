var xmlUtils = require('./xml-utils');
var Rect = require('./shapes/rect');

var xmlDoc = null;

var figureMap = {};
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

  figureMap[element.id] = figure;
  
  var shapeId = mapId(element.id);
  var shape = figure.createShape(xmlDoc, shapeId);
  shape.setAttribute("Type", "Shape");
  
  shapes.appendChild(shape);
}

function createEdge(shapes, connection)
{
  var shape = xmlUtils.createElt(xmlDoc, "Shape");
  var connectionId = mapId(connection.fromElementId + connection.toElementId);

  var ends = getConnectEnds(connection);
  var layerIndex = 0;

  shape.setAttribute("ID", connectionId);
  shape.setAttribute("NameU", "Dynamic connector." + connectionId);
  shape.setAttribute("Name", "Dynamic connector." + connectionId);
  shape.setAttribute("Type", "Shape");
  shape.setAttribute("Master", "4"); //Dynamic Connector Master

  var beginX = ends.from.x;
  var endX = ends.to.x;
  var beginY = xmlUtils.PAGE_HEIGHT - ends.from.y;
  var endY = xmlUtils.PAGE_HEIGHT - ends.to.y;

  var width = endX - beginX;
  var height = endY - beginY;
  var midX = (beginX + endX)/2;
  var midY = (beginY + endY)/2;

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", midX, "GUARD((BeginX+EndX)/2)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", midY, "GUARD((BeginY+EndY)/2)"));
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
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BegTrigger", "2", "_XFTRIGGER(Sheet."+ mapId(connection.fromElementId) +"!EventXFMod)"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndTrigger", "2", "_XFTRIGGER(Sheet."+ mapId(connection.toElementId) +"!EventXFMod)"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ShapeRouteStyle", "16"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ConFixedCode", "6"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ConLineRouteExt", "1"));

  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", connection.color));

  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndArrowSize", "2"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BeginArrow", "0"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndArrow", "1"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BeginArrowSize", "2"));
  //missing FillPattern, LineColor, Rounding, TextBkgnd

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinX", width/2, "Inh"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinY", height/2, "Inh"));

  shape.appendChild(createConnectionSectionControl(width/2, height/2));
  shape.appendChild(createConnectionSectionGeo(width, height));

  if (connection.label)
    shape.appendChild(xmlUtils.createTextElem(xmlDoc, connection.label));

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

function getConnectEnds(connection)
{
  var figureFrom = figureMap[connection.fromElementId];
  var figureTo = figureMap[connection.toElementId];

  var pointsFrom = figureFrom.getConnectPoints();
  var pointsTo = figureTo.getConnectPoints();

  //find min distance between points
  var distance = 10000000;
  var p0, pe;
  for (var fromPoint of pointsFrom)
  {
    for (var toPoint of pointsTo)
    {
      var curDistance = Math.sqrt((fromPoint.x - toPoint.x)*(fromPoint.x - toPoint.x) +
        (fromPoint.y - toPoint.y)*(fromPoint.y - toPoint.y));
      if (curDistance < distance)
      {
        distance = curDistance;
        p0 = fromPoint;
        pe = toPoint;
      }
    }
  }

  return {
    from: { x: p0.x, y: p0.y },
    to: { x: pe.x, y: pe.y }
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

function createConnectionSectionControl(x, y)
{
  var section = xmlUtils.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Control");

  var row = xmlUtils.createElt(xmlDoc, "Row");
  row.setAttribute("N", "TextPosition");

  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "X", x));
  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Y", y));
  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "XDyn", x, "Inh"));
  row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "YDyn", y, "Inh"));

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
    createEdge(shapes, connection);
    createConnect(connects, connection);
  }

  xmlDoc.appendChild(root);
  var content = xmlUtils.xmlToString(xmlDoc);

  return content;
}

module.exports = getPageXml;