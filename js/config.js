const mongoose = require('mongoose');

const Schema = mongoose.Schema;

  const taskSchema = new Schema({
    firstname:  String,
    lastname: String,
    email:String,
    password:String,
    birthday:Date
  });
  const users = mongoose.model('Tasks', taskSchema);
  module.exports=users;