import express from 'express';
import fetch from 'node-fetch';
const app = express();
const PORT = process.env.PORT || 10000;

const TRACCAR_URL = "https://demo.traccar.org/api/positions";
const TRACCAR_EMAIL = process.env.TRACCAR_EMAIL;
const TRACCAR_PASSWORD = process.env.TRACCAR_PASSWORD;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
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

    const text = await response.text(); // read raw text first
    try {
      const data = JSON.parse(text); // try to parse JSON
      res.json(data);
    } catch (err) {
      console.error("Traccar returned non-JSON response:", text);
      res.status(500).json({ error: "Traccar error", message: text });
    }
  } catch (err) {
    console.error("Proxy fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch positions", details: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
