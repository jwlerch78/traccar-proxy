// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();

// ===== CONFIG =====
const TRACCAR_URL =
  process.env.TRACCAR_URL ||
  "https://traccar-render-k1th.onrender.com/api/positions?deviceId=";
const TRACCAR_USERNAME = process.env.TRACCAR_USERNAME || "jwlerch@gmail.com";
const TRACCAR_PASSWORD = process.env.TRACCAR_PASSWORD || "Rileydog80!";
const PORT = process.env.PORT || 3000;

// ===== CORS =====
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  next();
});

// ===== Handle OPTIONS preflight =====
app.options("/positions/:deviceId", (req, res) => res.sendStatus(200));
app.options("/reverse", (req, res) => res.sendStatus(200));

// ===== Proxy endpoint for Traccar positions =====
app.get("/positions/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;

  try {
    const auth = Buffer.from(`${TRACCAR_USERNAME}:${TRACCAR_PASSWORD}`).toString(
      "base64"
    );

    const response = await fetch(`${TRACCAR_URL}${deviceId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Traccar returned status ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching from Traccar:", err);
    res.status(500).json({ error: "Error fetching device location" });
  }
});

// ===== Reverse geocoding endpoint (fixed User-Agent) =====
app.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon query parameter" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          // Required by Nominatim to avoid 403
          "User-Agent": "FamilyDashboard/1.0 (jwlerch@gmail.com)"
        }
      }
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Nominatim returned status ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error reverse geocoding:", err);
    res.status(500).json({ error: "Error reverse geocoding coordinates" });
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
