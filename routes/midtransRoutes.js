const express = require("express");
const router = express.Router();
const db = require("../db/db");
const axios = require("axios");

router.post("/midtrans-callback", async (req, res) => {
  const data = req.body;

  try {
    // Determine forward URL
    let forwardUrl = null;
    const [rules] = await db.query(
      "SELECT target_url FROM redirect_rules WHERE ? LIKE CONCAT(pola_data, '%') LIMIT 1",
      [data.order_id]
    );

    if (rules.length > 0) {
      forwardUrl = rules[0].target_url;
    }

    // Save to DB
    const [result] = await db.execute(
      `
      INSERT INTO payments (
        order_id, transaction_id, transaction_status, transaction_time, settlement_time,
        gross_amount, payment_type, currency, merchant_id, biller_code, bill_key,
        fraud_status, signature_key, status_code, status_message, expiry_time,
        raw_payload, forward_status, forward_attempts, last_forward_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, NULL)
    `,
      [
        data.order_id,
        data.transaction_id,
        data.transaction_status,
        data.transaction_time,
        data.settlement_time,
        data.gross_amount,
        data.payment_type,
        data.currency,
        data.merchant_id,
        data.biller_code,
        data.bill_key,
        data.fraud_status,
        data.signature_key,
        data.status_code,
        data.status_message,
        data.expiry_time,
        JSON.stringify(data),
      ]
    );

    // Forward if needed
    if (forwardUrl) {
      try {
        await axios.post(forwardUrl, data);
        await db.execute(
          `
          UPDATE payments
          SET forward_status = 'success', forward_attempts = 1, last_forward_time = NOW()
          WHERE id = ?
        `,
          [result.insertId]
        );
      } catch (forwardErr) {
        await db.execute(
          `
          UPDATE payments
          SET forward_status = 'failed', forward_attempts = 1, last_forward_time = NOW()
          WHERE id = ?
        `,
          [result.insertId]
        );
        console.error("Forward failed:", forwardErr.message);
      }
    }

    res.status(200).json({ message: "Callback received and processed." });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
