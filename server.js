var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const session = require('client-sessions');
var multer  = require('multer')
var fs = require('fs');
const room = require("./models/room");
const users = require('./models/user');
const bookRoom = require('./models/bookRoom');
const hasAccessAdmin = require("./middleware/admin");
const hasAccess = require("./middleware/authn");
const path = require("path");
const helpers = require('./js/helpers');
const { collection } = require("./models/room");
require('dotenv').config();


app.use(express.static('public'));
app.engine(".hbs", exphbs({ extname: ".hbs", defaultLayout: "main" }));
app.set("view engine", ".hbs");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride('_method'));
//////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use(session({
  cookieName: "session", 
  secret: "web322_assignment",
  duration: 3 * 60 * 1000, 
  activeDuration: 1000 * 60 
}));
app.use(function(req, res, next) {
  res.locals.session = req.session.userInfo;
  next();
});  
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'public/uploads');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

// var dbUserName = process.env.dbUserName;
// var dbPassword = process.env.dbPassword;
// var dbName = process.env.dbName;

const DBURL =
"mongodb+srv://dbUser:Pharmacy@senecaweb.za1wv.mongodb.net/web322?retryWrites=true&w=majority";
mongoose.connect(DBURL, {useNewUrlParser: true,
  useUnifiedTopology: true})
.then(()=>{
console.log(`Database is connected`)
})
.catch(err=>{
console.log(`not connected : ${err}`);
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", function(req,res){
  console.log('go to home');
  console.log(req.session.userInfo);
  res.render('home', {
    user: req.session.userInfo
  });
});

//POST (/)
app.post("/", async function(req,res){
  const query = {};
  if (req.query.location) {
      query.location = req.query.location;
  }
   collection.find().toArray(function(e, room) {
     console.log(room)
      res.render("room",
      {
        user: req.session.userInfo,
        "lists": room,
     });
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/room", (req, res) => {
  const query = {};
  if (req.query.location) {
      query.location = req.query.location;
  }
   collection.find().toArray(function(e, room) {
     console.log(room)
      res.render("room",
      {
        user: req.session.userInfo,
        "lists": room,
     });
  });
});
  

  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/register", (req, res) => {
  res.render("register", {
  });
});

app.post("/register", (req, res) => {
    const error = []; 
    const newUser = new users ({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      birthdate: req.body.birthdate
    });
      
    if (typeof req.body.lastName !== "string" || req.body.lastName.length === 0) {
      error.push("You must specify a last name");
    }
  
    if (typeof req.body.firstName !== "string" || req.body.firstName.length === 0) {
      error.push("You must specify a first name");
    }
  
    if (typeof req.body.email !== "string" || req.body.email.length === 0) {
      error.push("You must specify a email address");
    }
  
    if (typeof req.body.password !== "string" || req.body.password.length === 0) {
      error.push("You must specify your password");
    }
    if (typeof req.body.birthdate !== "string" || req.body.birthdate.length === 0) {
      error.push("You must specify a birth date");
    } 
    else {
      var passw = /^[a-zA-Z0-9]{6,12}$/.test(req.body.password);
      if (!passw) {
        error.push("invalid password, password should be at least 6 characters or numbers long(no special character)");
      }
      var emailVal = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        req.body.email
      );
      if (!emailVal) {
        error.push("invalid email format");
      }
    }
   if (error.length === 0) {
    users.findOne({email: newUser.email}, {error: error, newUser: newUser})
    .then(user => {
        if (user) {
          error.push("Email already exist");
            res.render("register", {
                     error: error          
                 });

        } else {
          newUser.save((err) => {
            if(err) {
              console.log(err);
            } else {
              // send email to new user
              //const {firstName, lastName, email} = req.body;
              const sgMail = require('@sendgrid/mail');
                  sgMail.setApiKey(process.env.SEND_GRIP_API_KEY);
                  console.log("shabnoor", process.env.SEND_GRIP_API_KEY);
              const msg = {
                to: `${newUser.email}`,
                from: "shabSchool123@gmail.com",
                subject: "registration Form Submission",
                html: `Full Name: ${newUser.firstName} ${newUser.lastName}<br>
                          Email Address: ${newUser.email}<br>                `,
              };
              sgMail.send(msg)
              .then(result=>{
                  console.log(`Email is sent! Result is: ${result}`);
              })
              .catch(err=>{
                  console.log(`there is an error: ${err}`)
              })
              res.redirect("/user");
            }
          });
        }
    });
   }
   if (error.length > 0) {
      res.render("register",{
          error: error          
      });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/login", (req, res) => {
  if (req.session.userInfo != null) {
    res.redirect("/");
  }else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  const error = []; 
    console.log(req.body.email);
    const data = {
      email: req.body.email,
      password: req.body.password
    };
    if (typeof req.body.email !== "string" || req.body.email.length === 0) {
      error.push("You must specify a email address");
    }
  
    if (typeof req.body.password !== "string" || req.body.password.length === 0) {
      error.push("You must specify your password");
    }
    if (error.length === 0) {
      users.findOne({email: data.email})
      .then(user => {
        if (user !== null) {
          console.log(user);
          bcrypt.compare(data.password, user.password)
          .then(isMatched => {

            // Password is good
            if (isMatched == true) {
                req.session.userInfo = user;
                if (user.userType === "admin") {
                  res.redirect("/admin");
              }
              else {
                  res.redirect("/user")
              }
                } 
                else {

                  error.push("Password is wrong");
                   res.render("login", {
                      error: error          
                  });
                }
              })
        } else {
            console.log("something is wrong");
            error.push("Email is wrong");
              res.render("login", {
                  error: error          
              });
          }
        });
      }
    if (error.length > 0) {
      res.render("login",{
          error: error          
      });
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/admin", hasAccessAdmin, (req, res) => {
  res.render("admin", {user: req.session.userInfo});
});
///////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/user",hasAccess, (req, res)=>
{
  collection.find().toArray({userid: req.session.userInfo._id})
  .then(bookedRooms => res.render("user", {"bookedRooms": bookedRooms, user: req.session.userInfo}))
})

///////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/")
});

/////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/add", (req, res) => {

  res.render("add",{user: req.session.userInfo});
});

app.post("/add", hasAccessAdmin, (req, res) => {

    let upload = multer({ storage: storage, fileFilter:helpers.imageFilter}).single('profile_pic');

    upload(req, res, function(err) {
      const error = [];
      if (req.body.title == "") {
            error.push("Please enter Room title")
      }
      if (req.body.price == "") {
            error.push("Please enter Room price")
      }
      if (req.body.location == "Anywhere") {
            error.push("Please enter location")
      }
      if (req.body.description == "") {
            error.push("Please enter Room description")
      }

      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any
  
      if (req.fileValidationError) {
        error.push(req.fileValidationError);
      }
      if (!req.file) {
          error.push('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          error.push(err);
      }
      else if (err) {
          error.push(err);
      }

      console.log('error validation', error);

      if (error.length > 0) {
        res.render('add', {error: error});
      } 

      if (error.length === 0) {
        const formData = {
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            location: req.body.location,
        }
      const ta = new room(formData);
      console.log(req.file);
      ta.save()
          .then(ta => {
                      room.findByIdAndUpdate(ta._id, {
                        profile_pic: req.file.filename
                      })
                          .then(() => {
                              console.log(`File name was updated in the database`)
                              res.redirect("/room");
                          })
                          .catch(err => console.log(`Error :${err}`));
           
          })
          .catch(err => console.log(`Error :${err}`));

      }
     
    });
});
///////////////////////////////////////////////////////////////////////////
app.get("/edit/:id", hasAccessAdmin,(req, res) => {
  console.log(req.params.id);
  room.findById(req.params.id)
      .then((task) => {
s
          res.render("edit", {
              taskDocument: task
          })

      })
      .catch(err => {
          console.log(`Error : ${err}`);
          res.redirect('/room')
      });
});

/*update edited information */

app.put("/edit/:id", hasAccessAdmin,(req, res) => {
  let upload = multer({ storage: storage, fileFilter:helpers.imageFilter}).single('profile_pic');

    upload(req, res, function(err) {
      const error = [];
 
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any
  
      if (req.fileValidationError) {
        error.push(req.fileValidationError);
      }
      if (!req.file) {
          error.push('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          error.push(err);
      }
      else if (err) {
          error.push(err);
      }

      console.log('error validation', error);

      if (error.length > 0) {
        res.render('add', {error: error});
      } 

      if (error.length === 0) {
        room.findById(req.params.id)
          .then((task) => {
            task.title = req.body.title;
            task.description = req.body.description;
            task.price = req.body.price;
            task.location = req.body.location;
            task.save()
            .then(task => {
              room.findByIdAndUpdate(ta._id, {
                profile_pic: req.file.filename
              })
            .then(() => {
                console.log(`File name was updated in the database`)
                res.redirect("/room");
            })
            .catch(err => console.log(`Error :${err}`));
        });
      });
    }
  });
});
  
  /*booking */
  app.get("/booking/:id", hasAccess, (req, res) =>{
      room.findById(req.params.id)
      .then(task=> {
          const booking = {
              roomid: task._id,
              userid: req.session.userInfo._id,
              title: task.title,
              location: task.location,
              description:task.description,
              price: task.price,
              profile_pic: task.profile_pic
          }
          const booked = new bookRoom(booking)
          booked.save()
          .then(() => res.redirect("/user"))
          console.log(`success!`)
      })
      .catch((error) => {
          res.redirect("/room")
          console.log(`error.`)})
  });

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
