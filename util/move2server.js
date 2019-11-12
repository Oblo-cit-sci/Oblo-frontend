server_static_dir = "/media/ra/hd2/projects/licci/server/static/"

remove_entry_images = process.argv[2] ? false : true

var fs = require("fs-extra");
const pathf = require('path');



var source = "dist"
var destination = server_static_dir + "dist"


const deleteFolderRecursive = function(path) {
  if(path === "" ) {
    console.log("nope")
  }
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = pathf.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

if(remove_entry_images) {
  console.log("deleting all entry images")
  deleteFolderRecursive("dist/images/entry_images")
}

deleteFolderRecursive(destination + "/*")


// copy source folder to destination
fs.copy(source, destination, function (err) {
  if (err){
    console.log('An error occured while copying the folder.')
    return console.error(err)
  }
  console.log('Copy completed!')
});



