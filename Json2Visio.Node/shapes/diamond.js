var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Diamond extends Base
{
  constructor(element, shapeId, diaShapeId, textShapeId) {
    super(element, shapeId, 'Group');
    this.diaShapeId = diaShapeId;
    this.textShapeId = textShapeId;
    this.diaWidth = 0.3372;
    this.diaHeight = 0.3338;
    this.diaRelativeCoords = [
      {x: this.diaWidth/2, y: 0},
      {x: this.diaWidth, y: this.diaHeight/2},
      {x: this.diaWidth/2, y: this.diaHeight},
      {x: 0, y: this.diaHeight/2}
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

    var diaShape = this.createDiaShape(xmlDoc);
    subShapes.appendChild(diaShape);

    var textShape = this.createTextShape(xmlDoc);
    subShapes.appendChild(textShape);

    shape.appendChild(subShapes);

    xmlUtils.createShapeConnects(xmlDoc, shape, this.getRelativeConnectPoints());
  
    return shape;
  }

  createDiaShape(xmlDoc) {
    var diaShape = xmlUtils.createElt(xmlDoc, "Shape");

    diaShape.setAttribute("ID", this.diaShapeId);
    diaShape.setAttribute("Type", "Shape");
    diaShape.setAttribute("Master", "14");

    diaShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.width/2));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "PinY", 0.4527));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Width", this.diaWidth));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "Height", this.diaHeight));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinX", this.diaWidth/2));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LocPinY", this.diaHeight/2));

    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LinePattern", xmlUtils.getLinePattern(this.element.linePattern)));

    diaShape.appendChild(this.createDiaGeo(xmlDoc));

    xmlUtils.createShapeConnects(xmlDoc, diaShape, this.diaRelativeCoords);

    return diaShape;
  }

  createDiaGeo(xmlDoc) {
    var geoIndex = 0;
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", geoIndex++);

    var length = this.diaRelativeCoords.length;
    section.appendChild(xmlUtils.createRowRel(xmlDoc, "MoveTo", geoIndex++, this.diaRelativeCoords[length - 1].x, this.diaRelativeCoords[length - 1].y));

    for (var coords of this.diaRelativeCoords) {
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

  getRelativeConnectPoints() {
    return this.diaRelativeCoords.map(coords => 
      ({ x: (coords.x - 0.165)*xmlUtils.CONVERSION_FACTOR, y: (coords.y - 0.275)*xmlUtils.CONVERSION_FACTOR })
    );
  }
}

module.exports = Diamond;