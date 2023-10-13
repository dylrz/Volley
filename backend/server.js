const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieSession = require("cookie-session")
const path = require('path')
const bcrypt = require('bcryptjs')

const uri = process.env.MONGODB_URI

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(console.log('Connected to Mongoose'))

const app = express()

app.use((req, res, next) => {
    // Add "POST" to the allowed methods in the response header
    res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    next();
});

app.use(cors(corsOptions))

app.use('/', express.static(path.join(__dirname + '/backend', 'static')))
app.use(bodyParser.json())

app.post('/', async (req, res) => {
    const { name, email, username, password: plainTextPassword, passwordconfirm: plainTextPasswordConfirmation} = req.body;
    if (!username || typeof username !== 'string') {
      return res.json({ status: 'error', error: 'Invalid username' });
    }
  
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
      return res.json({ status: 'error', error: 'Invalid password' });
    }
  
    if (plainTextPassword.length < 8) {
      return res.json({
        status: 'error',
        error: 'Password too small. Should be at least 8 characters',
      });
    }

    if (plainTextPassword !== plainTextPasswordConfirmation) {
      return res.json({
        status: 'error',
        error: 'Passwords do not match. Try again'
      })
    }
    
    const password = await bcrypt.hash(plainTextPassword, 10);
  
    try {
      const response = await User.create({
        name,
        email,
        username,
        password
      });
      console.log('User created successfully: ', response);

      res.redirect('/main')
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key (username already in use)
        return res.json({ status: 'error', error: 'Username already in use' });
      }
      console.error(error);

      // Set the response header to allow POST method
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.status(500).json({ status: 'error', error: 'Internal server error' });
    }

});

app.listen(12345, () => {
	console.log('Server up at 12345')
})