const input = require('./input/data.json');
const vsdxExport = require('./vsdx');

const options = {
  exportPath: 'output/visio.vsdx'
}

input.connections = [];

vsdxExport(input, options);

