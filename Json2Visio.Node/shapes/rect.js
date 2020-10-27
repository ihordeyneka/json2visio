var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Rect extends Base
{
  constructor(element) {
    super(element)
  }

  processGeometry(xmlDoc, section) {
    var geoIndex = 1;
    var w = this.geo.width;
    var h = this.geo.height;
  
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, h));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w, h));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w, 0));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, 0));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, h));
  }
}

module.exports = Rect;