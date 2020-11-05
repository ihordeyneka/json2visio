var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Hexagon extends Base
{
  constructor(element, shapeId, hexShapeId, textShapeId) {
    super(element, shapeId, 'Group');
    this.hexShapeId = hexShapeId;
    this.textShapeId = textShapeId;
    this.hexRelativeCoords = [
      {x: 0.052431, y: 0.24801},
      {x: -0.01953, y: 0.124005},
      {x: 0.05243, y: 0},
      {x: 0.19565, y: 0},
      {x: 0.26719, y: 0.124005},
      {x: 0.19565, y: 0.24801}
    ];
  }

  createShape(xmlDoc) {
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
      
    shape.setAttribute("ID", this.shapeId);
    shape.setAttribute("Type", this.type);
    shape.setAttribute("LineStyle", "3");
    shape.setAttribute("FillStyle", "3");
    shape.setAttribute("TextStyle", "3");
    
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.x));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - this.element.y));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.element.width));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "Height", 0.691));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.element.width/2, "Width/2"));
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

    hexShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.width/2));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "PinY", 0.470));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Width", 0.24801));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Height", 0.24801));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinX", 0.124005));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinY", 0.124005));

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

    var length = this.hexRelativeCoords.length;
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "MoveTo", geoIndex++, this.hexRelativeCoords[length - 1].x, this.hexRelativeCoords[length - 1].y));

    for (var coords of this.hexRelativeCoords) {
      section.appendChild(xmlUtils.createRowRel(xmlDoc, "LineTo", geoIndex++, coords.x, coords.y));
    }

    return section;
  }

  createTextShape(xmlDoc) {
    var textShape = xmlUtils.createElt(xmlDoc, "Shape");

    textShape.setAttribute("ID", this.textShapeId);
    textShape.setAttribute("Type", "Shape");
    textShape.setAttribute("LineStyle", "3");
    textShape.setAttribute("FillStyle", "3");
    textShape.setAttribute("TextStyle", "3");

    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.width/2));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "PinY", 0.115));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.element.width));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Height", 0.23));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.element.width/2));
    textShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinY", 0.115));
    
    textShape.appendChild(this.createSectionChar(xmlDoc));
    textShape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));

    return textShape;
  }

  getConnectPoints() {
    return this.hexRelativeCoords.map(coords => 
      ({ x: this.element.x + (coords.x - 0.124005)*xmlUtils.CONVERSION_FACTOR, y: this.element.y + (coords.y - 0.24801)*xmlUtils.CONVERSION_FACTOR })
    );
  }
}

module.exports = Hexagon;