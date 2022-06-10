const multer = require('multer');
// MIME type configuration
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // set the destination folder for the images
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // set the name of the image and replace spaces by underscores
    const extension = MIME_TYPES[file.mimetype]; // get the extension of the file
    callback(null, name + Date.now() + '.' + extension); // set an other name with the date of the upload + the extension of the file
    
  }
});

module.exports = multer({storage: storage}).single('image');