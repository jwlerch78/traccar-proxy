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
const LOCATIONIQ_KEY = process.env.LOCATIONIQ_KEY; // 👈 add this in Render dashboard

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

app.get("/positions/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;
  const limit = req.query.limit || 1; // default to 1 if not provided

  try {
    const auth = Buffer.from(
      `${TRACCAR_USERNAME}:${TRACCAR_PASSWORD}`
    ).toString("base64");

    const url = `${TRACCAR_URL}${deviceId}&limit=${limit}`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      throw new Error(`Traccar responded with ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching positions:", err.message);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// ===== Reverse geocoding endpoint (LocationIQ) =====
app.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon query parameter" });
  }

  if (!LOCATIONIQ_KEY) {
    return res
      .status(500)
      .json({ error: "LOCATIONIQ_KEY not set in environment variables" });
  }

  try {
    const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `LocationIQ returned status ${response.status}` });
    }

    const data = await response.json();
    // Normalize output so your frontend doesn’t need changes
    res.json({
      display_name: data.display_name || "Unknown location",
      ...data,
    });
  } catch (err) {
    console.error("Error reverse geocoding:", err);
    res.status(500).json({ error: "Error reverse geocoding coordinates" });
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
