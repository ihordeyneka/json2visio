var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Hexagon extends Base
{
  constructor(element, shapeId, hexShapeId, textShapeId) {
    super(element, shapeId, 'Group');
    this.hexShapeId = hexShapeId;
    this.textShapeId = textShapeId;
    this.textHeight = 23.368;
    this.hexWidth = 29.130752;
    this.hexHeight = 25.197816;
    this.marginHeight = 10.16;
    this.height = this.hexHeight + this.textHeight + this.marginHeight;
    this.hexRelativeCoords = [
      {x: this.hexWidth/4, y: this.hexHeight},
      {x: 0, y: this.hexHeight/2},
      {x: this.hexWidth/4, y: 0},
      {x: this.hexWidth*3/4, y: 0},
      {x: this.hexWidth, y: this.hexHeight/2},
      {x: this.hexWidth*3/4, y: this.hexHeight}
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

    var hexShape = this.createHexShape(xmlDoc);
    subShapes.appendChild(hexShape);

    var textShape = this.createTextShape(xmlDoc);
    subShapes.appendChild(textShape);

    shape.appendChild(subShapes);

    xmlUtils.createShapeConnects(xmlDoc, shape, this.getRelativeConnectPoints());
  
    return shape;
  }

  createHexShape(xmlDoc) {
    var hexShape = xmlUtils.createElt(xmlDoc, "Shape");

    hexShape.setAttribute("ID", this.hexShapeId);
    hexShape.setAttribute("Type", "Shape");
    hexShape.setAttribute("Master", "11");

    hexShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.width/2));
    hexShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", this.textHeight + 6 + this.hexHeight/2));
    hexShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.hexWidth));
    hexShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.hexHeight));
    hexShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.hexWidth/2));
    hexShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.hexHeight/2));

    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
    hexShape.appendChild(xmlUtils.createCellElem(xmlDoc, "LinePattern", xmlUtils.getLinePattern(this.element.linePattern)));

    hexShape.appendChild(this.createHexGeo(xmlDoc));

    var connects = this.hexRelativeCoords;
    connects.unshift({x: this.hexWidth/2, y: this.hexHeight/2});
    xmlUtils.createShapeConnects(xmlDoc, hexShape, this.hexRelativeCoords);

    return hexShape;
  }

  createHexGeo(xmlDoc) {
    var geoIndex = 0;
    var section = xmlUtils.createElt(xmlDoc, "Section");

    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", geoIndex++);

    var length = this.hexRelativeCoords.length;
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, this.hexRelativeCoords[length - 1].x, this.hexRelativeCoords[length - 1].y));

    for (var coords of this.hexRelativeCoords) {
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

    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.width/2));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", this.textHeight/2));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.element.width));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.textHeight));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.element.width/2));
    textShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.textHeight/2));
    
    textShape.appendChild(this.createSectionChar(xmlDoc));
    textShape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));

    return textShape;
  }

  getConnectOrigin() {
    return {
      x: this.element.x - this.width/2,
      y: this.element.y - this.height/2 - this.hexHeight,
    };
  }

  getRelativeConnectPoints() {
    return this.hexRelativeCoords.map(p => 
      ({
        x: this.width/2 - this.hexWidth/2 + p.x,
        y: this.height/2 + p.y
      })
    );
  }
}

module.exports = Hexagon;