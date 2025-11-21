const router = require('express').Router();
const { signup, login, getUsers } = require('../Controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middleware/AuthValidation');

//this get route is returning the users data to the client 
router.get('/getusers',getUsers)
//“this post route will store the user data into the server and create a new user for the client”
router.post('/signup', signupValidation, signup);
//⭐ “this post route will check the user’s email and password and allow the client to log in if the details match.”
router.post('/login', loginValidation, login);

module.exports = router;
