const fields = {
  projectName: document.getElementById("projectName"),
  clientName: document.getElementById("clientName"),
  ratePreset: document.getElementById("ratePreset"),
  hourlyRate: document.getElementById("hourlyRate"),
  projectType: document.getElementById("projectType"),
  pages: document.getElementById("pages"),
  complexity: document.getElementById("complexity"),
  revisions: document.getElementById("revisions"),
  rushFactor: document.getElementById("rushFactor"),
  discoveryHours: document.getElementById("discoveryHours"),
  designHours: document.getElementById("designHours"),
  devHours: document.getElementById("devHours"),
  pmHours: document.getElementById("pmHours"),
  scopeNotes: document.getElementById("scopeNotes")
};

const ui = {
  kpiRate: document.getElementById("kpiRate"),
  kpiHours: document.getElementById("kpiHours"),
  kpiRush: document.getElementById("kpiRush"),
  kpiTotal: document.getElementById("kpiTotal"),
  totalQuote: document.getElementById("totalQuote"),
  depositQuote: document.getElementById("depositQuote"),
  balanceQuote: document.getElementById("balanceQuote"),
  summaryMeta: document.getElementById("summaryMeta"),
  lineItems: document.getElementById("lineItems"),
  quoteText: document.getElementById("quoteText"),
  savedProjects: document.getElementById("savedProjects")
};

const ratePresets = {
  estonia: 45,
  eu: 75,
  us: 110,
  freelancer: 55,
  agency: 95,
  custom: null
};

const projectPresets = {
  landing: {
    projectType: "landing",
    pages: 1,
    complexity: "1",
    revisions: 2,
    discoveryHours: 2,
    designHours: 4,
    devHours: 8,
    pmHours: 2,
    scopeNotes: "Responsive landing page with CTA, polished layout, and deployment-ready handoff."
  },
  saas: {
    projectType: "saas",
    pages: 7,
    complexity: "1.75",
    revisions: 3,
    discoveryHours: 5,
    designHours: 14,
    devHours: 30,
    pmHours: 6,
    scopeNotes: "MVP SaaS interface with app shell, dashboard screens, settings, and polished product interactions."
  },
  portal: {
    projectType: "portal",
    pages: 6,
    complexity: "1.9",
    revisions: 3,
    discoveryHours: 4,
    designHours: 12,
    devHours: 24,
    pmHours: 5,
    scopeNotes: "Client portal with account area, documents, dashboards, and admin-friendly structure."
  },
  custom: {
    projectType: "custom",
    pages: 5,
    complexity: "1.35",
    revisions: 2,
    discoveryHours: 3,
    designHours: 8,
    devHours: 12,
    pmHours: 2,
    scopeNotes: "Custom scoped front-end build with responsive delivery and clean handoff."
  }
};

const storageKey = `${location.pathname}-quotecraft-projects`;
const themeKey = `${location.pathname}-quotecraft-theme`;

function formatMoney(value, suffix = "") {
  return `€${Math.round(value).toLocaleString("en-EE")}${suffix}`;
}

function getFormState() {
  return Object.fromEntries(
    Object.entries(fields).map(([key, el]) => [key, el.value])
  );
}

function setFormState(data) {
  Object.entries(data).forEach(([key, value]) => {
    if (fields[key]) fields[key].value = value;
  });
}

function applyRatePreset() {
  const rate = ratePresets[fields.ratePreset.value];
  if (rate !== null) fields.hourlyRate.value = rate;
  updateQuote();
}

function applyProjectPreset(name) {
  const preset = projectPresets[name];
  if (!preset) return;
  setFormState(preset);
  updateQuote();
}

function calculateQuote() {
  const rate = Number(fields.hourlyRate.value || 0);
  const pages = Number(fields.pages.value || 0);
  const complexity = Number(fields.complexity.value || 1);
  const revisions = Number(fields.revisions.value || 0);
  const rush = Number(fields.rushFactor.value || 1);
  const discovery = Number(fields.discoveryHours.value || 0);
  const design = Number(fields.designHours.value || 0);
  const development = Number(fields.devHours.value || 0);
  const pm = Number(fields.pmHours.value || 0);

  const pageStructureHours = pages * 1.5;
  const revisionHours = revisions * 1.5;
  const baseHours = discovery + design + development + pm + pageStructureHours + revisionHours;
  const totalHours = baseHours * complexity;
  const total = totalHours * rate * rush;

  return {
    rate,
    pages,
    complexity,
    rush,
    totalHours,
    total,
    deposit: total * 0.4,
    balance: total * 0.6,
    items: [
      {
        label: "Discovery and planning",
        detail: `${discovery}h`,
        value: discovery * rate * rush
      },
      {
        label: "Design",
        detail: `${design}h`,
        value: design * rate * rush
      },
      {
        label: "Development",
        detail: `${development}h`,
        value: development * rate * rush
      },
      {
        label: "Page / screen structure",
        detail: `${pages} × 1.5h`,
        value: pageStructureHours * rate * rush
      },
      {
        label: "Revision rounds",
        detail: `${revisions} × 1.5h`,
        value: revisionHours * rate * rush
      },
      {
        label: "Project management",
        detail: `${pm}h`,
        value: pm * rate * rush
      },
      {
        label: "Complexity adjustment",
        detail: `× ${complexity.toFixed(2)}`,
        value: (baseHours * rate * rush * complexity) - (baseHours * rate * rush)
      }
    ]
  };
}

function updateQuote() {
  const quote = calculateQuote();

  ui.kpiRate.textContent = formatMoney(quote.rate, "/hr");
  ui.kpiHours.textContent = `${Math.round(quote.totalHours)}h`;
  ui.kpiRush.textContent = `${quote.rush.toFixed(2)}x`;
  ui.kpiTotal.textContent = formatMoney(quote.total);

  ui.totalQuote.textContent = formatMoney(quote.total);
  ui.depositQuote.textContent = formatMoney(quote.deposit);
  ui.balanceQuote.textContent = formatMoney(quote.balance);
  ui.summaryMeta.textContent = `${Math.round(quote.totalHours)} hours at ${formatMoney(quote.rate, "/hr")}`;

  ui.lineItems.innerHTML = quote.items.map(item => `
    <div class="line-item">
      <div>
        <strong>${item.label}</strong>
        <small>${item.detail}</small>
      </div>
      <strong>${formatMoney(item.value)}</strong>
    </div>
  `).join("");

  ui.quoteText.value = `Quote for ${fields.clientName.value}
Project: ${fields.projectName.value}
Project type: ${fields.projectType.options[fields.projectType.selectedIndex].text}
Estimated total: ${formatMoney(quote.total)}
Estimated hours: ${Math.round(quote.totalHours)}h
Deposit: ${formatMoney(quote.deposit)}
Balance: ${formatMoney(quote.balance)}

Scope notes:
${fields.scopeNotes.value}`;
}

function getSavedProjects() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function setSavedProjects(projects) {
  localStorage.setItem(storageKey, JSON.stringify(projects));
}

function saveProject() {
  const quote = calculateQuote();
  const projects = getSavedProjects();

  projects.unshift({
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    form: getFormState(),
    total: quote.total,
    totalHours: quote.totalHours
  });

  setSavedProjects(projects.slice(0, 15));
  renderSavedProjects();
}

function loadProject(id) {
  const project = getSavedProjects().find(item => item.id === id);
  if (!project) return;
  setFormState(project.form);
  updateQuote();
}

function deleteProject(id) {
  const filtered = getSavedProjects().filter(item => item.id !== id);
  setSavedProjects(filtered);
  renderSavedProjects();
}

function renderSavedProjects() {
  const projects = getSavedProjects();

  if (!projects.length) {
    ui.savedProjects.innerHTML = `
      <div class="saved-project">
        <h4>No saved quotes yet</h4>
        <p>Save a project and it will stay in this browser.</p>
      </div>
    `;
    return;
  }

  ui.savedProjects.innerHTML = projects.map(project => `
    <div class="saved-project">
      <h4>${project.form.projectName}</h4>
      <p>${project.form.clientName} · ${formatMoney(project.total)} · ${Math.round(project.totalHours)}h</p>
      <div class="saved-actions">
        <button type="button" data-load="${project.id}">Load</button>
        <button type="button" data-delete="${project.id}">Delete</button>
      </div>
    </div>
  `).join("");
}

function copySummary() {
  navigator.clipboard.writeText(ui.quoteText.value);
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem(themeKey, theme);
}

function restoreTheme() {
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === "light") {
    document.body.classList.add("light");
  }
}

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => applyProjectPreset(btn.dataset.preset));
});

Object.values(fields).forEach(field => {
  field.addEventListener("input", updateQuote);
  field.addEventListener("change", updateQuote);
});

fields.ratePreset.addEventListener("change", applyRatePreset);

document.getElementById("saveBtn").addEventListener("click", saveProject);
document.getElementById("copyBtn").addEventListener("click", copySummary);
document.getElementById("printBtn").addEventListener("click", () => window.print());
document.getElementById("themeToggle").addEventListener("click", toggleTheme);

ui.savedProjects.addEventListener("click", (e) => {
  const loadId = e.target.getAttribute("data-load");
  const deleteId = e.target.getAttribute("data-delete");

  if (loadId) loadProject(loadId);
  if (deleteId) deleteProject(deleteId);
});

restoreTheme();
renderSavedProjects();
applyRatePreset();
updateQuote();
