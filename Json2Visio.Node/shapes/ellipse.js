var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Ellipse extends Base
{
  constructor(element) {
    super(element)
  }

  processGeometry(xmlDoc, section) {
    var geoIndex = 1;
    var w = this.geo.width;
    var h = this.geo.height;
  
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, h/2, "0", "Height/2"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "EllipticalArcTo", geoIndex++, w, h/2, "Width", "Height/2", w/2, h, w/h, "Width/2", "Height", "Width/Height"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "EllipticalArcTo", geoIndex++, 0, h/2, "0", "Height/2", w/2, 0, w/h, "Width/2", "0", "Width/Height"));
  }
}

module.exports = Ellipse;