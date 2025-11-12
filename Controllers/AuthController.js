const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User'); 


const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists, you can login',
        success: false,
      });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

  
    const userModel = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await userModel.save()
    res.status(201).json({
      message: 'Signup successfully',
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please register.',
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
        success: false,
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'yourSecretKey',
      { expiresIn: '1h' }
    );

    // ✅ Add `userId` in the response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user._id, // <-- add this
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
};

module.exports = { signup, login };
