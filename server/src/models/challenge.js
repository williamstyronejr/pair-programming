const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String },
  prompt: { type: String },
  solution: { type: String },
  meta: {
    created: { type: Date, default: Date.now },
    completed: { type: Number, default: 0 }
  }
});

const Challenge = mongoose.model('challenge', challengeSchema);
module.exports = Challenge;
