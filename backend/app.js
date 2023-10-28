// App.js
const path = require("path");
require('dotenv').config();

const express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

console.log(process.env)
const User = require("./model/user");
var app = express();

app.use(require("express-session")({
  secret: "Lick my sack!",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: 'auto',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

app.use('/', express.static(path.join(__dirname)));

const uri = process.env.MY_FUCKING_MONGODB_URI;

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to Mongoose')
});

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =====================
// ROUTES
// =====================
  
// Showing register form
app.get("/", function (req, res) {
    res.render("login-register");
});
  
// Handling user signup
app.post("/", async (req, res) => {
  try {
    const {name, email, createusername, createpassword, createpasswordconfirm} = req.body;
    
    if (createpassword !== createpasswordconfirm) {
      return res.render("login-register", {
         error: "Password doesn't match", 
         form: 'signup-form'
        });
    }
    else {
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        username: req.body.createusername,
        password: req.body.createpassword,
        passwordconf: req.body.createpasswordconfirm
        });
  
      req.session.username = user.name;
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('login-register', { error: "An error occurred during registration", form: 'register'})
  }
});
  
//Showing login form
app.get("/login", function (req, res) {
    res.render("login");
});
  
//Handling user login
app.post("/login", async function(req, res){
    try {
        // check if the user exists
        const user = await User.findOne({ username: req.body.username });
        if (user) {
          //check if password matches
          const result = req.body.password === user.password;
          if (result) {
            req.session.username = user.name
            res.redirect("/main");
          } else {
            res.render("login-register", { error: "Password doesn't match" });
          }
        } else {
          // res.status(400).json({ error: "User doesn't exist" });
          res.render("login-register", { error: "User doesn't exist" });
        }
      } catch (error) {
        // res.status(400).json({ error });
        res.render("login-register", { error: "An error occurred during login." });
      }
});
  
//Handling user logout 
app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
        // handle the error case
        console.error('Failed to destroy session during logout.', err);
        return res.redirect('/main');
    } else {
        req.logout()
        res.clearCookie('connect.sid', {path: '/'})
        res.redirect('/login-register');
    }
  });
});
  
app.get('/main', (req, res) => {
  if (req.session.username) {
    res.render('main', { name: req.session.username});
  } else {
    res.redirect('/')
  }
});
  
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
  
var port = process.env.PORT || 5001;
app.listen(port, function () {
    console.log(`Server Has Started at ${port}`);
});