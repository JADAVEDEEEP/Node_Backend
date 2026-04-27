const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");
const sendWelcomeEmail = require("../services/emailService");

/** ek kam kar jo valdtion he usme sab type har ek line comment amarde kiss type ke valdtion hge
 * ============================
 *        SIGNUP FUNCTION
 * ============================
 * 🔹 SHORT EXPLANATION:
 * This function creates a new user account, saves it to the database, and sends a welcome email.
 *
 * 🔹 FULL EXPLANATION:
 * 1. Extracts user details from the request body.
 * 2. Checks if a user with the given email already exists.
 * 3. If yes → sends a 409 "User already exists" response.
 * 4. If no → hashes the password using bcrypt.
 * 5. Creates a new user and saves it in the database.
 * 6. Sends a welcome email using the email service.
 * 7. Finally responds with a success message and status 201.
 */
const signup = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body ?? {};

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: "firstName, lastName, email, and password are required.",
      success: false,
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Password and confirm password must match.",
      success: false,
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists, you can login.",
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

    await userModel.save();

    sendWelcomeEmail(email, firstName).catch((err) =>
      console.error("Email failed:", err.message)
    );

    return res.status(201).json({
      message: "Signup successful. Welcome email sent!",
      success: true,
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A user with that email already exists.",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/**
 * ============================
 *         LOGIN FUNCTION
 * ============================
 * 🔹 SHORT EXPLANATION:
 * This function validates user credentials and returns a JWT token if login is successful.
 *
 * 🔹 FULL EXPLANATION:
 * 1. Reads email and password from request body.
 * 2. Searches for a user with the given email.
 * 3. If no user is found → sends a 404 "User not found" response.
 * 4. Compares the provided password with the stored hashed password using bcrypt.
 * 5. If password is incorrect → sends a 401 error.
 * 6. If correct → generates a JWT token with user ID and email.
 * 7. Sends back user details + token so client can stay authenticated.
 */
const login = async (req, res) => {
  try {
    // 👉 VALIDATION: Extract login credentials
    const { email, password } = req.body;

    // 👉 VALIDATION: Check if user exists by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      // 👉 VALIDATION: User does not exist
      return res.status(404).json({
        message: "User not found. Please register.",
        success: false,
      });
    }

    // 👉 VALIDATION: Compare input password with stored hashed password
    // 👉 bcrypt plain text password ko internal hashing process se dobara hash-banata hai
    // 👉 phir us new hash ko database me stored hashed password se compare karta hai
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // 👉 VALIDATION: Agar compare false de to matlab password galat hai
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // 👉 VALIDATION: Generate JWT token for session authentication
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      success: true,
    });
  } catch (err) {
    console.error(err);

    // 👉 VALIDATION: Internal server error during login
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/**
 * ============================
 *       GET USERS FUNCTION
 * ============================
 * 🔹 SHORT EXPLANATION:
 * This function fetches all users from the database and returns them as a JSON response.
 *
 * 🔹 FULL EXPLANATION:
 * 1. Calls UserModel.find() to retrieve all user records from the database.
 * 2. If fetch is successful → sends a 200 response with user data.
 * 3. If an error occurs → logs the error and returns a 500 server error response.
 * 4. This function simply handles the business logic of reading all users and returning them.
 */
const getUsers = async (req, res) => {
  try {
    // 👉 VALIDATION: Fetch all users from MongoDB
    const users = await UserModel.find();

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    // 👉 VALIDATION: Error while fetching user list
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

module.exports = { signup, login, getUsers };
