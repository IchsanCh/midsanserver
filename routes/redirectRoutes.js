const express = require("express");
const router = express.Router();
const db = require("../db/db");

// GET semua rules
router.get("/redirect-rules", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM redirect_rules");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching rules" });
  }
});

// POST rule baru
router.post("/redirect-rules", async (req, res) => {
  const { pola_data, target_url } = req.body;
  try {
    await db.query(
      "INSERT INTO redirect_rules (pola_data, target_url) VALUES (?, ?)",
      [pola_data, target_url]
    );
    res.json({ message: "Redirect rule created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create rule" });
  }
});

// DELETE rule
router.delete("/redirect-rules/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM redirect_rules WHERE id = ?", [id]);
    res.json({ message: "Rule deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete rule" });
  }
});

router.put("/redirect-rules/:id", async (req, res) => {
  const { id } = req.params;
  const { pola_data, target_url } = req.body;

  try {
    await db.query(
      "UPDATE redirect_rules SET pola_data = ?, target_url = ? WHERE id = ?",
      [pola_data, target_url, id]
    );
    res.json({ message: "Redirect rule updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update rule" });
  }
});

module.exports = router;
