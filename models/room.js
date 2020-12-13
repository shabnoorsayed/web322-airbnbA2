const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema=new Schema
({
    title:  
  {
      type:String,
      required:true
  },
  price:  
  {
      type:Number,
      required:true
  },
  location:  
  {
      type:String,
      required:true,
  },
  description:  
  {
      type:String,
      required:true
  },
  profile_pic:
  {
      type:String
  }
});

const roomModel = mongoose.model("room",roomSchema);
module.exports = roomModel;