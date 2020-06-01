const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');

const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Gets and returns file content.
 * @param {stirng} fileLoc
 * @param {function} cb Callback to receive err and file content
 */
function readHTMLFile(fileLoc, cb) {
  fs.readFile(fileLoc, { encoding: 'utf-8' }, (err, html) => {
    if (err) cb(err);
    cb(null, html);
  });
}

/**
 * Renders HTML template with given parameters to send as email.
 * @param {string} to Email to send to
 * @param {string} subject Subject for email
 * @param {string} fileName File name of template to send
 * @param {object} params Parmeters for template
 * @param {function} cb Callback to receive error if any occur
 */
exports.sendEmailTemplate = (to, subject, fileName, params, cb) => {
  readHTMLFile(path.join(__dirname, '../templates/', fileName), (err, html) => {
    if (err) return;

    const htmlRender = handlebars.compile(html);
    const htmlSend = htmlRender(params);

    transporter.sendMail(
      {
        to,
        subject,
        html: htmlSend,
      },
      (mailErr) => {
        if (mailErr) return cb(mailErr);
        return cb(null);
      }
    );
  });
};
