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
const Team = require("./model/team");
const Player = require("./model/player");

var app = express();

// individual data
// cookies
app.use(session({
  secret: process.env.MYSECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

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
  
app.get("/", function (req, res) {
  res.render("index")
})

// Showing register form
app.get("/login-register", function (req, res) {
    res.render("login-register");
});
  
// Handling user signup
app.post("/login-register", async (req, res) => {
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

// login logic
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

app.get('/main', async (req, res) => {
  const username = req.session.username || 'Guest';

  // Assuming req.user is the authenticated user object added by Passport.js
  const userId = req.user ? req.user._id : null;
  console.log(userId)

  try {
    // Fetch all teams associated with the user
    const teams = userId ? await Team.find({ user: userId }) : [];

    // Render the main page with the teams
    res.render('main', {
      name: username,
      teams: teams // Pass all the user's teams to the main page template
    });
  } catch (error) {
    console.error("Failed to fetch the user's teams:", error);
    res.status(500).send("Error fetching teams information");
  }
});

app.get('/create-team', (req, res) => {
  res.render('create-team');
});

app.post('/create-team', async (req, res) => {
  try {
    req.session.teamInfo = {
      teamName: req.body.teamName,
      league: req.body.league,
      rosterSize: req.body.rosterSize,
      user: req.user._id
    };
    console.log(req.session.teamInfo)
    res.redirect('/player-entry?rosterSize=' + req.body.rosterSize);

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Route to render the player's entry form
app.get('/player-entry', (req, res) => {
  try {
    const rosterSize = req.query.rosterSize || req.session.rosterSize; // Use session or query
    res.render('player-entry', { rosterSize: rosterSize }); // This view will contain the form to input players' details
    console.log(rosterSize)
  } catch (error) {
    console.log(error);
    req.flash('error', 'All fields are required. Please try again.');
    res.status(500).render('create-team', { error: "An error occurred during submission", form: 'teamInfoForm'})
  }
});

app.post('/create-team-finalize', async (req, res) => {
  try {
    // Retrieve the team info
    const teamInfo = req.session.teamInfo;
    if (!teamInfo) {
      console.error('Team information is not available in the session.');
      return res.status(400).send('Session information for team creation is missing.');
    }
    console.log(teamInfo);
    
    // Initialize the team with the data that doesn't depend on the players
    const team = new Team({
      teamName: teamInfo.teamName,
      league: teamInfo.league,
      rosterSize: teamInfo.rosterSize,
      user: teamInfo.user,
      players: [] // Initially empty, we'll fill this in after creating the players
    });

    req.session.newTeamId = team._id;

    // Placeholder for player IDs
    const playerIds = [];

    // Iterate over the player data, create and save each player, and collect their IDs
    for (const playerData of req.body.players) {
      const player = new Player({
        playerName: playerData.playerName,
        playerNumber: playerData.playerNumber,
        position: playerData.position,
        playerStats: playerData.playerStats,
        team: team._id // Set the reference to the team's ID
      });
      const savedPlayer = await player.save(); // Save the player and get the result
      playerIds.push(savedPlayer._id); // Push the player's ID into the array
    }

    // Now that all players are created and we have their IDs, set the team's players array
    team.players = playerIds;
    
    // Finally, save the team with the player references
    await team.save();

    // Clean up the session
    delete req.session.teamInfo;
    
    // Redirect to a success page or send a successful response
    res.redirect('/main');
  } catch (error) {
    console.error('Failed to create team:', error);
    res.status(500).send('Failed to create team.');
  }
});

app.get('/team/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const team = await Team.findById(teamId).populate('players'); // Assuming your Team model has a 'players' field which is an array of ObjectIds referencing the 'Player' model

    if (!team) {
      return res.status(404).send("Team not found");
    }

    res.render('team', {
      team: team // This will have all the team info, including the populated 'players' array
    });
  } catch (error) {
    console.error("Failed to fetch the team details:", error);
    res.status(500).send("Error fetching team details");
  }
});

var port = process.env.PORT || 5001;
app.listen(port, function () {
    console.log(`Server Has Started at Port ${port}`);
});