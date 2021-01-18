var xmlUtils = require('../xml-utils');

class Base
{
  constructor(element, shapeId, type) {
    this.element = element;
    this.shapeId = shapeId;
    this.type = type || 'Shape';
    this.rounding = 12;
    this.width = this.element.width;
    this.height = this.element.height;
  }

  createShape(xmlDoc) {
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
  
    var layerIndex = 0;
      
    shape.setAttribute("ID", this.shapeId);
    shape.setAttribute("Type", this.type);
    shape.setAttribute("NameU", "Shape" + this.shapeId);
    shape.setAttribute("LineStyle", "0");
    shape.setAttribute("FillStyle", "0");
    shape.setAttribute("TextStyle", "0");
    
    var hw = this.width/2, hh = this.height/2;
    
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.x));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - this.element.y));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", this.width));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", this.height));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", hw));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", hh));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LayerMember", layerIndex + ""));
    if (this.element.angle) {
      shape.appendChild(xmlUtils.createCellElem(xmlDoc, "Angle", xmlUtils.degressToRadians(this.element.angle)));
    }
    
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegndTrans", this.element.backgroundTransparent));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LinePattern", xmlUtils.getLinePattern(this.element.linePattern)));

    if (this.rounding)
      shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Rounding", this.rounding));
  
    shape.appendChild(this.createSectionChar(xmlDoc));
    shape.appendChild(this.createSectionGeo(xmlDoc));
    shape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));

    xmlUtils.createShapeConnects(xmlDoc, shape, this.getRelativeConnectPoints());
  
    return shape;
  }

  createSectionChar(xmlDoc) {
    var section = xmlUtils.createElt(xmlDoc, "Section");
  
    section.setAttribute("N", "Character");
  
    var row0 = xmlUtils.createEltWithIX(xmlDoc, "Row", 1);
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Font", "Calibri"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Color", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Style", "34"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Case", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Pos", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "FontScale", "1"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Size", "0.1388888888888889"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "DblUnderline", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Overline", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Strikethru", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "DoubleStrikethrough", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "Letterspace", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "ColorTrans", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "AsianFont", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "ComplexScriptFont", "0"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "ComplexScriptSize", "-1"));
    row0.appendChild(xmlUtils.createCellElem(xmlDoc, "LangID", "en-US"));
    section.appendChild(row0);
  
    var row1 = xmlUtils.createEltWithIX(xmlDoc, "Row", 2);
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Font", "Calibri"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Color", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Style", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Case", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Pos", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "FontScale", "1"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Size", "0.1666666666666667"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "DblUnderline", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Overline", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Strikethru", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "DoubleStrikethrough", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "Letterspace", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "ColorTrans", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "AsianFont", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "ComplexScriptFont", "0"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "ComplexScriptSize", "-1"));
    row1.appendChild(xmlUtils.createCellElem(xmlDoc, "LangID", "en-US"));
    section.appendChild(row1);
  
    return section;
  }

  createSectionGeo(xmlDoc) {
    var section = xmlUtils.createElt(xmlDoc, "Section");
  
    section.setAttribute("N", "Geometry");
    section.setAttribute("IX", 0);
  
    section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoFill", "0"));
    section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoLine", "0"));
    //missing NoShow, NoSnap, NoQuickDrag
  
    this.processGeometry(xmlDoc, section);
  
    return section;
  }

  processGeometry() {
    //implemented in actual shapes
  }

  getConnectOrigin() {
    return {
      x: this.element.x - this.width/2,
      y: this.element.y - this.height/2,
    };
  }

  getRelativeConnectPoints() {
    //might be overriden in actual shapes
    return [
      { x: this.width/2, y: 0 },
      { x: 0, y: this.height/2 },
      { x: this.width/2, y: this.height },
      { x: this.width, y: this.height/2 }
    ];
  }

  getConnectPoints() {
    var origin = this.getConnectOrigin();
    var points = this.getRelativeConnectPoints().map(p => 
      ({ x: origin.x + p.x, y: origin.y + p.y })
    );
    if (this.element.angle) {
      points = points.map(p => xmlUtils.rotatePoint(p, {x: this.element.x, y: this.element.y}, this.element.angle))
    }
    return points;
  }

}

module.exports = Base;