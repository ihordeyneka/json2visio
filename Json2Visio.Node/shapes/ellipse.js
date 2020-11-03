var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Ellipse extends Base
{
  constructor(element) {
    super(element)
  }

  processGeometry(xmlDoc, section) {
    var geoIndex = 1;
  
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, 0, "0", "Height/2"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "EllipticalArcTo", geoIndex++, 0, 0, "Width", "Height/2", 0, 0, 0, 0, "Width/2", "Height", "No Formula", "Width/Height", "DL", "DL"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "EllipticalArcTo", geoIndex++, 0, 0, "0", "Height/2", 0, 0, 0, 0, "Width/2", "0", "No Formula", "Width/Height", "DL", "DL"));
  }
}

module.exports = Ellipse;