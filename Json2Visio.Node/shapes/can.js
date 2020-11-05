var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Can extends Base
{
  constructor(element, shapeId, subShapeId) {
    super(element, shapeId, 'Group');
    this.subShapeId = subShapeId;
    this.width = this.element.width;
    this.ellipseHeight = 0.25 * this.element.height;
    this.boxHeight = this.element.height;
    this.height = this.ellipseHeight + this.boxHeight;
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
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width, "Inh"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.height, "Inh"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.width/2, "Inh"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.height/2, "Inh"));
    
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
  
    shape.appendChild(this.createControlElt(xmlDoc));
    shape.appendChild(this.createSectionChar(xmlDoc));
    shape.appendChild(this.createEllipseGeo(xmlDoc));
    shape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));

    var subShapes = xmlUtils.createElt(xmlDoc, "Shapes");
    var subShape = xmlUtils.createElt(xmlDoc, "Shape");
    subShape.setAttribute("ID", this.subShapeId);
    subShape.setAttribute("Type", "Shape");
    subShape.setAttribute("MasterShape", "6");
    subShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.width/2, "Inh"));
    subShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", this.height/2, "Inh"));
    subShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width, "Inh"));
    subShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.height, "Inh"));
    subShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.width/2, "Inh"));
    subShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.height/2, "Inh"));
    subShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    subShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
    subShape.appendChild(this.createSubShapeGeo(xmlDoc));
    subShapes.appendChild(subShape);
    shape.appendChild(subShapes);
  
    return shape;
  }

  createControlElt(xmlDoc) {
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Control");
    var row = xmlUtils.createElt(xmlDoc, "Row");
    row.setAttribute("N", "Row_1");
    row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "X", this.width/2, "Inh"));
    row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Y", this.boxHeight, "Inh"));
    section.appendChild(row);

    return section;
  }

  createEllipseGeo(xmlDoc) {
    var geoIndex = 0;
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", geoIndex++);
    var row = xmlUtils.createElt(xmlDoc, "Row");
    row.setAttribute("T", "Ellipse");
    row.setAttribute("IX", geoIndex++);
    row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "X", this.width/2, "Inh"));
    row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Y", this.boxHeight + this.ellipseHeight/2, "Inh"));
    row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "B", this.boxHeight + this.ellipseHeight/2, "Inh"));
    row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "C", this.width/2, "Inh"));
    row.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "D", this.height, "Inh"));
    section.appendChild(row);

    return section;
  }

  createSubShapeGeo(xmlDoc) {
    var geoIndex = 0;
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", geoIndex++);

    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, this.ellipseHeight/2, "Inh", "Inh"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "EllipticalArcTo", geoIndex++, this.width, this.ellipseHeight/2, "Inh", "Inh", this.width/2, 0, 0, this.width/this.ellipseHeight, "Inh", "Inh", "Inh", "Inh", "DL", "DL"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, this.width, this.boxHeight + this.ellipseHeight/2, "Inh", "Inh"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, this.boxHeight + this.ellipseHeight/2, "Inh", "Inh"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, this.ellipseHeight/2, "Inh", "Inh"));

    return section;
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