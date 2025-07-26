const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.email}`,
    user: req.user,
  });
});

module.exports = router;
