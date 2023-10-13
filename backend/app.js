// App.js
  
const express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    path = require("path"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = 
        require("passport-local-mongoose")
const User = require("./model/user");
var app = express();
app.use('/', express.static(path.join(__dirname)))

const uri = 'mongodb+srv://dylrz:ballsack@cluster0.rruns2s.mongodb.net/VolleyTracker?retryWrites=true&w=majority'

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to Mongoose')
})
  
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));

  
app.use(passport.initialize());
app.use(passport.session());
  
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=====================
// ROUTES
//=====================
  
// Showing register form
app.get("/", function (req, res) {
    res.render("login-register");
});
  
// Handling user signup
app.post("/", async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    username: req.body.createusername,
    password: req.body.createpassword,
    passwordconf: req.body.createpasswordconfirm
    });
    
    res.render("main")
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
            res.render("main");
          } else {
            // res.status(400).json({ error: "password doesn't match" });
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
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login-register');
      });
});
  
app.get('/main', (req, res) => {
  res.render('main');
});
  
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
  
var port = process.env.PORT || 5001;
app.listen(port, function () {
    console.log(`Server Has Started at ${port}`);
});