var xmlUtils = require('../xml-utils');

class Base
{
  constructor(element, shapeId, type) {
    this.element = element;
    this.shapeId = shapeId;
    this.type = type || 'Shape';
    this.geo = {
      width: element.width,
      height: element.height,
      x: element.x, //center
      y: element.y
    };
    this.rounding = 12;
  }

  createShape(xmlDoc) {
    var geo = this.geo;
  
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
  
    var layerIndex = 0;
      
    shape.setAttribute("ID", this.shapeId);
    shape.setAttribute("Type", this.type);
    shape.setAttribute("NameU", "Shape" + this.shapeId);
    shape.setAttribute("LineStyle", "0");
    shape.setAttribute("FillStyle", "0");
    shape.setAttribute("TextStyle", "0");
    //missing IsCustomNameU, Name, IsCustomName, Type
    
    var hw = geo.width/2, hh = geo.height/2;
    
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", geo.x));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - geo.y));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", geo.width));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", geo.height));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", hw));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", hh));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LayerMember", layerIndex + ""));
    
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
    shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));

    if (this.rounding)
      shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Rounding", this.rounding));
  
    shape.appendChild(this.createSectionChar(xmlDoc));
    shape.appendChild(this.createSectionGeo(xmlDoc));
    shape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));
  
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

  getConnectPoints() {
    return [
      { x: this.geo.x - this.geo.width/2, y: this.geo.y },
      { x: this.geo.x + this.geo.width/2, y: this.geo.y },
      { x: this.geo.x, y: this.geo.y - this.geo.height/2 },
      { x: this.geo.x, y: this.geo.y + this.geo.height/2 }
    ];
  }

}

module.exports = Base;