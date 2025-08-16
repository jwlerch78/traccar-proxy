// server.js
const express = require("express");
const fetch = require("node-fetch");
const app = express();

// ===== CONFIG =====
const TRACCAR_URL = process.env.TRACCAR_URL || "https://traccar-render-k1th.onrender.com/api/positions/"; 
const TRACCAR_USERNAME = process.env.TRACCAR_USERNAME || "jwlerch@gmail.com";
const TRACCAR_PASSWORD = process.env.TRACCAR_PASSWORD || "Rileydog80!";
const PORT = process.env.PORT || 3000;

// ===== CORS =====
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow your dashboard to call
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// ===== Proxy endpoint =====
app.get("/positions/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;

  try {
    // Basic Auth header
    const auth = Buffer.from(`${TRACCAR_USERNAME}:${TRACCAR_PASSWORD}`).toString("base64");

    // Fetch from private Traccar server
    const response = await fetch(`${TRACCAR_URL}${deviceId}`, {
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Traccar returned status ${response.status}` });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Error fetching from Traccar:", err);
    res.status(500).json({ error: "Error fetching device location" });
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
