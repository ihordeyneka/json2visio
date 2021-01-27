var Base = require('./base');
var xmlUtils = require('../xml-utils');

class Ellipse extends Base
{
  constructor(element, shapeId) {
    super(element, shapeId);
  }

  processGeometry(xmlDoc, section) {
    var geoIndex = 1;
    var w = this.element.width;
    var h = this.element.height;
  
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "MoveTo", geoIndex++, 0, h/2, "0", "Height/2"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "EllipticalArcTo", geoIndex++, w, h/2, "Width", "Height/2", w/2, h, 0, w/h, "Width/2", "Height", "No Formula", "Width/Height","DL","DL"));
    section.appendChild(xmlUtils.createRowScaled(xmlDoc, "EllipticalArcTo", geoIndex++, 0, h/2, "0", "Height/2", w/2, 0, 0, w/h, "Width/2", "0", "No Formula", "Width/Height","DL","DL"));
  }

  getRelativeConnectPoints() {
    var w = this.width;
    var h = this.height;
    var leftMidX = w/4;
    var rightMidX = w*3/4;
    var topMidY = w != 0 ? (h/2 + Math.sqrt(h*h/4 - h*h/(w*w)*(leftMidX-w/2)*(leftMidX-w/2))) : h/2;
    var bottomMidY = w != 0 ? (h/2 - Math.sqrt(h*h/4 - h*h/(w*w)*(leftMidX-w/2)*(leftMidX-w/2))) : h/2;

    return [
      { x: leftMidX, y: topMidY },
      { x: w/2, y: 0 },
      { x: leftMidX, y: bottomMidY },
      { x: w, y: h/2 },
      { x: rightMidX, y: bottomMidY },
      { x: w/2, y: h },
      { x: rightMidX, y: topMidY },
      { x: 0, y: h/2 }
    ];
  }
}

module.exports = Ellipse;