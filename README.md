# doc2mp3

Convert any document into an MP3 using Microsoft Edge neural text-to-speech.

Drop a PDF, Word doc, Markdown file, or plain text — get a high-quality MP3 back.

## Quick Start

```bash
git clone <repo-url> doc2mp3
cd doc2mp3
npm install        # installs Node deps + sets up edge-tts automatically
npm start          # starts the web app at http://localhost:3456
```

That's it. Open http://localhost:3456 in your browser.

## Requirements

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Python 3.8+** — [python.org](https://python.org) (used for the TTS engine; auto-configured on `npm install`)

Both must be on your PATH. No API keys needed.

## Supported Formats

| Format | Extensions |
|--------|-----------|
| PDF | `.pdf` |
| Word | `.docx`, `.doc` |
| Text | `.txt`, `.csv`, `.log` |
| Markdown | `.md`, `.markdown` |
| HTML | `.html`, `.htm` |
| Rich Text | `.rtf` |
| JSON | `.json` |

## Voices

9 neural voices are available in the UI:

| Voice | Accent |
|-------|--------|
| Aria, Jenny, Ana | US Female |
| Guy, Christopher, Eric | US Male |
| Sonia | British Female |
| Ryan | British Male |
| Natasha | Australian Female |

Speed is adjustable from 0.5x to 2.0x.

## How It Works

1. Upload a document through the drag-and-drop web UI
2. The server extracts text using format-specific parsers (pdf-parse, mammoth, cheerio, marked)
3. Text is sent to Microsoft Edge's free neural TTS service via [edge-tts](https://github.com/rany2/edge-tts)
4. The resulting MP3 plays in-browser with a download button

## Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `PORT` | `3456` | Server port |

## Project Structure

```
doc2mp3/
├── server.js            # Express server
├── lib/
│   ├── parsers.js       # Document text extraction
│   └── tts.js           # Edge TTS integration
├── scripts/
│   └── setup-tts.js     # Auto-installs edge-tts on npm install
├── public/
│   └── index.html       # Web UI
├── uploads/             # Temp upload dir (auto-created, gitignored)
└── output/              # Generated MP3s (auto-created, gitignored)
```

## License

MIT
