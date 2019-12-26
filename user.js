const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Users = new mongoose.Schema({
  username: String,
  password: String,
});

// npm install passport-local-Mongoose
Users.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', Users);
