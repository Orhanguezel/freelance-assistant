import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const defaultProjectsRoot = '/home/orhan/Documents/Projeler';
const outputPath = path.join(rootDir, 'data', 'knowledge.json');

const excluded = new Set([
  'Orhanguezel',
  'guezelwebdesign',
  'ayarlar',
  'openclaw',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listProjectDirs(projectsRoot) {
  return fs
    .readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !excluded.has(entry.name))
    .map((entry) => path.join(projectsRoot, entry.name));
}

function loadProjectMetadata(projectDir) {
  const metadataPath = path.join(projectDir, 'project.portfolio.json');
  if (!fs.existsSync(metadataPath)) return null;

  const metadata = readJson(metadataPath);
  if (metadata.excludeFromPortfolio) return null;

  return {
    title: metadata.title,
    category: metadata.category,
    summary: metadata.summary,
    techs: (metadata.techs || []).slice(0, 8),
    features: (metadata.features || []).slice(0, 4),
    websiteUrl: metadata.websiteUrl || null,
    featured: Boolean(metadata.featured),
  };
}

function main() {
  const projectsRoot = process.argv[2] || defaultProjectsRoot;
  const projects = listProjectDirs(projectsRoot)
    .map(loadProjectMetadata)
    .filter(Boolean)
    .sort((a, b) => {
      if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
      return a.title.localeCompare(b.title);
    });

  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: projectsRoot,
    projects,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`[knowledge-sync] updated ${outputPath}`);
  console.log(`[knowledge-sync] exported ${projects.length} projects`);
}

main();
