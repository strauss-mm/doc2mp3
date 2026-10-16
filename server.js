const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { extractText, SUPPORTED_EXTENSIONS } = require("./lib/parsers");
const { textToMp3, VOICES } = require("./lib/tts");

const app = express();
const PORT = process.env.PORT || 3456;

const upload = multer({
  dest: path.join(__dirname, "uploads"),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/output", express.static(path.join(__dirname, "output")));

app.get("/api/config", (req, res) => {
  res.json({
    engine: "edge-tts",
    voices: VOICES,
    supportedFormats: SUPPORTED_EXTENSIONS,
  });
});

app.post("/api/convert", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      error: `Unsupported format: ${ext}. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`,
    });
  }

  const baseName = path.basename(req.file.originalname, ext);
  const outputName = `${baseName}_${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, "output", outputName);

  try {
    const text = await extractText(req.file.path);
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text content found in document" });
    }

    const voice = req.body?.voice;
    const speed = req.body?.speed ? parseFloat(req.body.speed) : undefined;

    const result = await textToMp3(text, outputPath, {
      voice,
      speed,
    });

    const stats = fs.statSync(outputPath);

    res.json({
      success: true,
      filename: outputName,
      url: `/output/${outputName}`,
      textLength: text.length,
      fileSize: stats.size,
      ...result,
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    try { fs.unlinkSync(req.file.path); } catch {}
  }
});

app.listen(PORT, () => {
  console.log(`\n  doc2mp3 running at http://localhost:${PORT}`);
  console.log(`  TTS engine: Edge TTS (Microsoft Neural)\n`);
});
