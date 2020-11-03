var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Rect extends Base
{
  constructor(element) {
    super(element)
  }

  processGeometry(xmlDoc, section) {
    var geoIndex = 1;
  
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, 0, "0", "Height"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, 0, "Width", "Height"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, 0, "Width", "0"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, 0, "0", "0"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, 0, "0", "Height"));
  }
}

module.exports = Rect;