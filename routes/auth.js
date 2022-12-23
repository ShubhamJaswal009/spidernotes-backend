const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

// Jwt secret i.e signature which helps in identifying whether the payload is fabricated or not

const JWT_SECRET = 'thi$i$ajwttoken';

// Create a user using: POST request i.e router.post(), "api/auth/createuser" . No login required

router.post(
	'/createuser',
	[
		body('name', 'Please enter a valid name').isLength({ min: 3 }),
		body('email', 'Please enter a valid email address').isEmail(),
		body('password', 'Password must contain more than 5 characters').isLength({
			min: 5
		})
	],
	async (req, res) => {
		// if errors exists send a bad request else create a user

		// we'll use try catch block so that if some unexpected error comes it is handled
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			// check whether the email already exists or not.

			let user = await User.findOne({ email: req.body.email });
			if (user) {
				// if exists it returns a message saying it already exists.
				return res.status(400).json({ errors: 'This email already exists' });
			}

			// Creating a hash value for the password using salt

			const salt = bcrypt.genSaltSync(10);
			const hashPass = bcrypt.hashSync(req.body.password, salt);

			// Otherwise create new user using User.create() in the database by saving the details provided
			user = await User.create({
				name: req.body.name,
				email: req.body.email,
				password: hashPass
			});

			// Creating a jwt token for user, for his id so that we can check whether the user is legit
			const data = {
				user: {
					id: user.id
				}
			};
			const authToken = jwt.sign(data, JWT_SECRET);
			success = true;
			res.json({ success, authToken });
		} catch (error) {
			console.log(error.message);
			res.status(500).send('Internal Server Error');
		}
	}
);

// Authentication using: POST request i.e router.post(), "api/auth/login" . No login required
router.post(
	'/login',
	[
		body('email', 'Please enter a valid email address').isEmail(),
		body('password', 'Password can not be blank').exists()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;
		try {
			let user = await User.findOne({ email }); // pulling the email if it exists in the database
			if (!user) {
				return res
					.status(400)
					.json({ error: 'Please enter the correct credentials' });
			}
			const passwordCompare = await bcrypt.compare(password, user.password);
			if (!passwordCompare) {
				return res
					.status(400)
					.json({ error: 'Please enter the correct credentials' });
			}
			const data = {
				user: { id: user.id }
			};
			const authToken = jwt.sign(data, JWT_SECRET);
			success = true;
			res.send({ success, authToken });
		} catch (error) {
			console.log(error.message);
			res.status(500).send('Internal Server Error');
		}
	}
);
// Getting User Details using: POST request i.e router.post(), "api/auth/getuser" .login required
router.post('/getuser', fetchUser, async (req, res) => {
	try {
		let userId = req.user.id;
		const user = await User.findById(userId).select('-[password');
		res.send({ user });
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Internal Server Error');
	}
});

module.exports = router;
