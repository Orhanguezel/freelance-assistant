import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateProposalPack } from './proposal-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const port = Number(process.env.PORT || 4177);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath, contentType) {
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(fs.readFileSync(filePath));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true, service: 'freelance-assistant' });
  }

  if (req.method === 'GET' && req.url === '/') {
    return sendFile(res, path.join(publicDir, 'index.html'), 'text/html; charset=utf-8');
  }

  if (req.method === 'GET' && req.url === '/app.css') {
    return sendFile(res, path.join(publicDir, 'app.css'), 'text/css; charset=utf-8');
  }

  if (req.method === 'GET' && req.url === '/app.js') {
    return sendFile(res, path.join(publicDir, 'app.js'), 'application/javascript; charset=utf-8');
  }

  if (req.method === 'POST' && req.url === '/api/generate') {
    try {
      const body = JSON.parse(await readBody(req));
      const briefText = String(body.briefText || '').trim();

      if (!briefText) {
        return sendJson(res, 400, { error: 'briefText is required' });
      }

      const pack = generateProposalPack({
        briefText,
        title: String(body.title || ''),
        platform: String(body.platform || 'bionluk').toLowerCase(),
      });

      return sendJson(res, 200, pack);
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`Freelance Assistant running at http://localhost:${port}`);
});
