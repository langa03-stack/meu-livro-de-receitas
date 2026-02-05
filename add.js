// add.js
const STORAGE_KEY = "mlr_recipes_v2";

const form = document.getElementById("recipeForm");
const statusMsg = document.getElementById("statusMsg");

const titleEl = document.getElementById("title");
const originEl = document.getElementById("origin");
const categoryEl = document.getElementById("category");
const timeEl = document.getElementById("time");
const yieldEl = document.getElementById("yield");
const difficultyEl = document.getElementById("difficulty");

const imageFileEl = document.getElementById("imageFile");
const imagePreview = document.getElementById("imagePreview");

const ingredientInput = document.getElementById("ingredientInput");
const addIngredientBtn = document.getElementById("addIngredientBtn");
const clearIngredientsBtn = document.getElementById("clearIngredientsBtn");
const ingredientsListEl = document.getElementById("ingredientsList");

const blockTitleEl = document.getElementById("blockTitle");
const addBlockBtn = document.getElementById("addBlockBtn");
const blocksContainer = document.getElementById("blocksContainer");

const tipsEl = document.getElementById("tips");

let ingredients = [];
let blocks = [];
let imageDataUrl = "";

function loadRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function saveRecipes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function makeId() {
  return Date.now(); // simples e suficiente aqui
}
function setStatus(msg) {
  statusMsg.textContent = msg;
}

// ingredientes
function renderIngredients() {
  ingredientsListEl.innerHTML = ingredients
    .map((it, idx) => `<li>${escapeHtml(it)} <button type="button" data-rm-ing="${idx}">remover</button></li>`)
    .join("");
}
addIngredientBtn.addEventListener("click", () => {
  const v = ingredientInput.value.trim();
  if (!v) return;
  ingredients.push(v);
  ingredientInput.value = "";
  renderIngredients();
});
clearIngredientsBtn.addEventListener("click", () => {
  ingredients = [];
  renderIngredients();
});
ingredientsListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-rm-ing]");
  if (!btn) return;
  const idx = Number(btn.dataset.rmIng);
  ingredients.splice(idx, 1);
  renderIngredients();
});

// blocos
function renderBlocks() {
  blocksContainer.innerHTML = blocks.map((b, i) => `
    <div style="border:1px solid rgba(0,0,0,.12); border-radius:14px; padding:12px; margin-top:10px; background:rgba(255,255,255,.7);">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
        <strong>${escapeHtml(b.title)}</strong>
        <button type="button" data-rm-block="${i}">remover bloco</button>
      </div>
      <p style="opacity:.75; margin:8px 0 4px;">Passos (1 por linha) *</p>
      <textarea data-steps="${i}" style="width:100%; min-height:90px;" placeholder="Ex:
Bata as gemas com açúcar.
Misture o suco de laranja...">${escapeHtml(b.stepsText || "")}</textarea>

      <p style="opacity:.75; margin:10px 0 4px;">Nota (opcional)</p>
      <input data-note="${i}" style="width:100%;" placeholder="Ex.: Não abra o forno antes de 30 min."
             value="${escapeHtml(b.note || "")}" />
    </div>
  `).join("");
}
addBlockBtn.addEventListener("click", () => {
  const t = blockTitleEl.value.trim();
  if (!t) { setStatus("Escreva um título do bloco (ex.: Massa)."); return; }
  blocks.push({ title: t, stepsText: "", note: "" });
  blockTitleEl.value = "";
  renderBlocks();
});
blocksContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-rm-block]");
  if (!btn) return;
  blocks.splice(Number(btn.dataset.rmBlock), 1);
  renderBlocks();
});
blocksContainer.addEventListener("input", (e) => {
  const s = e.target.getAttribute("data-steps");
  const n = e.target.getAttribute("data-note");
  if (s !== null) blocks[Number(s)].stepsText = e.target.value;
  if (n !== null) blocks[Number(n)].note = e.target.value;
});

// imagem upload + compressão
imageFileEl.addEventListener("change", async () => {
  const file = imageFileEl.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { setStatus("Escolha uma imagem válida."); return; }

  try {
    imageDataUrl = await readAndCompressImage(file, 980, 0.78);
    imagePreview.src = imageDataUrl;
    setStatus("Imagem carregada ✅");
  } catch {
    imageDataUrl = "";
    setStatus("Falha ao processar imagem. Tente outra.");
  }
});

function readAndCompressImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleEl.value.trim();
  const time = timeEl.value.trim();
  const y = yieldEl.value.trim();

  if (title.length < 3) return setStatus("Nome inválido.");
  if (!time) return setStatus("Informe o tempo.");
  if (!y) return setStatus("Informe o rendimento.");
  if (!imageDataUrl) return setStatus("Selecione uma foto.");
  if (ingredients.length < 2) return setStatus("Adicione pelo menos 2 ingredientes.");
  if (blocks.length < 1) return setStatus("Crie pelo menos 1 bloco de preparo.");

  const stepsBlocks = blocks.map(b => {
    const steps = (b.stepsText || "").split("\n").map(s => s.trim()).filter(Boolean);
    return { title: b.title, steps, ...(b.note?.trim() ? { note: b.note.trim() } : {}) };
  });

  if (stepsBlocks.some(b => b.steps.length < 2)) return setStatus("Cada bloco precisa de pelo menos 2 passos.");

  const newRecipe = {
    id: makeId(),
    title,
    origin: originEl.value,
    category: categoryEl.value,
    image: imageDataUrl,
    time,
    yield: y,
    difficulty: difficultyEl.value,
    ingredients: [...ingredients],
    stepsBlocks,
    tips: tipsEl.value.split("\n").map(t => t.trim()).filter(Boolean)
  };

  const list = loadRecipes();
  list.unshift(newRecipe);
  saveRecipes(list);

  setStatus("Receita salva! Indo para o início…");
  setTimeout(() => (window.location.href = "./index.html"), 600);
});
