exports.sendEmailTemplate = jest.fn((to, subject, fileName, params, cb) => {
  cb(null);
});
