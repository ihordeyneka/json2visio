const input = require('./input/data.json');
const vsdx = require('./vsdx');

const options = {
  exportPath: 'output\\visio.vsdx'
}

vsdx(input, options);
