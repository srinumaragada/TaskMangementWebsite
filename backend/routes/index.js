const { default: mongoose } = require("mongoose");
const { registerUser, loginUser, logoutUser, authMiddleware } = require("../controller/auth");
const express = require("express");
const app = express();
const router = express.Router();

app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database connection unstable. Please try again later."
        });
    }
    next();
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;
