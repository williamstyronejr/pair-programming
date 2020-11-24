const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String },
  prompt: { type: String },
  tags: { type: String }, // List sparated by commas
  initialCode: [
    {
      language: { type: String },
      code: { type: String },
    },
  ],
  isPublic: { type: Boolean, default: false },
  meta: {
    created: { type: Date, default: Date.now },
    completed: { type: Number, default: 0 },
  },
});

const Challenge = mongoose.model('challenge', challengeSchema);
module.exports = Challenge;
