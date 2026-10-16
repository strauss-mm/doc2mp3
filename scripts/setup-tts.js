const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VENV = path.join(ROOT, ".venv");
const IS_WIN = process.platform === "win32";
const PIP = path.join(VENV, IS_WIN ? "Scripts" : "bin", "pip");
const EDGE_TTS = path.join(VENV, IS_WIN ? "Scripts" : "bin", "edge-tts");

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: ROOT });
}

if (fs.existsSync(EDGE_TTS)) {
  console.log("  edge-tts already installed, skipping.\n");
  process.exit(0);
}

console.log("\n  Setting up edge-tts (Microsoft Neural TTS)...\n");

let python = null;
for (const cmd of ["python3", "python"]) {
  try {
    const ver = execSync(`${cmd} --version`, { encoding: "utf-8" }).trim();
    const major = parseInt(ver.split(" ")[1]);
    if (major >= 3) {
      python = cmd;
      console.log(`  Found ${ver}`);
      break;
    }
  } catch {}
}

if (!python) {
  console.error("\n  ERROR: Python 3 is required but not found.");
  console.error("  Install it from https://python.org or via your package manager.\n");
  process.exit(1);
}

if (!fs.existsSync(VENV)) {
  console.log("  Creating Python virtual environment...");
  run(`${python} -m venv "${VENV}"`);
}

console.log("  Installing edge-tts...");
run(`"${PIP}" install --quiet edge-tts`);

if (!fs.existsSync(EDGE_TTS)) {
  console.error("\n  ERROR: edge-tts installation failed.\n");
  process.exit(1);
}

console.log("  edge-tts installed successfully.\n");

for (const dir of ["uploads", "output"]) {
  const p = path.join(ROOT, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
