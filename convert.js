var map = require('./lib/risk/maps.js').classic();
var converter = require('./lib/risk/utils/map-converter');

console.log(JSON.stringify(converter(map), null, 4));
