var xmlUtils = require('../xml-utils');

class Base
{
  constructor(element) {
    this.element = element;
    this.center = { x: element.x, y: element.y };
    this.type = 'Shape'; //might be overriden as Group
    this.rounding = 12;
  }

  createShape(xmlDoc, shapeId) {
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
  
    var layerIndex = 0;
      
    shape.setAttribute("ID", shapeId);
    shape.setAttribute("NameU", "Shape" + shapeId);
    shape.setAttribute("LineStyle", "0");
    shape.setAttribute("FillStyle", "0");
    shape.setAttribute("TextStyle", "0");
    
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", this.element.x));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - this.element.y));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", 0, "GUARD(TEXTWIDTH(theText) + 0.4)"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", 0, "GUARD(TEXTHEIGHT(theText,Width) + 0.4)"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", 0, "Width/2"));
    shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", 0, "Height/2"));
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

}

module.exports = Base;