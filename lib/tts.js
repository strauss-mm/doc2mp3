const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const IS_WIN = process.platform === "win32";
const EDGE_TTS = path.join(__dirname, "..", ".venv", IS_WIN ? "Scripts" : "bin", "edge-tts");

const VOICES = [
  { id: "en-US-AriaNeural", name: "Aria (Female)", lang: "en-US" },
  { id: "en-US-GuyNeural", name: "Guy (Male)", lang: "en-US" },
  { id: "en-US-JennyNeural", name: "Jenny (Female)", lang: "en-US" },
  { id: "en-US-ChristopherNeural", name: "Christopher (Male)", lang: "en-US" },
  { id: "en-US-AnaNeural", name: "Ana (Female)", lang: "en-US" },
  { id: "en-US-EricNeural", name: "Eric (Male)", lang: "en-US" },
  { id: "en-GB-SoniaNeural", name: "Sonia (British Female)", lang: "en-GB" },
  { id: "en-GB-RyanNeural", name: "Ryan (British Male)", lang: "en-GB" },
  { id: "en-AU-NatashaNeural", name: "Natasha (Australian)", lang: "en-AU" },
];

async function textToMp3(text, outputPath, options = {}) {
  if (!fs.existsSync(EDGE_TTS)) {
    throw new Error("edge-tts not found. Run: npm run postinstall");
  }

  const voice = options.voice || "en-US-AriaNeural";
  const delta = options.speed ? Math.round((options.speed - 1) * 100) : 0;
  const rate = `${delta >= 0 ? "+" : ""}${delta}%`;

  const cleaned = text
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) throw new Error("No text content to convert");

  const tmpTxt = outputPath.replace(/\.mp3$/, ".txt");
  fs.writeFileSync(tmpTxt, cleaned);

  try {
    execFileSync(EDGE_TTS, [
      "--file", tmpTxt,
      "--voice", voice,
      "--rate", rate,
      "--write-media", outputPath,
    ], { timeout: 300000, stdio: "pipe" });

    const voiceInfo = VOICES.find((v) => v.id === voice);
    return {
      engine: "edge-tts",
      voice: voiceInfo ? voiceInfo.name : voice,
      voiceId: voice,
      chars: cleaned.length,
    };
  } finally {
    try { fs.unlinkSync(tmpTxt); } catch {}
  }
}

module.exports = { textToMp3, VOICES };
