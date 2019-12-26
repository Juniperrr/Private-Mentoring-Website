const mongoose = require('mongoose');

// ####################### FIRST DRAFT #######################
const Posts = new mongoose.Schema({
  user: {type: String, required: true},
  postType: {type: String, required: true}, // as a mentee, as a ment]or
  area: {type: String, required: true}, // academics, career, general
  postName: {type: String, required: true},
  targetYear: {type: Number, min: 1, required: false},
  userEmail: {type: String, required: true},
  userPhone: {type: String, required: true},
  detail: {type: String, required: false},
  comments: {type: [String], required: false}, // "Contact me".[email, phone]"
  createdAt: {type: Date, required: false},
  closeAt: {type: Date, required: false},
  // details: [Detail]
});

module.exports = mongoose.model('posts', Posts);
