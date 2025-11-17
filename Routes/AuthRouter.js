const router = require('express').Router();
const { signup, login, getUsers } = require('../Controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middleware/AuthValidation');


router.get('/getusers',getUsers)
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

module.exports = router;
