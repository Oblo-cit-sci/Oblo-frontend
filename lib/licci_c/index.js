// failed attempt to load everything from a folder

//var normalizedPath = require("path").join(__dirname, ".");

let path_l = require('path');
console.log(path_l)
let normalizedPath = path_l.join("../","licci");

console.log(normalizedPath);
require("fs").readdirSync("lib");
//console.log(normalizedPath);

/*
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  console.log(file)
  // require("./routes/" + file);
});
*/
