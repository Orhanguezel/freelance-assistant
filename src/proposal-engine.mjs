import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function loadProfile() {
  const profilePath = path.join(rootDir, 'data', 'profile.json');
  return JSON.parse(readText(profilePath));
}

export function loadKnowledge() {
  const knowledgePath = path.join(rootDir, 'data', 'knowledge.json');
  if (!fs.existsSync(knowledgePath)) {
    return { generatedAt: null, source: 'missing', projects: [] };
  }
  return JSON.parse(readText(knowledgePath));
}

export function normalizeWhitespace(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function pickMatches(text, rules) {
  return rules.filter((rule) => rule.pattern.test(text)).map((rule) => rule.value);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function scoreProjectRelevance(project, briefText) {
  const haystack = normalizeWhitespace(
    [project.title, project.category, project.summary, ...(project.techs || []), ...(project.features || [])].join(' ')
  ).toLowerCase();

  let score = 0;
  const words = normalizeWhitespace(briefText)
    .toLowerCase()
    .split(' ')
    .filter((word) => word.length > 3);

  words.forEach((word) => {
    if (haystack.includes(word)) score += 1;
  });

  if (project.featured) score += 2;
  return score;
}

function selectRelevantProjects(briefText, knowledge) {
  return [...(knowledge.projects || [])]
    .map((project) => ({ ...project, score: scoreProjectRelevance(project, briefText) }))
    .sort((a, b) => b.score - a.score || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))
    .slice(0, 3);
}

export function detectFocusAreas(briefText) {
  const rules = [
    { pattern: /next|react|frontend|ui|arayuz/i, value: 'frontend gelistirme' },
    { pattern: /api|backend|fastify|laravel|node|server/i, value: 'backend entegrasyonu' },
    { pattern: /performans|speed|optimiz/i, value: 'performans iyilestirme' },
    { pattern: /form|validation|ak[iı]s/i, value: 'form ve kullanici akislari' },
    { pattern: /admin|panel|dashboard/i, value: 'yonetim paneli gelistirme' },
    { pattern: /deploy|canli|yayin|vps|hosting/i, value: 'canliya alma ve deployment destegi' },
    { pattern: /typescript/i, value: 'TypeScript ile duzenli kod yapisi' },
    { pattern: /seo/i, value: 'SEO uyumlu yapi' },
    { pattern: /e-?ticaret|shop|odeme|stripe|iyzipay/i, value: 'e-ticaret akislarinda tecrube' },
    { pattern: /s[aâ]as|crm|erp|booking|rezervasyon/i, value: 'is odakli platform gelistirme' }
  ];

  return unique(pickMatches(briefText, rules)).slice(0, 4);
}

export function detectStack(briefText) {
  const rules = [
    { pattern: /next/i, value: 'Next.js' },
    { pattern: /react/i, value: 'React' },
    { pattern: /typescript/i, value: 'TypeScript' },
    { pattern: /laravel/i, value: 'Laravel' },
    { pattern: /fastify/i, value: 'Fastify' },
    { pattern: /api/i, value: 'API integration' },
    { pattern: /form/i, value: 'form workflows' },
    { pattern: /performans|optimiz/i, value: 'performance work' },
    { pattern: /deploy|canli|vps|hosting/i, value: 'deployment support' }
  ];

  return unique(pickMatches(briefText, rules)).slice(0, 5);
}

export function estimateDelivery(briefText) {
  const normalized = normalizeWhitespace(briefText);
  let score = 0;

  const weightedRules = [
    { pattern: /api|entegrasyon/i, score: 2 },
    { pattern: /panel|dashboard|admin/i, score: 2 },
    { pattern: /performans|optimiz/i, score: 1 },
    { pattern: /form|validation|akis/i, score: 1 },
    { pattern: /backend|server|laravel|fastify|node/i, score: 2 },
    { pattern: /frontend|next|react|ui/i, score: 2 },
    { pattern: /odeme|stripe|iyzipay|e-?ticaret/i, score: 2 },
    { pattern: /cok dilli|i18n|seo|deploy|canli/i, score: 1 },
  ];

  weightedRules.forEach((rule) => {
    if (rule.pattern.test(normalized)) score += rule.score;
  });

  if (normalized.length > 350) score += 1;
  if (normalized.length > 700) score += 1;

  if (score <= 3) {
    return {
      label: '1-3 gun',
      note: 'kapsam muhtemelen hizli analiz ve hedefli duzenlemelerle tamamlanabilir',
    };
  }

  if (score <= 6) {
    return {
      label: '3-7 gun',
      note: 'orta olcekli duzenleme, entegrasyon ve test ihtiyaci gorunuyor',
    };
  }

  return {
    label: '1-2 hafta',
    note: 'birden fazla katman ve netlestirilmesi gereken teknik detaylar var',
  };
}

function platformStyle(platform) {
  if (platform === 'upwork') {
    return {
      shortCta: 'If you want, I can also outline scope, timeline and technical risks before we start.',
      toneIntro: 'I can move fast, communicate clearly and keep the work production-focused.',
      longGreeting: 'Hello,',
      longClosing: 'If useful, I can break the job into scope, estimate and next steps before kickoff.',
    };
  }

  return {
    shortCta: 'Isterseniz once kisa bir yol haritasi paylasayim.',
    toneIntro: 'Temiz kod, duzenli iletisim ve gerekirse canliya alma surecini de ustlenebilirim.',
    longGreeting: 'Merhaba,',
    longClosing: 'Isterseniz once ilani maddelere ayirip size su formatta net donebilirim: yapilacaklar, tahmini sure, oncelik sirasi ve varsa teknik riskler. Boylece ise baslamadan once kapsam netlesmis olur.',
  };
}

function inferOpening(briefText, title) {
  const normalized = normalizeWhitespace(briefText);
  if (title) return `${title} ilani icin yaziyorum.`;
  if (/next/i.test(normalized)) return 'Next.js odakli ilaniniza yaziyorum.';
  if (/api/i.test(normalized)) return 'API ve uygulama gelistirme ihtiyaciniz icin yaziyorum.';
  return 'Ilaninizi dikkatlice inceledim.';
}

export function buildShortProposal({ profile, briefText, title, platform }) {
  const focusAreas = detectFocusAreas(briefText);
  const opening = inferOpening(briefText, title);
  const firstStrength = focusAreas[0] || profile.strengths[0];
  const secondStrength = focusAreas[1] || profile.strengths[1];
  const style = platformStyle(platform);

  const base = normalizeWhitespace(
    `${opening} ${profile.shortBio} Bu iste ozellikle ${firstStrength} ve ${secondStrength} tarafinda hizli destek verebilirim. ${style.toneIntro} ${platform === 'bionluk' ? style.shortCta : profile.defaultCTA || style.shortCta}`
  );

  if (base.length <= 600) return base;

  const reduced = normalizeWhitespace(
    `${opening} ${profile.shortBio} ${firstStrength} ve ${secondStrength} tarafinda destek verebilirim. ${platform === 'upwork' ? 'I can keep the process clear and efficient.' : 'Temiz kod ve duzenli iletisimle ilerlerim.'} ${style.shortCta}`
  );

  return reduced.slice(0, 600).trim();
}

export function buildLongProposal({ profile, briefText, title, platform }) {
  const focusAreas = detectFocusAreas(briefText);
  const stack = detectStack(briefText);
  const focusText = focusAreas.length > 0 ? focusAreas.join(', ') : 'uygulama gelistirme ve teknik planlama';
  const stackText = stack.length > 0 ? stack.join(', ') : 'full-stack delivery';
  const proofText = profile.proofPoints.slice(0, 2).join(' ve ');
  const style = platformStyle(platform);
  const delivery = estimateDelivery(briefText);

  return [
    style.longGreeting,
    '',
    `${title ? `${title} ilani` : 'Ilaniniz'} benim calisma alanima dogrudan uyuyor. ${profile.shortBio}`,
    '',
    `Metne gore burada en kritik kisimlar ${focusText}. Bu taraflarda sadece gelistirme degil, isin teknik planini temiz kurup sureci daha risksiz ilerletmeye de odaklanirim.`,
    '',
    `Benzer tarafta ${proofText} gibi projelerde aktif calistim. Ozellikle ${stackText} gerektiren islerde mevcut yapinin hizli analizi, gerekli duzenlemelerin uygulanmasi ve gerekiyorsa canli ortama kadar destek verebilirim.`,
    '',
    `Ilk okumaya gore bu is icin makul ilk teslim araligi ${delivery.label}. Bunun nedeni ${delivery.note}.`,
    '',
    style.longClosing,
    '',
    profile.defaultCTA,
    '',
    profile.signature,
  ].join('\n');
}

export function buildRoutineNotes(briefText) {
  const focusAreas = detectFocusAreas(briefText);
  const stack = detectStack(briefText);

  return {
    focusAreas,
    stack,
    checklist: [
      'Ilan metnindeki asil ihtiyaci 1 cumlede ozetle',
      'Ilk mesajda en fazla 2-3 guclu eslesme kullan',
      'Kisa teklif 600 karakteri gecmesin',
      'Uzun teklifte cozum plani ve guven unsuru olsun',
      'Gerekirse teslim suresi ve kapsam icin ikinci mesaj hazirla'
    ]
  };
}

export function generateProposalPack({ briefText, title = '', platform = 'bionluk', profile = loadProfile() }) {
  const normalizedBrief = normalizeWhitespace(briefText);
  const knowledge = loadKnowledge();
  const shortProposal = buildShortProposal({ profile, briefText: normalizedBrief, title, platform });
  const longProposal = buildLongProposal({ profile, briefText: normalizedBrief, title, platform });
  const notes = buildRoutineNotes(normalizedBrief);
  const delivery = estimateDelivery(normalizedBrief);
  const relevantProjects = selectRelevantProjects(normalizedBrief, knowledge).map((project) => ({
    title: project.title,
    category: project.category,
    summary: project.summary,
    techs: project.techs,
    websiteUrl: project.websiteUrl,
  }));

  return {
    brief: normalizedBrief,
    shortProposal,
    shortLength: shortProposal.length,
    longProposal,
    notes,
    delivery,
    relevantProjects,
    knowledgeGeneratedAt: knowledge.generatedAt,
    profile,
    platform,
    title,
  };
}
