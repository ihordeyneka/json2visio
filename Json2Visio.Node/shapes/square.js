var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Square extends Base
{
  constructor(element, shapeId, squShapeId, textShapeId) {
    super(element, shapeId, 'Group');
    this.squShapeId = squShapeId;
    this.textShapeId = textShapeId;
    this.textHeight = 23.368;
    this.squSize = 32;
    this.marginHeight = 10.16;
    this.height = this.squSize + this.textHeight + this.marginHeight;
    this.squRelativeCoords = [
      {x: 0, y: 0},
      {x: this.squSize, y: 0},
      {x: this.squSize, y: this.squSize},
      {x: 0, y: this.squSize}
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

    var squShape = this.createSquShape(xmlDoc);
    subShapes.appendChild(squShape);

    var textShape = this.createTextShape(xmlDoc);
    subShapes.appendChild(textShape);

    shape.appendChild(subShapes);

    xmlUtils.createShapeConnects(xmlDoc, shape, this.getRelativeConnectPoints());
  
    return shape;
  }

  createSquShape(xmlDoc) {
    var squShape = xmlUtils.createElt(xmlDoc, "Shape");

    squShape.setAttribute("ID", this.squShapeId);
    squShape.setAttribute("Type", "Shape");
    squShape.setAttribute("Master", "17");

    squShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.width/2));
    squShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", this.textHeight + this.marginHeight + this.squSize/2));
    squShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.squSize));
    squShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.squSize));
    squShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.squSize/2));
    squShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.squSize/2));

    squShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    squShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegndTrans", this.element.backgroundTransparent));
    squShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
    squShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LinePattern", xmlUtils.getLinePattern(this.element.linePattern)));

    squShape.appendChild(this.createSquGeo(xmlDoc));

    xmlUtils.createShapeConnects(xmlDoc, squShape, this.squRelativeCoords);

    return squShape;
  }

  createSquGeo(xmlDoc) {
    var geoIndex = 0;
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", geoIndex++);

    var length = this.squRelativeCoords.length;
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, this.squRelativeCoords[length - 1].x, this.squRelativeCoords[length - 1].y));

    for (var coords of this.squRelativeCoords) {
      section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, coords.x, coords.y));
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

    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.width/2));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", this.textHeight/2));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.textHeight));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.width/2));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.textHeight/2));
    
    textShape.appendChild(this.createSectionChar(xmlDoc));
    textShape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));

    return textShape;
  }

  getConnectOrigin() {
    return {
      x: this.element.x - this.width/2,
      y: this.element.y - this.height/2 - this.squSize,
    };
  }

  getRelativeConnectPoints() {
    return this.squRelativeCoords.map(p => 
      ({
        x: this.width/2 - this.squSize/2 + p.x,
        y: this.height/2 + p.y
      })
    );
  }
}

module.exports = Square;