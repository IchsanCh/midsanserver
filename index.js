require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 1031;

// Middleware
app.use(cors());
app.use(express.json()); // body parser

// Sample route
app.get("/", (req, res) => {
  res.send("Hello from Express 👋");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server ready on http://localhost:${PORT}`);
});
