// add.js
const STORAGE_KEY = "mlr_recipes_v2";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const form = document.getElementById("recipeForm");
const toast = document.getElementById("toast");

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

const imageFile = document.getElementById("imageFile");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");
const imagePreview = document.getElementById("imagePreview");

const blocksContainer = document.getElementById("blocksContainer");
const addBlockBtn = document.getElementById("addBlockBtn");
const clearBtn = document.getElementById("clearBtn");

let imageDataUrl = "";

function loadUserRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveUserRecipes(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function setError(fieldName, message) {
  const el = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (el) el.textContent = message || "";
}
function clearErrors() {
  document.querySelectorAll("[data-error-for]").forEach(el => (el.textContent = ""));
}

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 2200);
}

function sanitizeLine(s) {
  return String(s || "").trim();
}
function linesFromTextarea(value) {
  return String(value || "")
    .split("\n")
    .map(sanitizeLine)
    .filter(Boolean);
}
function genId() {
  return Number(`${Date.now()}${Math.floor(Math.random() * 90 + 10)}`);
}

function escapeHtmlAttr(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function escapeHtmlText(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function createBlockEditor(initial = { title: "", steps: "", note: "" }) {
  const wrap = document.createElement("div");
  wrap.className = "blockEditor";

  wrap.innerHTML = `
    <div class="blockEditor__row">
      <p class="blockEditor__name">Bloco</p>
      <button type="button" class="blockEditor__remove" title="Remover bloco">Remover</button>
    </div>

    <div class="field">
      <label class="label">Título do bloco *</label>
      <input class="input" type="text" name="blockTitle" maxlength="40"
        placeholder="Ex.: Preparação / Recheio / Finalização"
        value="${escapeHtmlAttr(initial.title)}" />
      <small class="hint">Até 40 caracteres</small>
    </div>

    <div class="field field--full">
      <label class="label">Passos *</label>
      <textarea class="input textarea" name="blockSteps" rows="5"
        placeholder="Um passo por linha">${escapeHtmlText(initial.steps)}</textarea>
      <small class="hint">Mínimo 2 passos por bloco</small>
    </div>

    <div class="field field--full">
      <label class="label">Nota / dica rápida (opcional)</label>
      <input class="input" type="text" name="blockNote" maxlength="90"
        placeholder="Ex.: Fogo baixo para não queimar"
        value="${escapeHtmlAttr(initial.note)}" />
      <small class="hint">Até 90 caracteres</small>
    </div>
  `;

  wrap.querySelector(".blockEditor__remove").addEventListener("click", () => wrap.remove());
  return wrap;
}

function initBlocks() {
  blocksContainer.innerHTML = "";
  blocksContainer.appendChild(createBlockEditor({ title: "Preparação", steps: "", note: "" }));
  blocksContainer.appendChild(createBlockEditor({ title: "Finalização", steps: "", note: "" }));
}
initBlocks();

addBlockBtn.addEventListener("click", () => {
  blocksContainer.appendChild(createBlockEditor({ title: "", steps: "", note: "" }));
});

imageFile.addEventListener("change", async () => {
  setError("imageFile", "");
  imageDataUrl = "";
  imagePreviewWrap.hidden = true;

  const file = imageFile.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("imageFile", "Selecione um arquivo de imagem válido (PNG/JPG/WebP).");
    imageFile.value = "";
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    setError("imageFile", "Imagem muito grande. O limite é 2 MB.");
    imageFile.value = "";
    return;
  }

  imageDataUrl = await fileToDataURL(file);
  imagePreview.src = imageDataUrl;
  imagePreviewWrap.hidden = false;
});

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function collectBlocks() {
  const editors = Array.from(blocksContainer.querySelectorAll(".blockEditor"));
  return editors
    .map(ed => {
      const title = sanitizeLine(ed.querySelector('input[name="blockTitle"]').value);
      const steps = linesFromTextarea(ed.querySelector('textarea[name="blockSteps"]').value);
      const note = sanitizeLine(ed.querySelector('input[name="blockNote"]').value);
      return { title, steps, note };
    })
    .filter(b => b.title || b.steps.length || b.note);
}

function validateForm(fields) {
  clearErrors();
  let ok = true;

  const title = sanitizeLine(fields.title.value);
  const category = fields.category.value;
  const origin = fields.origin.value;
  const time = sanitizeLine(fields.time.value);
  const yieldVal = sanitizeLine(fields.yield.value);
  const difficulty = fields.difficulty.value;

  const ingredientsLines = linesFromTextarea(fields.ingredients.value);
  const tipsLines = linesFromTextarea(fields.tips.value);

  if (title.length < 3 || title.length > 60) { setError("title", "Nome entre 3 e 60 caracteres."); ok = false; }
  if (!category) { setError("category", "Selecione a categoria."); ok = false; }
  if (!origin) { setError("origin", "Selecione a origem."); ok = false; }
  if (!time || time.length > 20) { setError("time", "Informe o tempo (até 20 caracteres)."); ok = false; }
  if (!yieldVal || yieldVal.length > 25) { setError("yield", "Informe o rendimento (até 25 caracteres)."); ok = false; }
  if (!difficulty) { setError("difficulty", "Selecione a dificuldade."); ok = false; }

  if (ingredientsLines.length < 2) { setError("ingredients", "Informe pelo menos 2 ingredientes (um por linha)."); ok = false; }
  if (!imageDataUrl) { setError("imageFile", "Envie uma imagem até 2 MB."); ok = false; }

  const blocks = collectBlocks();
  if (blocks.length < 1) { setError("stepsBlocks", "Adicione pelo menos 1 bloco de preparo."); ok = false; }
  else {
    for (const b of blocks) {
      if (!b.title || b.title.length > 40) { setError("stepsBlocks", "Cada bloco precisa de título (até 40)."); ok = false; break; }
      if (!b.steps || b.steps.length < 2) { setError("stepsBlocks", "Cada bloco precisa de pelo menos 2 passos."); ok = false; break; }
      if (b.note && b.note.length > 90) { setError("stepsBlocks", "Nota do bloco no máximo 90 caracteres."); ok = false; break; }
    }
  }

  return {
    ok,
    data: {
      title,
      category,
      origin,
      time,
      yield: yieldVal,
      difficulty,
      image: imageDataUrl,
      ingredients: ingredientsLines,
      stepsBlocks: blocks,
      tips: tipsLines
    }
  };
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const result = validateForm(form.elements);
  if (!result.ok) return;

  const newRecipe = { id: genId(), ...result.data };
  const current = loadUserRecipes();

  const exists = current.some(r => String(r.title).toLowerCase() === newRecipe.title.toLowerCase());
  if (exists) {
    setError("title", "Já existe uma receita com esse nome (salva no navegador).");
    return;
  }

  current.unshift(newRecipe);
  saveUserRecipes(current);

  showToast("Receita salva com sucesso! 🎉");
  form.reset();
  imageDataUrl = "";
  imagePreviewWrap.hidden = true;
  initBlocks();
});

clearBtn.addEventListener("click", () => {
  form.reset();
  clearErrors();
  imageDataUrl = "";
  imagePreviewWrap.hidden = true;
  initBlocks();
});

// menu mobile
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
