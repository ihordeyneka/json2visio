var xmlUtils = require('../xml-utils');

class Base
{
  constructor(element) {
    this.element = element;
    this.geo = {
      width: 120, //hardcoded
      height: 60,
      x: element.x, //center
      y: element.y
    };
    this.rounding = 12;
  }

  createShape(xmlDoc, shapeId) {
    var geo = this.geo;
  
    var shape = xmlUtils.createElt(xmlDoc, "Shape");
  
    var layerIndex = 0;
      
    shape.setAttribute("ID", shapeId);
    shape.setAttribute("NameU", "Shape" + shapeId);
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
  
    //shape.appendChild(this.createSectionChar(xmlDoc));
    shape.appendChild(this.createSectionGeo(xmlDoc));
    shape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name, this.element.subName));
  
    return shape;
  }

  createSectionChar(xmlDoc) {
    var section = xmlUtils.createElt(xmlDoc, "Section");
  
    section.setAttribute("N", "Character");
  
    var row0 = xmlUtils.createEltWithIX(xmlDoc, "Row", 0);
    var cell0 = xmlUtils.createElt(xmlDoc, "Cell");
    cell0.setAttribute("Style", "17");
    row0.appendChild(cell0);
    section.appendChild(row0);
  
    var row1 = xmlUtils.createEltWithIX(xmlDoc, "Row", 1);
    var cell1 = xmlUtils.createElt(xmlDoc, "Cell");
    cell1.setAttribute("Font", "Calibri");
    cell1.setAttribute("Color", "0");
    cell1.setAttribute("Style", "34");
    cell1.setAttribute("Case", "0");
    cell1.setAttribute("Pos", "0");
    cell1.setAttribute("FontScale", "-1");
    cell1.setAttribute("Size", "17");
    row1.appendChild(cell1);
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