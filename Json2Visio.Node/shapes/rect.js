var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Rect extends Base
{
  constructor(element, shapeId) {
    super(element, shapeId);
    this.rounding = 12;
  }

  processGeometry(xmlDoc, section) {
    var geoIndex = 1;
    var w = this.element.width;
    var h = this.element.height;
  
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, h, "0", "Height"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w, h, "Width", "Height"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, w, 0, "Width", "0"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, 0, "0", "0"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "LineTo", geoIndex++, 0, h, "0", "Height"));
  }

  getRelativeConnectPoints() {
    return [
      { x: this.width/4, y: 0 },
      { x: this.width/2, y: 0 },
      { x: this.width*3/4, y: 0 },
      { x: 0, y: this.height/4 },
      { x: 0, y: this.height/2 },
      { x: 0, y: this.height*3/4 },
      { x: this.width/4, y: this.height },
      { x: this.width/2, y: this.height },
      { x: this.width*3/4, y: this.height },
      { x: this.width, y: this.height/4 },
      { x: this.width, y: this.height/2 },
      { x: this.width, y: this.height*3/4 }
    ];
  }
}

module.exports = Rect;