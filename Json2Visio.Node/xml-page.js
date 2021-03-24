var xmlUtils = require('./xml-utils');
var Rect = require('./shapes/rect');
var Ellipse = require('./shapes/ellipse');
var Can = require('./shapes/can');
var Hexagon = require('./shapes/hexagon');
var Diamond = require('./shapes/diamond');
var Square = require('./shapes/square');
var Rhombus = require('./shapes/rhombus');

var self = {};
var xmlDoc = null;

var figureMap = {};
var idsMap = {};
var idsCounter = 1;
var usedConnects = [];

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

function mapIdArgs(...args) {
  var arrayId = args.join('__');
  return mapId(arrayId);
}

function createShape(shapes, element)
{
  var figure;
  var shapeId = mapId(element.id);

  if (element.innerDiagram) {
    element.shape = 'box';
    var group = createInnerGroup(shapes, element);
    createInnerDiagram(group, element);
  } else {
    switch (element.shape)
    {
      case 'ellipse':
        figure = new Ellipse(element, shapeId);
        break;
      case 'rhombus':
        var rhShapeId = mapId(element.id + "_rh");
        figure = new Rhombus(element, shapeId, rhShapeId + 1000);
        break;
      case 'can':
        var subShapeId = mapId(element.id + "_child");
        figure = new Can(element, shapeId, subShapeId);
        break;
      case 'hexagon':
        var hexShapeId = mapId(element.id + "_hex");
        var textShapeId = mapId(element.id + "_text");
        figure = new Hexagon(element, shapeId, hexShapeId + 1000, textShapeId);
        break;
      case 'diamond':
        var diaShapeId = mapId(element.id + "_dia");
        var textShapeId = mapId(element.id + "_text");
        figure = new Diamond(element, shapeId, diaShapeId + 1000, textShapeId);
        break;
      case 'square':
        var squShapeId = mapId(element.id + "_squ");
        var textShapeId = mapId(element.id + "_text");
        figure = new Square(element, shapeId, squShapeId + 1000, textShapeId);
        break;      
      case 'box':
      default:
        figure = new Rect(element, shapeId);
        break;
    }
  
    figureMap[element.id] = figure;
    
    var shape = figure.createShape(xmlDoc);

    shapes.appendChild(shape);
    return shape;
  }
}

function createInnerGroup(shapes, element) {
  var clone = {
    id: element.id,
    x: element.x,
    y: element.y,
    name: " ",
    width: element.width,
    height: element.height,
    shape: "box",
    backgroundTransparent: "1"
  };
  return createShape(shapes, clone);
}

function createEdge(shapes, options)
{
  var fromElementId = options.fromElementId || options.connection.fromElementId;
  var toElementId = options.toElementId || options.connection.toElementId;
  var color = options.connection.color;
  var pattern = options.connection.linePattern;
  var label = options.label || null;
  var endArrow = options.endArrow || "13";
  var connectPoints = options.connection.connectPoints;

  var shape = xmlUtils.createElt(xmlDoc, "Shape");
  var connectionId = mapIdArgs(fromElementId, toElementId);

  var metadata = getConnectMetadata(fromElementId, toElementId, options.connection.beginHandle, options.connection.endHandle);
  var layerIndex = 0;

  shape.setAttribute("ID", connectionId);
  shape.setAttribute("NameU", "Dynamic connector." + connectionId);
  shape.setAttribute("Name", "Dynamic connector." + connectionId);
  shape.setAttribute("Type", "Shape");
  shape.setAttribute("Master", "4"); //Dynamic Connector Master


  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", metadata.midX, "GUARD((BeginX+EndX)/2)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", metadata.midY, "GUARD((BeginY+EndY)/2)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", metadata.width, "GUARD(EndX-BeginX)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", metadata.height, "GUARD(EndY-BeginY)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", metadata.width/2, "GUARD(Width*0.5)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", metadata.height/2, "GUARD(Height*0.5)"));

  //Formula is used to make the edge dynamic 
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "BeginX", metadata.beginX, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "BeginY", metadata.beginY, "_WALKGLUE(BegTrigger,EndTrigger,WalkPreference)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "EndX", metadata.endX, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "EndY", metadata.endY, "_WALKGLUE(EndTrigger,BegTrigger,WalkPreference)"));

  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LayerMember", layerIndex + ""));

  //Formula is used to make the edge dynamic (specify source id and target id)
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BegTrigger", "2", "_XFTRIGGER(Sheet."+ mapId(fromElementId) +"!EventXFMod)"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndTrigger", "2", "_XFTRIGGER(Sheet."+ mapId(toElementId) +"!EventXFMod)"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ShapeRouteStyle", connectPoints ? "1" : "16"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ConFixedCode", metadata.duplicate ? "2" : "6"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "ConLineRouteExt", "1"));

  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", color));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LinePattern", xmlUtils.getLinePattern(pattern)));

  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndArrowSize", "2"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BeginArrow", "0"));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "EndArrow", endArrow));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "BeginArrowSize", "2"));
  //missing FillPattern, LineColor, Rounding, TextBkgnd

  var txtPinX = connectPoints ? connectPoints[0].x + metadata.width/2 - metadata.midX : metadata.width/2;
  var txtPinY = connectPoints ? xmlUtils.PAGE_HEIGHT - connectPoints[0].y + metadata.height/2 - metadata.midY : metadata.height/2;

  var txtWidth = 240;
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinX", txtPinX, "Inh"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinY", txtPinY, "Inh"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtWidth", txtWidth));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtHeight", 0));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtLocPinX", txtWidth/2, "TxtWidth/2"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtLocPinY", 0, "TxtHeight/2"));

  shape.appendChild(createConnectionSectionControl(metadata.width/2, metadata.height/2));

  if (connectPoints)
  {
    connectPoints.forEach(cp => { cp.y = xmlUtils.PAGE_HEIGHT - cp.y; });
    connectPoints.unshift({x: metadata.beginX, y: metadata.beginY});
    connectPoints.push({x: metadata.endX, y: metadata.endY});
    shape.appendChild(xmlUtils.createRightAngleGeo(xmlDoc, connectPoints, figureMap[fromElementId], figureMap[toElementId]));
  }
  else {
    shape.appendChild(xmlUtils.createStraightLineGeo(xmlDoc, metadata.width, metadata.height));
  }

  if (label) {
    var sectionChar = xmlUtils.createElt(xmlDoc, "Section");
    sectionChar.setAttribute("N", "Character");
    var rowChar = xmlUtils.createEltWithIX(xmlDoc, "Row", 0);
    rowChar.appendChild(xmlUtils.createCellElem(xmlDoc, "Font", "Calibri"));
    rowChar.appendChild(xmlUtils.createCellElem(xmlDoc, "Style", "0"));
    rowChar.appendChild(xmlUtils.createCellElem(xmlDoc, "Size", "0.1666666666666667"));
    sectionChar.appendChild(rowChar);
    shape.appendChild(sectionChar);

    shape.appendChild(xmlUtils.createTextElem(xmlDoc, label));
  }

  shapes.appendChild(shape);

  return {
    indexFrom: metadata.indexFrom,
    indexTo: metadata.indexTo
  };
}

function createConnect(connects, indexes, fromElementId, toElementId)
{
  //details here: https://docs.microsoft.com/en-us/office/vba/api/visio.vistoparts
  var connectionId = mapIdArgs(fromElementId, toElementId);

  var connectBegin = xmlUtils.createElt(xmlDoc, "Connect");
  connectBegin.setAttribute("FromSheet", connectionId);
  connectBegin.setAttribute("FromCell", "BeginX");
  connectBegin.setAttribute("FromPart", "9");
  connectBegin.setAttribute("ToSheet", mapId(fromElementId));
  connectBegin.setAttribute("ToCell", "Connections.X" + (indexes.indexFrom + 1));
  connectBegin.setAttribute("ToPart", 100 + indexes.indexFrom);
  connects.appendChild(connectBegin);

  var connectEnd = xmlUtils.createElt(xmlDoc, "Connect");
  connectEnd.setAttribute("FromSheet", connectionId);
  connectEnd.setAttribute("FromCell", "EndX");
  connectEnd.setAttribute("FromPart", "12");
  connectEnd.setAttribute("ToSheet", mapId(toElementId));
  connectEnd.setAttribute("ToCell", "Connections.X" + (indexes.indexTo + 1));
  connectEnd.setAttribute("ToPart", 100 + indexes.indexTo);
  connects.appendChild(connectEnd);    
}

function getForeignShape(connection, data)
{
  var shape = xmlUtils.createElt(xmlDoc, "Shape");

  var combinedId = connection.fromElementId + connection.dataId + connection.toElementId;
  var dataId = mapId(combinedId);

  shape.setAttribute("ID", dataId);
  shape.setAttribute("Type", "Foreign");
  shape.setAttribute("LineStyle", "2");
  shape.setAttribute("FillStyle", "2");
  shape.setAttribute("TextStyle", "2");

  //hardcoded
  var imgWidth = connection.dataWidth;
  var imgHeight = connection.dataHeight;
  var txtWidth = 240;

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", connection.dataX, "GUARD((BeginX+EndX)/2)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - connection.dataY, "GUARD((BeginY+EndY)/2)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", imgWidth, "GUARD(EndX-BeginX)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", imgHeight, "GUARD(EndY-BeginY)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", imgWidth/2, "GUARD(Width*0.5)"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", imgHeight/2, "GUARD(Height*0.5)"));

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "ImgOffsetX", 0));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "ImgOffsetY", 0));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "ImgWidth", imgWidth));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "ImgHeight", imgHeight));

  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinX", imgWidth/2, "Width/2"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtPinY", -imgHeight/2));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtWidth", txtWidth));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtHeight", 0));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtLocPinX", txtWidth/2, "TxtWidth/2"));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "TxtLocPinY", 0, "TxtHeight/2"));

  //geo
  createDataSectionGeo(shape);

  //foreign data
  var foreignData = xmlUtils.createElt(xmlDoc, "ForeignData");
  foreignData.setAttribute("ForeignType", "Bitmap");
  foreignData.setAttribute("CompressionType", data.compression);
  var rel = xmlUtils.createElt(xmlDoc, "Rel");
  rel.setAttributeNS(xmlUtils.XMLNS_R, "id", "rId" + data.relIndex);
  foreignData.appendChild(rel);
  shape.appendChild(foreignData);

  //text
  if (data.name) {
    var sectionChar = xmlUtils.createElt(xmlDoc, "Section");
    sectionChar.setAttribute("N", "Character");
    var rowChar = xmlUtils.createEltWithIX(xmlDoc, "Row", 0);
    rowChar.appendChild(xmlUtils.createCellElem(xmlDoc, "Font", "Calibri"));
    rowChar.appendChild(xmlUtils.createCellElem(xmlDoc, "Style", "0"));
    rowChar.appendChild(xmlUtils.createCellElem(xmlDoc, "Size", "0.144445"));
    sectionChar.appendChild(rowChar);
    shape.appendChild(sectionChar);

    shape.appendChild(xmlUtils.createTextElem(xmlDoc, data.name, data.subName));
  }

  figureMap[combinedId] = {
    getConnectPoints: function() {
      return [
        { x: connection.dataX - imgWidth/2, y: connection.dataY },
        { x: connection.dataX + imgWidth/2, y: connection.dataY },
        { x: connection.dataX, y: connection.dataY - imgHeight/2 },
        { x: connection.dataX, y: connection.dataY + imgHeight/2 }
      ];
    }
  };

  xmlUtils.createShapeConnects(xmlDoc, shape, [
    { x: imgWidth/2, y: 0 },
    { x: imgWidth/2, y: imgHeight },
    { x: 0, y: imgHeight/2 },
    { x: imgWidth, y: imgHeight/2 }
  ]);

  return shape;
}

function getConnectMetadata(fromElementId, toElementId, beginHandle, endHandle)
{
  var figureFrom = figureMap[fromElementId];
  var figureTo = figureMap[toElementId];

  var pointsFrom = figureFrom.getConnectPoints();
  var pointsTo = figureTo.getConnectPoints();

  var p0, pe;
  var duplicate = false;

  //if handles are given, find connect points by handles
  if (beginHandle) {
    p0 = self.findConnectPointForHandle(figureFrom, beginHandle, pointsFrom);
  }

  if (endHandle) {
    pe = self.findConnectPointForHandle(figureTo, endHandle, pointsTo);
  }

  //if handles aren't given, then find connect points by min distance
  if (!p0 || !pe) {
    var distance = 10000000;
    for (var fromPoint of pointsFrom)
    {
      for (var toPoint of pointsTo)
      {
        var alreadyUsed = usedConnects.some(el => {
          return (el.p0.x == fromPoint.x && el.p0.y == fromPoint.y && el.pe.x == toPoint.x && el.pe.y == toPoint.y) ||
            (el.p0.x == toPoint.x && el.p0.y == toPoint.y && el.pe.x == fromPoint.x && el.pe.y == fromPoint.y);
        });
  
        if (alreadyUsed) {
          duplicate = true;
          continue;
        }
  
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
  }

  //process connect points
  usedConnects.push({ p0: p0, pe: pe });

  var beginX = p0.x;
  var endX = pe.x;
  var beginY = xmlUtils.PAGE_HEIGHT - p0.y;
  var endY = xmlUtils.PAGE_HEIGHT - pe.y;

  var width = endX - beginX;
  var height = endY - beginY;
  var midX = (beginX + endX)/2;
  var midY = (beginY + endY)/2;

  var indexFrom = pointsFrom.indexOf(p0);
  var indexTo = pointsTo.indexOf(pe);

  return {
    beginX: beginX,
    endX: endX,
    beginY: beginY,
    endY: endY,
    width: width,
    height: height,
    midX: midX,
    midY: midY,
    indexFrom: indexFrom,
    indexTo: indexTo,
    duplicate: duplicate
  };
}

self.findConnectPointForHandle = function(figure, handle, points) {
  var target = {
    x: figure.element.x + figure.width*(handle.x - 1/2),
    y: figure.element.y + figure.height*(handle.y - 1/2)
  };

  if (figure.element.angle) {
    target = xmlUtils.rotatePoint(target, {x: figure.element.x, y: figure.element.y}, figure.element.angle);
  }

  var distance = 10000000;
  var result = null;

  for (var point of points) {
    var curDistance = Math.sqrt((point.x - target.x)*(point.x - target.x) +
      (point.y - target.y)*(point.y - target.y));
    if (curDistance < distance)
    {
      distance = curDistance;
      result = point;
    }
  }

  return result;
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

function createDataSectionGeo(shape)
{
  var geoIndex = 0;
  var section = xmlUtils.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", geoIndex++);
  
  section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoFill", "0"));
  section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoLine", "0"));

  section.appendChild(xmlUtils.createRowRel(xmlDoc, "RelMoveTo", geoIndex++, 0, 0));
  section.appendChild(xmlUtils.createRowRel(xmlDoc, "RelLineTo", geoIndex++, 1, 0));
  section.appendChild(xmlUtils.createRowRel(xmlDoc, "RelLineTo", geoIndex++, 1, 1));
  section.appendChild(xmlUtils.createRowRel(xmlDoc, "RelLineTo", geoIndex++, 0, 1));
  section.appendChild(xmlUtils.createRowRel(xmlDoc, "RelLineTo", geoIndex++, 0, 0));

  shape.appendChild(section);
}

function createInnerDiagram(group, element) {
  var shapes = xmlUtils.createElt(xmlDoc, "Shapes");
  group.appendChild(shapes);

  var clone = JSON.parse(JSON.stringify(element));
  clone.id += "_subchild";
  clone.innerDiagram = null;
  clone.x = clone.x - element.x + element.width/2;
  clone.y = xmlUtils.PAGE_HEIGHT - (clone.y - element.y + element.height/2);
  createShape(shapes, clone); //add self without inner diagram

  //now add children
  for (var subElement of element.innerDiagram.elements)
  {
    subElement.x = subElement.x - element.x + element.width/2;
    subElement.y = xmlUtils.PAGE_HEIGHT - (subElement.y - element.y + element.height/2);
    createShape(shapes, subElement);
  }
}

self.getPageXml = function(input)
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
    if (connection.dataId) {
      var data = input.data.find(d => d.id == connection.dataId);
      var combinedId = connection.fromElementId + connection.dataId + connection.toElementId;
      var foreignData = getForeignShape(connection, data);

      var fromIndexes = createEdge(shapes, {
        connection: connection,
        toElementId: combinedId,
        endArrow: "0"
      });
      createConnect(connects, fromIndexes, connection.fromElementId, combinedId);

      var toIndexes = createEdge(shapes, {
        connection: connection,
        fromElementId: combinedId
      });
      createConnect(connects, toIndexes, combinedId, connection.toElementId);
      
      shapes.appendChild(foreignData);
    }
    else {
      var indexes = createEdge(shapes, {
        connection: connection,
        label: connection.label
      });
      createConnect(connects, indexes, connection.fromElementId, connection.toElementId);
    }
  }

  xmlDoc.appendChild(root);
  var content = xmlUtils.xmlToString(xmlDoc);

  return content;
}

self.getPageRelXml = function(zip, input) {
  var relDoc = xmlUtils.createXmlDocument();
  var root = xmlUtils.createElt(relDoc, "Relationships", xmlUtils.RELS_XMLNS);

  var relIndex = 1;

  var masters = ['master1.xml', 'master2.xml', 'master3.xml', 'master4.xml', 'master5.xml'];

  for (var master in masters) {
    var masterRel = xmlUtils.createElt(relDoc, "Relationship", xmlUtils.RELS_XMLNS);
    masterRel.setAttribute('Id', 'rId' + relIndex++);
    masterRel.setAttribute('Type', 'http://schemas.microsoft.com/visio/2010/relationships/master');
    masterRel.setAttribute('Target', '../masters/' + master);
    root.appendChild(masterRel);
  }

  for (var data of input.data)
  {
    data.relIndex = relIndex;

    var dataRel = xmlUtils.createElt(relDoc, "Relationship", xmlUtils.RELS_XMLNS);
    dataRel.setAttribute('Id', 'rId' + relIndex++);
    dataRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
    dataRel.setAttribute('Target', '../media/' + data.file);
    root.appendChild(dataRel);
  }

  relDoc.appendChild(root);
  var content = xmlUtils.xmlToString(relDoc);

  return content;
}

module.exports = self;