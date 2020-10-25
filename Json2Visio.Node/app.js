const input = require('./input/data.json');
const VsdxExport = require('./vsdx-export');

var vsdx = new VsdxExport(input);
vsdx.exportCurrentDiagrams();
