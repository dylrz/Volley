// App.js
const path = require("path");
require('dotenv').config();

const express = require("express"),
    session = require('express-session'),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    flash = require('connect-flash'),
    utils = require('./utils');

const User = require("./model/user");
var app = express();

// individual data
// cookies
app.use(session({
  secret: process.env.MYSECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: 'auto',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// http headers ensuring sensitive data isn't saved indefinitely
// has to fetch and render upon every request... maybe not good
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

// allows for flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.error = req.flash('error'); // Passport sets the 'error' flash message for failures
  next();
});

app.use('/', express.static(path.join(__dirname)));

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to Mongoose')
});

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

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
    const {name, email, createusername} = req.body;
    const createpassword = req.body.createpassword;
    const createpasswordconfirm = req.body.createpasswordconfirm;

    if (createpassword !== createpasswordconfirm) {
      return res.render("login-register", {
         error: "Passwords do not match", 
         form: 'signup-form'
        });
    }
    else {
      let newUser = new User ({
        name: name,
        email: email,
        username: createusername
      });

      let registeredUser = await User.register(newUser, createpassword);
  
      req.session.username = registeredUser.name;
      return res.redirect("/");
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

app.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      console.error('Authentication error:');
      return next(err); // this will result in a 500 error
    }
    // 'info' contains the feedback from the authentication strategy
    if (!user) {
      console.error('Login failed:', info.message);
      return res.render("login-register", { error: info.message });
    }
    req.logIn(user, function(err) {
      if (err) {
        console.error('Error logging in:', err);
        return next(err);
      }
      req.session.username = utils.toTitleCase(user.name);
      res.redirect("/main");
    });
  }) (req, res, next);
});
  
//Handling user logout 
app.get("/logout", function (req, res, next) {
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }
    // Destroy the session only after ensuring the logout was successful
    req.session.destroy(function (err) {
      if (err) {
        console.error('Failed to destroy session during logout.', err);
        return next(err);
      }
      // Only after destroying the session clear the cookie
      res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: 'auto', sameSite: 'strict' });
      res.redirect('/');
    });
  });
});

app.get('/main', (req, res) => {
  const username = 'Guest'
  if (req.session.username) {
    res.render('main', { name: req.session.username});
  } else if (username) {
    res.render('main', { name: username});
  }
  else {
    res.redirect('/')
  }
});
  
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

app.get('/create-team', (req, res) => {
  res.render('create-team');
});

app.post('/create-team', async (req, res) => {
  try {
    const { teamName, league, numPlayers } = req.body;

      const team = new Team({
        teamName,
        league,
        numPlayers
      });

    await team.save();

    // Send a successful response
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Route to render the player's entry form
app.get('/player-entry', (req, res) => {
  res.render('player-entry'); // This view will contain the form to input players' details
});

  
var port = process.env.PORT || 5001;
app.listen(port, function () {
    console.log(`Server Has Started at Port ${port}`);
});