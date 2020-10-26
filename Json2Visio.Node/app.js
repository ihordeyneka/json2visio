const input = require('./input/data.json');
const vsdxExport = require('./vsdx');

const options = {
  exportPath: 'output/visio.vsdx'
}

vsdxExport(input, options);
