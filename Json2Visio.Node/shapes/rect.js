var xmlUtils = require('../xml-utils');

function Rect(element) {
  this.element = element;
  this.geo = {
    width: 120, //hardcoded
    height: 60,
    x: element.x,
    y: element.y
  };
};

Rect.prototype.createShape = function(xmlDoc, shapeId) {
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
  
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinX", geo.x + hw));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "PinY", xmlUtils.PAGE_HEIGHT - geo.y - hh));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Width", geo.width));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Height", geo.height));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinX", hw));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "LocPinY", hh));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LayerMember", layerIndex + ""));
  
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "FillForegnd", this.element.backgroundColor));
  shape.appendChild(xmlUtils.createCellElem(xmlDoc, "LineColor", this.element.borderColor));
  shape.appendChild(xmlUtils.createCellElemScaled(xmlDoc, "Rounding", 12));

  shape.appendChild(this.createSection(xmlDoc));
  shape.appendChild(xmlUtils.createTextElem(xmlDoc, this.element.name));

  return shape;
}

Rect.prototype.createSection = function createSection(xmlDoc) {
  var geoIndex = 0;
  var section = xmlUtils.createElt(xmlDoc, "Section");

  section.setAttribute("N", "Geometry");
  section.setAttribute("IX", geoIndex++);

  section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoFill", "0"));
  section.appendChild(xmlUtils.createCellElem(xmlDoc, "NoLine", "0"));
  //missing NoShow, NoSnap, NoQuickDrag

  var geo = this.geo;
  var w = geo.width;
	var h = geo.height;

  section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, h));
	section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w, h));
	section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w, 0));
	section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, 0));
	section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, h));

  return section;
};

module.exports = Rect;