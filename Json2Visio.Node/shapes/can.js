var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Can extends Base
{
  constructor(element, subShapeId) {
    super(element);
    this.type = 'Group';
    this.subShapeId = subShapeId;
    this.width = 1 * xmlUtils.CONVERSION_FACTOR;
    this.ellipseHeight = 0.25 * xmlUtils.CONVERSION_FACTOR;
    this.boxHeight = 1 * xmlUtils.CONVERSION_FACTOR;
  }

  createShape(xmlDoc, shapeId) {
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
      
    shape.setAttribute("ID", shapeId);
    shape.setAttribute("Type", "Group");
    shape.setAttribute("Master", "8"); //Can
    shape.setAttribute("FillStyle", "0");
    shape.setAttribute("TextStyle", "0");
    
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.x));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - this.element.y));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", 0, "GUARD(TEXTWIDTH(theText) + 0.4)"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", 0, "GUARD(TEXTHEIGHT(theText,Width) + 0.4)"));
    
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
}

module.exports = Can;