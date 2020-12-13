const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema=new Schema
({
    userid:
    {
        type:String,
        required:true,
    },
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
  roomid:  
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

const bookRoomModel=mongoose.model("book",bookSchema);
module.exports=bookRoomModel;