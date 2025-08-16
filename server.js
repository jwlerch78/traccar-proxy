import express from 'express';
import fetch from 'node-fetch';
const app = express();
const PORT = process.env.PORT || 10000; // Render assigns PORT automatically

// --- CONFIG ---
const TRACCAR_URL = "https://demo.traccar.org/api/positions";
const TRACCAR_EMAIL = process.env.TRACCAR_EMAIL;       // we'll set as env vars
const TRACCAR_PASSWORD = process.env.TRACCAR_PASSWORD;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow your dashboard to fetch
  next();
});

app.get('/positions/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  try {
    const response = await fetch(`${TRACCAR_URL}?deviceId=${deviceId}`, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${TRACCAR_EMAIL}:${TRACCAR_PASSWORD}`).toString('base64')
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
