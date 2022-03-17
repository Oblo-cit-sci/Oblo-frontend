const fs = require('fs');

// TODO: doesnt do much shit...
// directory path
const dir = '../components/';


// list all files in the directory
fs.readdir(dir, (err, files) => {
  if (err) {
    throw err;
  }

  // files object contains all files names
  // log them on console
  const REQS = {}
  files.forEach(file => {
    //  || file.endsWith('.vue')
    if (file.endsWith('.js')) {
      console.log(file);
      (async () => {
        const simple = await import('../components/' + file);

      })().catch(err => console.error(err));


    } else {
      // console.log("F- " + file);
    }
  });
});
