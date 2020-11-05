var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Can extends Base
{
  constructor(element, shapeId, subShapeId) {
    super(element, shapeId, 'Group');
    this.subShapeId = subShapeId;
    this.width = 1 * xmlUtils.CONVERSION_FACTOR;
    this.ellipseHeight = 0.25 * xmlUtils.CONVERSION_FACTOR;
    this.boxHeight = 1 * xmlUtils.CONVERSION_FACTOR;
  }

  createShape(xmlDoc) {
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
      
    shape.setAttribute("ID", this.shapeId);
    shape.setAttribute("Type", this.type);
    shape.setAttribute("Master", "8"); //Can
    shape.setAttribute("FillStyle", "0");
    shape.setAttribute("TextStyle", "0");
    
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.x));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - this.element.y));
    
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
  
    shape.appendChild(this.createSectionChar(xmlDoc));
    shape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));

    var subShapes = xmlUtils.createElt(xmlDoc, "Shapes");
    var subShape = xmlUtils.createElt(xmlDoc, "Shape");
    subShape.setAttribute("ID", this.subShapeId);
    subShape.setAttribute("Type", "Shape");
    subShape.setAttribute("MasterShape", "6");
    subShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    subShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
    subShapes.appendChild(subShape);
    shape.appendChild(subShapes);
  
    return shape;
  }

  getConnectPoints() {
    return [
      { x: this.element.x - this.width/2, y: this.element.y },
      { x: this.element.x + this.width/2, y: this.element.y },
      { x: this.element.x, y: this.element.y - (this.ellipseHeight + this.boxHeight)/2 },
      { x: this.element.x, y: this.element.y + (this.ellipseHeight + this.boxHeight)/2 }
    ];
  }
}

module.exports = Can;