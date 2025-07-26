const db = require("../db/db"); // koneksi ke MySQL
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cek apakah user ada
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Email atau Password Salah" });
    }

    const user = rows[0];

    // Cek password
    const hash = user.password.replace("$2y$", "$2b$");
    const match = await bcrypt.compare(password, hash);
    if (!match) {
      return res.status(401).json({ message: "Email atau Password Salah" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
