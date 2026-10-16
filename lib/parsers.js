const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const { marked } = require("marked");

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  switch (ext) {
    case ".pdf":
      return parsePdf(buffer);
    case ".docx":
      return parseDocx(filePath);
    case ".doc":
      return parseDocx(filePath);
    case ".txt":
    case ".csv":
    case ".log":
      return buffer.toString("utf-8");
    case ".md":
    case ".markdown":
      return parseMarkdown(buffer.toString("utf-8"));
    case ".html":
    case ".htm":
      return parseHtml(buffer.toString("utf-8"));
    case ".rtf":
      return stripRtf(buffer.toString("utf-8"));
    case ".json":
      return parseJson(buffer.toString("utf-8"));
    default:
      return buffer.toString("utf-8");
  }
}

async function parsePdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

function parseMarkdown(text) {
  const html = marked(text);
  return parseHtml(html);
}

function parseHtml(html) {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim() || $.text().replace(/\s+/g, " ").trim();
}

function stripRtf(text) {
  return text
    .replace(/\{\\[^{}]*\}/g, "")
    .replace(/\\[a-z]+\d*\s?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJson(text) {
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj, null, 2);
  } catch {
    return text;
  }
}

const SUPPORTED_EXTENSIONS = [
  ".pdf", ".docx", ".doc", ".txt", ".md", ".markdown",
  ".html", ".htm", ".rtf", ".csv", ".log", ".json",
];

module.exports = { extractText, SUPPORTED_EXTENSIONS };
