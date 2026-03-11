const exampleBrief = `Merhaba,

Next.js tabanli mevcut bir web projesinde duzenleme ve yeni ozellik destegi ariyoruz.
Panel tarafinda API entegrasyonu, form akislari ve performans iyilestirmeleri gerekiyor.

Tercihen TypeScript bilen, temiz kod yazan ve canliya alma surecinde destek olabilecek biriyle calismak istiyoruz.

Surekli calisabilecegimiz guvenilir bir gelistirici ariyoruz.`;

const platformEl = document.querySelector('#platform');
const titleEl = document.querySelector('#title');
const briefTextEl = document.querySelector('#briefText');
const generateButtonEl = document.querySelector('#generateButton');
const fillExampleButtonEl = document.querySelector('#fillExampleButton');
const shortProposalEl = document.querySelector('#shortProposal');
const longProposalEl = document.querySelector('#longProposal');
const shortLengthEl = document.querySelector('#shortLength');
const deliverySuggestionEl = document.querySelector('#deliverySuggestion');
const focusAreasEl = document.querySelector('#focusAreas');
const relevantProjectsEl = document.querySelector('#relevantProjects');
const checklistEl = document.querySelector('#checklist');
const copyShortButtonEl = document.querySelector('#copyShortButton');
const copyLongButtonEl = document.querySelector('#copyLongButton');

function renderList(element, values) {
  element.innerHTML = '';
  values.forEach((value) => {
    const li = document.createElement('li');
    li.textContent = value;
    element.appendChild(li);
  });
}

function renderProjects(projects) {
  relevantProjectsEl.innerHTML = '';
  projects.forEach((project) => {
    const item = document.createElement('article');
    item.className = 'project-item';
    item.innerHTML = `<strong>${project.title}</strong><span>${project.summary}</span>`;
    relevantProjectsEl.appendChild(item);
  });
}

async function copyText(text, button) {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  const original = button.textContent;
  button.textContent = 'Kopyalandi';
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

async function generate() {
  const briefText = briefTextEl.value.trim();
  if (!briefText) {
    briefTextEl.focus();
    return;
  }

  generateButtonEl.disabled = true;
  generateButtonEl.textContent = 'Uretiliyor...';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: platformEl.value,
        title: titleEl.value,
        briefText,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Bilinmeyen hata');
    }

    shortProposalEl.textContent = payload.shortProposal;
    longProposalEl.textContent = payload.longProposal;
    shortLengthEl.textContent = `${payload.shortLength}/600`;
    deliverySuggestionEl.innerHTML = `<strong>${payload.delivery.label}</strong><span>${payload.delivery.note}</span>`;
    renderList(focusAreasEl, payload.notes.focusAreas);
    renderProjects(payload.relevantProjects || []);
    renderList(checklistEl, payload.notes.checklist);
  } catch (error) {
    shortProposalEl.textContent = error.message;
  } finally {
    generateButtonEl.disabled = false;
    generateButtonEl.textContent = 'Teklifleri Uret';
  }
}

generateButtonEl.addEventListener('click', generate);
fillExampleButtonEl.addEventListener('click', () => {
  briefTextEl.value = exampleBrief;
  titleEl.value = 'Next.js gelistirme destegi';
});
copyShortButtonEl.addEventListener('click', () => copyText(shortProposalEl.textContent, copyShortButtonEl));
copyLongButtonEl.addEventListener('click', () => copyText(longProposalEl.textContent, copyLongButtonEl));
