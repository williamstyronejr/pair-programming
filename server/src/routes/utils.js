const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const mime = require('mime');

/**
 * Creates a file name using a string of 16 random chars with the date appended
 * @param {object} req Request object from route
 * @param {object} file File to create name for (to figuring out extension)
 * @param {function} cb Callback to send results to (err, filename)
 */
function createFileName(req, file, cb) {
  crypto.pseudoRandomBytes(16, (err, raw) => {
    const ext = mime.getExtension(file.mimetype);
    if (err) return cb(null, `${file.filename + Date.now()}.${ext}`);

    // Check extension type

    return cb(null, `${raw.toString('hex') + Date.now()}.${ext}`);
  });
}

/**
 * Filters a uploaded image to see if it meets the requirements. The file must
 * have a a extension of JPEG, PNG, or JPEG.
 * @param {object} req Express request object.
 * @param {object} file File information to be uploaded.
 * @param {function} cb Callback to receive a boolean indicating if the file
 *  should be uploaded.
 */
function imageFilter(req, file, cb) {
  const ext = mime.getExtension(file.mimetype);

  if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
    const err = new Error();
    err.status = 400;
    err.msg = { profile: 'Image provided is not acceptable format.' };
    return cb(err);
  }

  return cb(null, true);
}

const pictureStorage = multer.diskStorage({
  destination: path.join(__dirname, '../public/images/'),
  filename: createFileName
});

module.exports.profileUpload = multer({
  storage: pictureStorage,
  fileFilter: imageFilter
}).single('profile');
