server_static_dir = "../licci_be/app/"

remove_entry_images = process.argv[2] ? false : true

const fs = require("fs-extra");
const pathf = require('path');

const source = "dist"

destination_folder = "fe"

console.log("preparing copying")

server = process.env.SERVER || "production"
console.log("env.server", server)

if(process.env.SERVER === "local") {
  destination_folder = "fe"
}


console.log("destination", destination_folder)

const destination = server_static_dir + destination_folder

const deleteFolderRecursive = function(path) {
  // if(path === "" ) {
    // console.log("nope")
  // }
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
  console.log('Copy completed!', destination)
});



