const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    
    lastName:  
    {
        type:String,
        required:true
    },
    firstName:  
    {
        type:String,
        required:true
    },
    email:  
    {
        type:String,
        required:true,
        unique: true
    },
    password:  
    {
        type:String,
        required:true
    },
    birthdate :
    {
      type:Date,
      default: Date.now()
    },
    userType: {
		type:String,
		default:"user"
	}, 
  });

  userSchema.pre("save",function(next){
    bcrypt.genSalt(10)
        .then(salt=>{
            bcrypt.hash(this.password,salt)
            .then(hash=>{
                this.password=hash;
                next();
            })
        })

})

const userModel = mongoose.model("users",userSchema);

module.exports = userModel;