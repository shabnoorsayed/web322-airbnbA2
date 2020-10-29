var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');


app.use(express.static('public'));

app.engine('.hbs', exphbs({ extname: '.hbs',  defaultLayout: 'main'}));
app.set('view engine', '.hbs');
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("home");
});
app.get("/room", (req, res) => {
    res.render("room");
});
app.get("/register", (req, res) => {
    res.render("register", {
        values: {
            message: 'Your message goes here.'
        }    
    });
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/dashboard", (req,res) => {
    res.render("dashboard");
});

app.post("/register", (req, res) => {
    console.log(req.body);

    let validation = {};
    let passed = true;
    const { lastName, firstName, email, password, birthdate } = req.body;

    if(typeof lastName !== 'string' || lastName.length === 0) {
        validation.lastName = "You must specify a last name.";
        passed = false;
    }

    if(typeof firstName !== 'string' || firstName.length === 0) {
        validation.firstName = "You must specify a first name.";
        console.log(validation.firstName);
        passed = false;
    }

    if(typeof email !== 'string' || email.length === 0) {
        validation.email = "You must specify a email address.";
        passed = false;
    }

    if(typeof password !== 'string' || password.length === 0) {
        validation.password = "You must specify your password.";
        passed = false;
    }

    if(typeof birthdate !== 'string' || birthdate.length === 0) {
        validation.birthdate = "You must specify a birth date.";
        passed = false;
    }
    else
    {
        var passw=  /^[A-Za-z]\w{6,12}$/.test(req.body.password);
        if(!(passw)) {
            validation.password = "invalid password, password should be at least 6 characters or numbers long(no special character)";
            passed = false;
        }

        var emailVal= /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email);
        if(!(emailVal)) {
            validation.password = "invalid email format";
            passed = false;
        }
    }

    if (passed) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        user: "shabnoorschool@gmail.com",
        pass: "sch00l123"
        });
        const msg = {
            to: `${req.body.email}`,
            from: 'ssayed10@senecacollege.ca',
            subject: 'registration Form Submission',
            html:
                `Full Name: ${firstName} ${lastName}<br>
                 Email Address: ${email}<br>                `
        };

        transporter.sendMail(msg, (err, resp) => {
        if (err) {
            console.log(err);
          } else {
            console.log(resp);
          }
            res.redirect("dashboard");
        });
    }
    else {
        res.render("register", {
            validation: validation,
            values: req.body
        });
    }
});


app.post("/login", (req, res) => {
    res.render("login");
});

app.post("/home", (req, res) => {
    res.render("home");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);