import fs from 'node:fs';
import path from 'node:path';
import { generateProposalPack, readText } from './proposal-engine.mjs';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = '1';
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function resolveBriefText(args) {
  if (args.text) return args.text;

  if (args.brief === '-') {
    return (await readStdin()).trim();
  }

  if (args.brief) {
    const briefPath = path.resolve(process.cwd(), args.brief);
    if (!fs.existsSync(briefPath)) {
      throw new Error(`Brief file not found: ${briefPath}`);
    }
    return readText(briefPath);
  }

  throw new Error('Usage: npm run proposal:telegram -- --brief <path|-> [--text "..."] [--platform bionluk|upwork] [--title "..."] [--target <chatId>]');
}

function composeMessage(pack, mode) {
  const lines = [
    `Freelance Assistant`,
    ``,
    `Platform: ${pack.platform}`,
    `Kisa teklif (${pack.shortLength}/600):`,
    pack.shortProposal,
    ``,
    `Teslim onerisi: ${pack.delivery.label}`,
    `${pack.delivery.note}`,
    ``,
    `Ilgili projeler:`,
    ...pack.relevantProjects.slice(0, 3).map((project, index) => `${index + 1}. ${project.title} - ${project.category}`),
  ];

  if (mode === 'full') {
    lines.push('', 'Uzun teklif:', pack.longProposal);
  }

  return lines.join('\n').trim();
}

async function sendTelegramMessage({ token, target, text }) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: target,
      text,
      disable_web_page_preview: true,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(`Telegram send failed: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const briefText = await resolveBriefText(args);
  const pack = generateProposalPack({
    briefText,
    title: args.title || '',
    platform: (args.platform || 'bionluk').toLowerCase(),
  });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const target = args.target || process.env.TELEGRAM_CHAT_ID;

  if (!token || !target) {
    throw new Error('TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID gerekli');
  }

  const mode = args.mode === 'full' ? 'full' : 'short';
  const message = composeMessage(pack, mode);
  const result = await sendTelegramMessage({ token, target, text: message });

  console.log(JSON.stringify({
    ok: true,
    platform: pack.platform,
    shortLength: pack.shortLength,
    delivery: pack.delivery,
    target,
    messageId: result.result?.message_id || null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
