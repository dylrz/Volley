const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('../model/user')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

mongoose.connect('mongodb+srv://dylrz:ballsack@cluster0.rruns2s.mongodb.net/VolleyTracker?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})

const app = express()

app.use((req, res, next) => {
    // Add "POST" to the allowed methods in the response header
    res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    next();
});

app.use(cors( {
    credentials: true
}))

app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body

    console.log('Received username:', username);
    console.log('Received password:', password);

	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		// Set the response header to allow POST method
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

		return res.json({ status: 'ok', data: token })
	}

	// Set the response header to allow POST method
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.json({ status: 'error', error: 'Invalid username/password' })
})


app.post('/api/register', async (req, res) => {
    const { username, password: plainTextPassword } = req.body;
    console.log(req.body)
    if (!username || typeof username !== 'string') {
      return res.json({ status: 'error', error: 'Invalid username' });
    }
  
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
      return res.json({ status: 'error', error: 'Invalid password' });
    }
  
    if (plainTextPassword.length < 6) {
      return res.json({
        status: 'error',
        error: 'Password too small. Should be at least 6 characters',
      });
    }
  
    const password = await bcrypt.hash(plainTextPassword, 10);
  
    try {
      const response = await User.create({
        username,
        password,
      });
      console.log('User created successfully: ', response);

      res.json({ status: 'ok' });
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

// app.post('/api/change-password', async (req, res) => {
// 	const { token, newpassword: plainTextPassword } = req.body

// 	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
// 		return res.json({ status: 'error', error: 'Invalid password' })
// 	}

// 	if (plainTextPassword.length < 5) {
// 		return res.json({
// 			status: 'error',
// 			error: 'Password too small. Should be atleast 6 characters'
// 		})
// 	}

// 	try {
// 		const user = jwt.verify(token, JWT_SECRET)

// 		const _id = user.id

// 		const password = await bcrypt.hash(plainTextPassword, 10)

// 		await User.updateOne(
// 			{ _id },
// 			{
// 				$set: { password }
// 			}
// 		)
// 		res.json({ status: 'ok' })
// 	} catch (error) {
// 		console.log(error)
// 		res.json({ status: 'error', error: ';))' })
// 	}
// })

app.listen(12345, () => {
	console.log('Server up at 12345')
})