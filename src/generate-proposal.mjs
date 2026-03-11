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
    const stdinText = await readStdin();
    return stdinText.trim();
  }

  if (args.brief) {
    const briefPath = path.resolve(process.cwd(), args.brief);
    if (!fs.existsSync(briefPath)) {
      throw new Error(`Brief file not found: ${briefPath}`);
    }
    return readText(briefPath);
  }

  throw new Error('Usage: npm run proposal:generate -- --brief <path|-> [--text "..."] [--platform bionluk|upwork] [--title "..."]');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const briefText = await resolveBriefText(args);
  const pack = generateProposalPack({
    briefText,
    title: args.title || '',
    platform: (args.platform || 'bionluk').toLowerCase(),
  });

  console.log('=== ILAN OZETI ===');
  console.log(pack.brief);
  console.log('');

  console.log('=== KISA TEKLIF ===');
  console.log(pack.shortProposal);
  console.log('');
  console.log(`Karakter: ${pack.shortLength}/600`);
  console.log('');

  console.log('=== UZUN TEKLIF ===');
  console.log(pack.longProposal);
  console.log('');

  console.log('=== TESLIM SURESI ONERISI ===');
  console.log(`${pack.delivery.label} - ${pack.delivery.note}`);
  console.log('');

  console.log('=== ILGILI PROJE REFERANSLARI ===');
  pack.relevantProjects.forEach((project, index) => {
    console.log(`${index + 1}. ${project.title} - ${project.category}`);
    console.log(`   ${project.summary}`);
  });
  console.log('');

  console.log('=== ESLESME NOTLARI ===');
  console.log(`Odak alanlari: ${pack.notes.focusAreas.join(', ') || 'tespit edilmedi'}`);
  console.log(`Stack sinyalleri: ${pack.notes.stack.join(', ') || 'tespit edilmedi'}`);
  console.log('');

  console.log('=== GUNLUK RUTIN CHECKLIST ===');
  pack.notes.checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
