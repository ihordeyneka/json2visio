var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Diamond extends Base
{
  constructor(element, shapeId, diaShapeId, textShapeId) {
    super(element, shapeId, 'Group');
    this.diaShapeId = diaShapeId;
    this.textShapeId = textShapeId;
    this.textHeight = 23.368;
    this.diaWidth = 34.25952;
    this.diaHeight = 33.91408;
    this.marginHeight = 10.16;
    this.height = this.diaHeight + this.textHeight + this.marginHeight;
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
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.height));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.width/2, "Width/2"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.height/2, "Height/2"));
    if (this.element.angle) {
      shape.appendChild(xmlUtils.createCellElem(xmlDoc, "Angle", xmlUtils.degressToRadians(this.element.angle)));
    }
    
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

    diaShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.width/2));
    diaShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", this.textHeight + this.marginHeight + this.diaHeight/2));
    diaShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.diaWidth));
    diaShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.diaHeight));
    diaShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", this.diaWidth/2));
    diaShape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", this.diaHeight/2));

    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    diaShape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegndTrans", this.element.backgroundTransparent));
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
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, this.diaRelativeCoords[length - 1].x, this.diaRelativeCoords[length - 1].y));

    for (var coords of this.diaRelativeCoords) {
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
      y: this.element.y - this.height/2 - this.diaHeight,
    };
  }

  getRelativeConnectPoints() {
    var relativeCoords = [
      { x: this.diaWidth/4, y: this.diaHeight/4 },
      { x: this.diaWidth/2, y: 0 },
      { x: this.diaWidth/4, y: this.diaHeight*3/4 },
      { x: this.diaWidth, y: this.diaHeight/2 },
      { x: this.diaWidth*3/4, y: this.diaHeight*3/4 },
      { x: this.diaWidth/2, y: this.diaHeight },
      { x: this.diaWidth*3/4, y: this.diaHeight/4 },
      { x: 0, y: this.diaHeight/2 }
    ];

    return relativeCoords.map(p => 
      ({
        x: this.width/2 - this.diaWidth/2 + p.x,
        y: this.height/2 + p.y
      })
    );
  }
}

module.exports = Diamond;