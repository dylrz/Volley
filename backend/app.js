const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express"),
  session = require("express-session"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  utils = require("./utils"),
  favicon = require("serve-favicon");

const http = require("http");

const User = require("./model/user");

const mainRoutes = require("./routes/mainRoutes");
const loginRoutes = require("./routes/loginRoutes");
const teamRoutes = require("./routes/teamRoutes");
const helpRoutes = require("./routes/helpRoutes");
const matchRoutes = require("./routes/matchRoutes");
const statRoutes = require("./routes/statRoutes");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

app.use(favicon(path.join(__dirname, "public", "imgs", "favicon.ico")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.MYSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// route to static files
app.use("/", express.static(path.join(__dirname, "public")));

// allows flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  res.locals.error = req.flash("error");
  next();
});

const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongoose");
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//connected to all route files
app.use(mainRoutes);
app.use(loginRoutes);
app.use(teamRoutes);
app.use(helpRoutes);
app.use(matchRoutes);
app.use(statRoutes);
app.use(videoRoutes);

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`Server Has Started at Port ${port}`);
});
