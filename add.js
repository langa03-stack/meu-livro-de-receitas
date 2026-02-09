// add.js (versão melhorada - ingredientes e preparo com editor completo)
const STORAGE_KEY = "mlr_recipes_v2"; // deve ser igual ao index

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

const tipsEl = document.getElementById("tips");

// ===== Ingredientes (novo) =====
const ingName = document.getElementById("ingName");
const ingQty = document.getElementById("ingQty");
const ingNote = document.getElementById("ingNote");
const addIngBtn = document.getElementById("addIngBtn");
const clearIngBtn = document.getElementById("clearIngBtn");
const ingList = document.getElementById("ingList");
const ingCount = document.getElementById("ingCount");

let ingredients = []; // {name, qty, note}

// ===== Preparo (novo) =====
const blockTitle = document.getElementById("blockTitle");
const blockTime = document.getElementById("blockTime");
const blockNote = document.getElementById("blockNote");
const createBlockBtn = document.getElementById("createBlockBtn");
const blocksContainer = document.getElementById("blocksContainer");
const blockCount = document.getElementById("blockCount");

let blocks = []; // {title, time, note, steps:[]}

// ===== Imagem =====
let imageDataUrl = "";

// Placeholder
imagePreview.src =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='900' height='650'>
    <rect width='100%' height='100%' fill='#f6f0e3'/>
    <text x='50%' y='50%' text-anchor='middle' font-family='Arial' font-size='26' fill='rgba(31,41,55,0.6)'>
      Selecione uma foto
    </text>
  </svg>`);

// ===== Helpers =====
function loadRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveRecipes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function makeId() {
  return Date.now();
}
function setStatus(msg, ok = true) {
  statusMsg.textContent = msg;
  statusMsg.style.color = ok ? "#067647" : "#b42318";
}
function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== Upload imagem =====
imageFileEl.addEventListener("change", async () => {
  const file = imageFileEl.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageDataUrl = "";
    setStatus("Escolha uma imagem válida (JPG/PNG/WebP).", false);
    return;
  }

  try {
    imageDataUrl = await readAndCompressImage(file, 980, 0.78);
    imagePreview.src = imageDataUrl;
    setStatus("Imagem carregada ✅");
  } catch {
    imageDataUrl = "";
    setStatus("Falha ao processar imagem. Tente outra.", false);
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
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ===== Ingredientes: render/editor =====
function renderIngredients() {
  ingCount.textContent = `(${ingredients.length})`;

  if (ingredients.length === 0) {
    ingList.innerHTML = `<div class="help">Nenhum ingrediente adicionado ainda.</div>`;
    return;
  }

  ingList.innerHTML = ingredients.map((it, idx) => `
    <div class="blockCard" style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
      <div>
        <div style="font-weight:800;">${esc(it.qty)} — ${esc(it.name)}</div>
        ${it.note ? `<div class="help">📝 ${esc(it.note)}</div>` : ""}
      </div>

      <div class="row" style="gap:8px;">
        <button type="button" class="btnSmall" data-ing-up="${idx}">↑</button>
        <button type="button" class="btnSmall" data-ing-down="${idx}">↓</button>
        <button type="button" class="btnSmall" data-ing-edit="${idx}">Editar</button>
        <button type="button" class="btnSmall danger" data-ing-del="${idx}">Remover</button>
      </div>
    </div>
  `).join("");
}

function addIngredient() {
  const name = ingName.value.trim();
  const qty = ingQty.value.trim();
  const note = ingNote.value.trim();

  if (!name || !qty) {
    setStatus("Preencha Ingrediente e Quantidade/Medida.", false);
    return;
  }

  ingredients.push({ name, qty, note });
  ingName.value = "";
  ingQty.value = "";
  ingNote.value = "";
  ingName.focus();

  setStatus("Ingrediente adicionado ✅");
  renderIngredients();
}

addIngBtn.addEventListener("click", addIngredient);

ingQty.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addIngredient();
  }
});

clearIngBtn.addEventListener("click", () => {
  ingredients = [];
  renderIngredients();
  setStatus("Lista de ingredientes limpa.");
});

ingList.addEventListener("click", (e) => {
  const up = e.target.closest("[data-ing-up]");
  const down = e.target.closest("[data-ing-down]");
  const del = e.target.closest("[data-ing-del]");
  const edit = e.target.closest("[data-ing-edit]");

  if (up) {
    const i = Number(up.dataset.ingUp);
    if (i > 0) [ingredients[i - 1], ingredients[i]] = [ingredients[i], ingredients[i - 1]];
    return renderIngredients();
  }
  if (down) {
    const i = Number(down.dataset.ingDown);
    if (i < ingredients.length - 1) [ingredients[i + 1], ingredients[i]] = [ingredients[i], ingredients[i + 1]];
    return renderIngredients();
  }
  if (del) {
    const i = Number(del.dataset.ingDel);
    ingredients.splice(i, 1);
    return renderIngredients();
  }
  if (edit) {
    const i = Number(edit.dataset.ingEdit);
    const it = ingredients[i];
    const newName = prompt("Ingrediente:", it.name);
    if (newName === null) return;
    const newQty = prompt("Quantidade/Medida:", it.qty);
    if (newQty === null) return;
    const newNote = prompt("Nota (opcional):", it.note || "");
    if (newNote === null) return;

    ingredients[i] = { name: newName.trim(), qty: newQty.trim(), note: newNote.trim() };
    return renderIngredients();
  }
});

// ===== Blocos de preparo: render/editor =====
function renderBlocks() {
  blockCount.textContent = `(${blocks.length} bloco(s))`;

  if (blocks.length === 0) {
    blocksContainer.innerHTML = `<div class="help">Crie um bloco (ex.: Massa) e adicione passos.</div>`;
    return;
  }

  blocksContainer.innerHTML = blocks.map((b, idx) => `
    <div class="blockCard">
      <div class="blockHeader">
        <div>
          <div style="font-weight:900; font-size:16px;">${esc(b.title)} ${b.time ? `<span class="help">• ⏱ ${esc(b.time)}</span>` : ""}</div>
          ${b.note ? `<div class="help">💡 ${esc(b.note)}</div>` : ""}
        </div>

        <div class="row" style="gap:8px;">
          <button type="button" class="btnSmall" data-block-up="${idx}">↑</button>
          <button type="button" class="btnSmall" data-block-down="${idx}">↓</button>
          <button type="button" class="btnSmall" data-block-edit="${idx}">Editar</button>
          <button type="button" class="btnSmall danger" data-block-del="${idx}">Remover</button>
        </div>
      </div>

      <div class="row" style="margin-top:10px;">
        <input data-step-input="${idx}" placeholder="Adicionar um passo (ex.: Bata as gemas com açúcar...)" style="flex:1; padding:10px 12px; border-radius:12px; border:1px solid rgba(31,41,55,.18);" />
        <button type="button" class="btnSmall" data-step-add="${idx}">+ Passo</button>
      </div>

      <ol style="margin-top:10px; padding-left:18px;">
        ${(b.steps || []).map((s, si) => `
          <li style="margin-bottom:8px; line-height:1.55;">
            ${esc(s)}
            <span style="margin-left:10px;">
              <button type="button" class="btnSmall" data-step-up="${idx}:${si}">↑</button>
              <button type="button" class="btnSmall" data-step-down="${idx}:${si}">↓</button>
              <button type="button" class="btnSmall" data-step-edit="${idx}:${si}">Editar</button>
              <button type="button" class="btnSmall danger" data-step-del="${idx}:${si}">Remover</button>
            </span>
          </li>
        `).join("")}
      </ol>

      <div class="help">Dica: cada passo deve ser curto, claro e direto.</div>
    </div>
  `).join("");
}

createBlockBtn.addEventListener("click", () => {
  const title = blockTitle.value.trim();
  const time = blockTime.value.trim();
  const note = blockNote.value.trim();

  if (!title) {
    setStatus("Escreva o título do bloco (ex.: Massa).", false);
    return;
  }

  blocks.push({ title, time, note, steps: [] });

  blockTitle.value = "";
  blockTime.value = "";
  blockNote.value = "";

  setStatus("Bloco criado ✅");
  renderBlocks();
});

blocksContainer.addEventListener("click", (e) => {
  // blocos
  const up = e.target.closest("[data-block-up]");
  const down = e.target.closest("[data-block-down]");
  const del = e.target.closest("[data-block-del]");
  const edit = e.target.closest("[data-block-edit]");

  if (up) {
    const i = Number(up.dataset.blockUp);
    if (i > 0) [blocks[i - 1], blocks[i]] = [blocks[i], blocks[i - 1]];
    return renderBlocks();
  }
  if (down) {
    const i = Number(down.dataset.blockDown);
    if (i < blocks.length - 1) [blocks[i + 1], blocks[i]] = [blocks[i], blocks[i + 1]];
    return renderBlocks();
  }
  if (del) {
    const i = Number(del.dataset.blockDel);
    blocks.splice(i, 1);
    return renderBlocks();
  }
  if (edit) {
    const i = Number(edit.dataset.blockEdit);
    const b = blocks[i];

    const newTitle = prompt("Título do bloco:", b.title);
    if (newTitle === null) return;

    const newTime = prompt("Tempo (opcional):", b.time || "");
    if (newTime === null) return;

    const newNote = prompt("Nota (opcional):", b.note || "");
    if (newNote === null) return;

    blocks[i] = { ...b, title: newTitle.trim(), time: newTime.trim(), note: newNote.trim() };
    return renderBlocks();
  }

  // adicionar passo
  const addStep = e.target.closest("[data-step-add]");
  if (addStep) {
    const bi = Number(addStep.dataset.stepAdd);
    const input = blocksContainer.querySelector(`[data-step-input="${bi}"]`);
    const text = input.value.trim();
    if (!text) return setStatus("Escreva o passo antes de adicionar.", false);
    blocks[bi].steps.push(text);
    input.value = "";
    setStatus("Passo adicionado ✅");
    return renderBlocks();
  }

  // passos
  const stepUp = e.target.closest("[data-step-up]");
  const stepDown = e.target.closest("[data-step-down]");
  const stepDel = e.target.closest("[data-step-del]");
  const stepEdit = e.target.closest("[data-step-edit]");

  function parseIdx(v) {
    const [bi, si] = v.split(":").map(Number);
    return { bi, si };
  }

  if (stepUp) {
    const { bi, si } = parseIdx(stepUp.dataset.stepUp);
    if (si > 0) {
      const arr = blocks[bi].steps;
      [arr[si - 1], arr[si]] = [arr[si], arr[si - 1]];
    }
    return renderBlocks();
  }
  if (stepDown) {
    const { bi, si } = parseIdx(stepDown.dataset.stepDown);
    const arr = blocks[bi].steps;
    if (si < arr.length - 1) [arr[si + 1], arr[si]] = [arr[si], arr[si + 1]];
    return renderBlocks();
  }
  if (stepDel) {
    const { bi, si } = parseIdx(stepDel.dataset.stepDel);
    blocks[bi].steps.splice(si, 1);
    return renderBlocks();
  }
  if (stepEdit) {
    const { bi, si } = parseIdx(stepEdit.dataset.stepEdit);
    const current = blocks[bi].steps[si];
    const newText = prompt("Editar passo:", current);
    if (newText === null) return;
    blocks[bi].steps[si] = newText.trim();
    return renderBlocks();
  }
});

// ===== Submit (salvar) =====
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleEl.value.trim();
  const time = timeEl.value.trim();
  const y = yieldEl.value.trim();

  if (title.length < 3) return setStatus("Nome inválido.", false);
  if (!time) return setStatus("Informe o tempo.", false);
  if (!y) return setStatus("Informe o rendimento.", false);
  if (!imageDataUrl) return setStatus("Selecione uma foto.", false);

  if (ingredients.length < 2) return setStatus("Adicione pelo menos 2 ingredientes.", false);
  if (blocks.length < 1) return setStatus("Crie pelo menos 1 bloco de preparo.", false);
  if (blocks.some(b => (b.steps || []).length < 2)) return setStatus("Cada bloco precisa de pelo menos 2 passos.", false);

  // converter ingredients (objetos) para strings compatíveis com o modal atual
  const ingredientsAsText = ingredients.map(it => {
    const base = `${it.qty} — ${it.name}`;
    return it.note ? `${base} (${it.note})` : base;
  });

  const stepsBlocks = blocks.map(b => ({
    title: b.title,
    steps: b.steps,
    ...(b.note ? { note: b.note } : {})
  }));

  const newRecipe = {
    id: makeId(),
    title,
    origin: originEl.value,
    category: categoryEl.value,
    image: imageDataUrl,
    time,
    yield: y,
    difficulty: difficultyEl.value,
    ingredients: ingredientsAsText,
    stepsBlocks,
    tips: tipsEl.value.split("\n").map(t => t.trim()).filter(Boolean)
  };

  const list = loadRecipes();
  list.unshift(newRecipe);
  saveRecipes(list);

  setStatus("Receita salva! Indo para o início… ✅");
  setTimeout(() => (window.location.href = "./index.html"), 700);
});

// inicial
renderIngredients();
renderBlocks();
