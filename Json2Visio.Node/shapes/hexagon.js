var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Hexagon extends Base
{
  constructor(element, hexShapeId, textShapeId) {
    super(element);
    this.type = 'Group';
    this.hexShapeId = hexShapeId;
    this.textShapeId = textShapeId;
  }

  createShape(xmlDoc, shapeId) {
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
      
    shape.setAttribute("ID", shapeId);
    shape.setAttribute("Type", "Group");
    shape.setAttribute("LineStyle", "3");
    shape.setAttribute("FillStyle", "3");
    shape.setAttribute("TextStyle", "3");
    
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.x));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - this.element.y));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "Width", 1.17));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "Height", 0.691));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinX", 0.585, "Width/2"));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinY", 0.3455, "Height/2"));

    var subShapes = xmlUtils.createElt(xmlDoc, "Shapes");

    var hexShape = this.createHexShape(xmlDoc);
    subShapes.appendChild(hexShape);

    var textShape = this.createTextShape(xmlDoc);
    subShapes.appendChild(textShape);

    shape.appendChild(subShapes);
  
    return shape;
  }

  createHexShape(xmlDoc) {
    var hexShape = xmlUtils.createElt(xmlDoc, "Shape");

    hexShape.setAttribute("ID", this.hexShapeId);
    hexShape.setAttribute("Type", "Shape");
    hexShape.setAttribute("Master", "11");

    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "PinX", 0.58545));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "PinY", 0.51385));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Width", 0.3543));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Height", 0.3543));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinX", 0.17715));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinY", 0.17715));

    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));

    hexShape.appendChild(this.createHexGeo(xmlDoc));

    return hexShape;
  }

  createHexGeo(xmlDoc) {
    var geoIndex = 0;
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", geoIndex++);

    section.appendChild(xmlUtils.createRowRel(xmlDoc, "MoveTo", geoIndex++, 0.2794275997399989, 0.3543));
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "LineTo", geoIndex++, 0.07487240026000119, 0.3543));
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "LineTo", geoIndex++, -0.02740519948000119, 0.17715));
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "LineTo", geoIndex++, 0.07487240026000119, 0));
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "LineTo", geoIndex++, 0.2794275997399989, 0));
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "LineTo", geoIndex++, 0.3817051994800119, 0.17715));
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "LineTo", geoIndex++, 0.2794275997399989, 0.3543));

    return section;
  }

  createTextShape(xmlDoc) {
    var textShape = xmlUtils.createElt(xmlDoc, "Shape");

    textShape.setAttribute("ID", this.textShapeId);
    textShape.setAttribute("Type", "Shape");
    textShape.setAttribute("LineStyle", "3");
    textShape.setAttribute("FillStyle", "3");
    textShape.setAttribute("TextStyle", "3");

    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "PinX", 0.585));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "PinY", 0.115));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Width", 1.17));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Height", 0.23));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinX", 0.585));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinY", 0.115));
    
    textShape.appendChild(this.createSectionChar(xmlDoc));
    textShape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));

    return textShape;
  }
}

module.exports = Hexagon;