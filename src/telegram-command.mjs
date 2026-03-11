import { generateProposalPack } from './proposal-engine.mjs';

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
  return Buffer.concat(chunks).toString('utf8').trim();
}

function parseCommand(text) {
  const raw = String(text || '').trim();
  const lower = raw.toLowerCase();

  let platform = 'bionluk';
  let mode = 'short';
  let title = '';
  let briefText = raw;

  if (lower.startsWith('upwork teklif:')) {
    platform = 'upwork';
    briefText = raw.slice('upwork teklif:'.length).trim();
  } else if (lower.startsWith('bionluk teklif:')) {
    platform = 'bionluk';
    briefText = raw.slice('bionluk teklif:'.length).trim();
  } else if (lower.startsWith('teklif:')) {
    briefText = raw.slice('teklif:'.length).trim();
  } else if (lower.startsWith('upwork uzun teklif:')) {
    platform = 'upwork';
    mode = 'full';
    briefText = raw.slice('upwork uzun teklif:'.length).trim();
  } else if (lower.startsWith('bionluk uzun teklif:')) {
    platform = 'bionluk';
    mode = 'full';
    briefText = raw.slice('bionluk uzun teklif:'.length).trim();
  } else if (lower.startsWith('uzun teklif:')) {
    mode = 'full';
    briefText = raw.slice('uzun teklif:'.length).trim();
  }

  const titleMatch = briefText.match(/^baslik\s*:\s*(.+)$/im);
  if (titleMatch) {
    title = titleMatch[1].trim();
    briefText = briefText.replace(titleMatch[0], '').trim();
  }

  return { platform, mode, title, briefText };
}

function buildReply(pack, mode) {
  const blocks = [
    `Platform: ${pack.platform}`,
    `Kisa teklif (${pack.shortLength}/600):`,
    pack.shortProposal,
    '',
    `Teslim onerisi: ${pack.delivery.label}`,
    pack.delivery.note,
  ];

  if (mode === 'full') {
    blocks.push('', 'Uzun teklif:', pack.longProposal);
  }

  blocks.push(
    '',
    'Ilgili proje referanslari:',
    ...pack.relevantProjects.slice(0, 3).map((project, index) => `${index + 1}. ${project.title} - ${project.category}`)
  );

  return blocks.join('\n').trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args.text || await readStdin();

  if (!input) {
    throw new Error('Komut metni gerekli. Ornek: teklif: Next.js panel icin destek araniyor');
  }

  const parsed = parseCommand(input);
  if (!parsed.briefText) {
    throw new Error('Ilan metni bos. Ornek: teklif: Next.js panel icin destek araniyor');
  }

  const pack = generateProposalPack({
    briefText: parsed.briefText,
    title: parsed.title,
    platform: parsed.platform,
  });

  const reply = buildReply(pack, parsed.mode);
  console.log(reply);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
