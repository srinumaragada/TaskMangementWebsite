const bcrypt = require("bcrypt");
const jwt= require("jsonwebtoken");
const User = require("../../model/users");



const registerUser = async (req, res) => {
    const { userName, email, password } = req.body;

    // Basic validation
    if (!userName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        // Check for existing user by email only (since username is no longer unique)
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: "Email already in use. Please use a different email."
            });
        }

        // Create new user
        const hashPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
        });

        await newUser.save();
        
        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        let errorMessage = "Registration failed";
        let statusCode = 500;

        if (error.name === 'ValidationError') {
            // Handle mongoose validation errors
            errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
            statusCode = 400;
        }

        return res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials", // Generic message for security
      });
    }

    const isMatch = await bcrypt.compare(password, checkUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: checkUser._id,
        email: checkUser.email,
        userName: checkUser.userName,
        role: checkUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "60m" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: checkUser._id,
        email: checkUser.email,
        userName: checkUser.userName,
        role: checkUser.role,
      },
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const logoutUser = (req, res) => {
    res.clearCookie("token").json({
      success: true,
      message: "Logged out successfully!",
    });
  };
  
  //auth middleware
  const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });
  
    try {
      const decoded = jwt.verify(token,process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });
    }
  };
  
  
  module.exports = { registerUser, loginUser, logoutUser, authMiddleware };