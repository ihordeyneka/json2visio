var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Rhombus extends Base
{
  constructor(element, shapeId, rhShapeId) {
    super(element, shapeId, 'Group');
    this.rhShapeId = rhShapeId;
    this.width = this.element.width;
    this.height = this.element.height;
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
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.height));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.width/2, "Width/2"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.height/2, "Height/2"));
    if (this.element.angle) {
      shape.appendChild(xmlUtils.createCellElem(xmlDoc, "Angle", xmlUtils.degressToRadians(this.element.angle)));
    }

    var subShapes = xmlUtils.createElt(xmlDoc, "Shapes");

    var rhShape = this.createRhShape(xmlDoc);
    subShapes.appendChild(rhShape);

     shape.appendChild(subShapes);

    xmlUtils.createShapeConnects(xmlDoc, shape, this.getRelativeConnectPoints());
  
    return shape;
  }

  createRhShape(xmlDoc) {
    var rhShape = xmlUtils.createElt(xmlDoc, "Shape");

    rhShape.setAttribute("ID", this.rhShapeId);
    rhShape.setAttribute("Type", "Shape");
    rhShape.setAttribute("Master", "14");

    rhShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.width));
    rhShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", this.height));
    rhShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width));
    rhShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.height));
    rhShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.width));
    rhShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.height));

    rhShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    rhShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegndTrans", this.element.backgroundTransparent));
    rhShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
    rhShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LinePattern", xmlUtils.getLinePattern(this.element.linePattern)));
    rhShape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));
    

    rhShape.appendChild(this.createSectionGeo(xmlDoc));

    xmlUtils.createShapeConnects(xmlDoc, rhShape, this.getRelativeConnectPoints());

    return rhShape;
  }

  processGeometry(xmlDoc, section) {
    var geoIndex = 1;
    var w = this.element.width;
    var h = this.element.height;
  
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, h/2, "0", "Height/2"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w/2, h, "Width/2", "Height"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w, h/2, "Width", "Height/2"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w/2, 0, "Width/2", "0"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, h/2, "0", "Height/2"));
  }

  getRelativeConnectPoints() {
    return [
      { x: this.width/4, y: this.height/4 },
      { x: this.width/2, y: 0 },
      { x: this.width/4, y: this.height*3/4 },
      { x: this.width, y: this.height/2 },
      { x: this.width*3/4, y: this.height*3/4 },
      { x: this.width/2, y: this.height },
      { x: this.width*3/4, y: this.height/4 },
      { x: 0, y: this.height/2 }
    ];
  }
}

module.exports = Rhombus;