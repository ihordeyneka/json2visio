var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Rhombus extends Base
{
  constructor(element, shapeId, rhShapeId) {
    super(element, shapeId, 'Group');
    this.rhShapeId = rhShapeId;
    this.width = this.element.width;
    this.height = this.element.height;
    this.rhRelativeCoords = [
      {x: this.width/2, y: 0},
      {x: this.width, y: this.height/2},
      {x: this.width/2, y: this.height},
      {x: 0, y: this.height/2}
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
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.height));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.width/2, "Width/2"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.height/2, "Height/2"));
    

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
    

    rhShape.appendChild(this.createRhGeo(xmlDoc));

    xmlUtils.createShapeConnects(xmlDoc, rhShape, this.rhRelativeCoords);

    return rhShape;
  }

  createRhGeo(xmlDoc) {
    var geoIndex = 0;
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", geoIndex++);

    var length = this.rhRelativeCoords.length;
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, this.rhRelativeCoords[length - 1].x, this.rhRelativeCoords[length - 1].y));

    for (var coords of this.rhRelativeCoords) {
      section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, coords.x, coords.y));
    }

    return section;
  }

  getConnectOrigin() {
    return {
      x: this.element.x,
      y: this.element.y 
    };
  }

  getRelativeConnectPoints() {
    return this.rhRelativeCoords.map(p => 
      ({
        x: p.x/2,
        y: p.y/2
      })
    );
  }

  getConnectPoints() {
    var origin = this.getConnectOrigin();
    return this.getRelativeConnectPoints().map(p => 
      ({ x: origin.x, y: origin.y + p.y })
    );
  }
}

module.exports = Rhombus;