// script.js (versão melhorada: ingredientes + preparo com checklist e progresso)
const STORAGE_KEY = "mlr_recipes_v2";
const IMG_CACHE_KEY = "mlr_img_cache_v1";
const PROGRESS_KEY = "mlr_progress_v1";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='900' height='650'>
    <defs>
      <linearGradient id='g' x1='0' x2='1'>
        <stop offset='0' stop-color='#f6f0e3'/>
        <stop offset='1' stop-color='#e7eed7'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <rect x='36' y='36' width='828' height='578' rx='26' fill='rgba(255,255,255,0.7)' stroke='rgba(31,41,55,0.18)'/>
    <text x='50%' y='47%' text-anchor='middle' font-family='Arial' font-size='34' fill='rgba(31,41,55,0.75)'>Meu Livro de Receitas</text>
    <text x='50%' y='55%' text-anchor='middle' font-family='Arial' font-size='18' fill='rgba(31,41,55,0.55)'>Carregando imagem…</text>
  </svg>
  `);

/* =========================
   BASE
   ========================= */
function loadUserRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function originLabel(o) {
  return o === "mz" ? "🇲🇿 Moçambique" : "🌍 Internacional";
}
function categoryLabel(c) {
  return c === "doce" ? "Doce" : "Salgado";
}

/* =========================
   PROGRESSO (checklist)
   ========================= */
function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}
function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
function getRecipeProgress(id) {
  const all = loadProgress();
  return all[String(id)] || { ing: {}, steps: {} };
}
function setRecipeProgress(id, next) {
  const all = loadProgress();
  all[String(id)] = next;
  saveProgress(all);
}
function stepKey(recipeId, blockIndex, stepIndex) {
  return `${recipeId}:${blockIndex}:${stepIndex}`;
}

/* =========================
   INGREDIENTES (parser + grupos)
   ========================= */
function parseIngredientLine(line) {
  const raw = String(line || "").trim();

  // 1) Formato "Grupo: item"
  // Ex.: "Massa: 2 xícaras de farinha"
  const colonIdx = raw.indexOf(":");
  if (colonIdx > 0 && colonIdx <= 16) {
    const group = raw.slice(0, colonIdx).trim();
    const rest = raw.slice(colonIdx + 1).trim();
    return { group, qty: "", item: rest, note: "" };
  }

  // 2) Formato "quantidade — ingrediente (nota)"
  // Ex.: "2 xícaras (chá) — Farinha (peneirada)"
  const parts = raw.split("—").map((s) => s.trim());
  if (parts.length >= 2) {
    const qty = parts[0];
    const tail = parts.slice(1).join(" — ");
    const m = tail.match(/^(.*?)(\s*\((.+)\))$/);
    if (m) return { group: "Ingredientes", qty, item: m[1].trim(), note: m[3].trim() };
    return { group: "Ingredientes", qty, item: tail, note: "" };
  }

  // 3) fallback simples
  return { group: "Ingredientes", qty: "", item: raw, note: "" };
}

function groupIngredients(ingredients) {
  const groups = new Map();
  (ingredients || []).forEach((line) => {
    const x = parseIngredientLine(line);
    const g = x.group || "Ingredientes";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(x);
  });
  return [...groups.entries()].map(([title, items]) => ({ title, items }));
}

/* =========================
   IMAGENS (Wikipédia + cache)
   Se você já tem imagens próprias, pode deixar.
   ========================= */
function loadImgCache() {
  try {
    const raw = localStorage.getItem(IMG_CACHE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}
function saveImgCache(cache) {
  localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache));
}
let IMG_CACHE = loadImgCache();

function cacheKey(title) {
  return normalize(title);
}
function cacheGet(title) {
  return IMG_CACHE[cacheKey(title)] || "";
}
function cacheSet(title, url) {
  IMG_CACHE[cacheKey(title)] = url;
  saveImgCache(IMG_CACHE);
}

function cleanTitleForSearch(title) {
  return String(title || "")
    .replace(/#\d+/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function wikiSearchTitle(lang, query) {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
    query
  )}&limit=1&namespace=0&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) return "";
  const data = await res.json();
  const titles = data?.[1];
  return Array.isArray(titles) && titles[0] ? titles[0] : "";
}

async function wikiSummaryThumb(lang, title) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) return "";
  const data = await res.json();
  const thumb = data?.thumbnail?.source || "";
  return typeof thumb === "string" ? thumb : "";
}

async function fetchWikiThumb(query) {
  const q = cleanTitleForSearch(query);
  if (!q) return "";

  const ptTitle = await wikiSearchTitle("pt", q);
  const ptThumb = ptTitle ? await wikiSummaryThumb("pt", ptTitle) : "";
  if (ptThumb) return ptThumb;

  const enTitle = await wikiSearchTitle("en", q);
  const enThumb = enTitle ? await wikiSummaryThumb("en", enTitle) : "";
  return enThumb || "";
}

let IMG_QUEUE = [];
let IMG_ACTIVE = 0;
const IMG_CONCURRENCY = 4;

function enqueueImageLoad(imgEl, recipe) {
  IMG_QUEUE.push({ imgEl, recipe });
  pumpQueue();
}

async function pumpQueue() {
  while (IMG_ACTIVE < IMG_CONCURRENCY && IMG_QUEUE.length) {
    const job = IMG_QUEUE.shift();
    IMG_ACTIVE++;
    runJob(job)
      .catch(() => {})
      .finally(() => {
        IMG_ACTIVE--;
        pumpQueue();
      });
  }
}

async function runJob({ imgEl, recipe }) {
  if (!imgEl || !recipe) return;
  if (imgEl.dataset.loaded === "1") return;

  // 1) se a receita tem imagem própria (upload/local)
  if (recipe.image && String(recipe.image).trim()) {
    imgEl.src = recipe.image;
    imgEl.dataset.loaded = "1";
    return;
  }

  // 2) cache
  const cached = cacheGet(recipe.title);
  if (cached) {
    imgEl.src = cached;
    imgEl.dataset.loaded = "1";
    return;
  }

  // 3) wikipedia fallback
  try {
    const thumb = await fetchWikiThumb(recipe.title);
    if (thumb) {
      cacheSet(recipe.title, thumb);
      imgEl.src = thumb;
    } else {
      imgEl.src = PLACEHOLDER;
    }
  } catch {
    imgEl.src = PLACEHOLDER;
  } finally {
    imgEl.dataset.loaded = "1";
  }
}

/* =========================
   APP
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("cardsGrid");
  const emptyState = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const summaryText = document.getElementById("summaryText");
  const clearStorageBtn = document.getElementById("clearStorageBtn");

  const modal = document.getElementById("recipeModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalOrigin = document.getElementById("modalOrigin");
  const modalTime = document.getElementById("modalTime");
  const modalYield = document.getElementById("modalYield");
  const modalDifficulty = document.getElementById("modalDifficulty");
  const modalImage = document.getElementById("modalImage");
  const modalIngredients = document.getElementById("modalIngredients");
  const modalSteps = document.getElementById("modalSteps");
  const tipsSection = document.getElementById("tipsSection");
  const modalTips = document.getElementById("modalTips");
  const printBtn = document.getElementById("printBtn");

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const defaults = Array.isArray(window.DEFAULT_RECIPES) ? window.DEFAULT_RECIPES : [];
  const userRecipes = loadUserRecipes();
  const RECIPES = [...userRecipes, ...defaults];

  const state = { query: "", filter: "all", origin: "all" };

  function applyFilters(list) {
    const q = normalize(state.query.trim());
    return list.filter((r) => {
      const matchesQuery = !q || normalize(r.title).includes(q);
      const matchesCategory = state.filter === "all" || r.category === state.filter;
      const matchesOrigin = state.origin === "all" || r.origin === state.origin;
      return matchesQuery && matchesCategory && matchesOrigin;
    });
  }

  function setActiveGroup(selector, key, value) {
    document.querySelectorAll(selector).forEach((btn) => {
      if (btn.dataset[key] === value) btn.classList.add("is-active");
      else btn.classList.remove("is-active");
    });
  }

  function render() {
    const filtered = applyFilters(RECIPES);
    summaryText.textContent = `${filtered.length} receita(s) encontradas • Total: ${RECIPES.length}`;

    grid.innerHTML = filtered
      .map(
        (recipe) => `
      <article class="card" aria-label="Receita: ${escapeHtml(recipe.title)}">
        <img class="card__img"
          src="${PLACEHOLDER}"
          alt="Foto de ${escapeHtml(recipe.title)}"
          loading="lazy"
          data-recipe-id="${recipe.id}"
        >
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(recipe.title)}</h3>
          <p class="card__subtitle">
            <span>⏱️ ${escapeHtml(recipe.time || "-")}</span>
            <span>🍽️ ${escapeHtml(recipe.yield || "-")}</span>
            <span>⭐ ${escapeHtml(recipe.difficulty || "-")}</span>
          </p>
          <div class="card__row">
            <span class="badge">${categoryLabel(recipe.category)}</span>
            <button class="btn" type="button" data-open="${recipe.id}">Ver Receita</button>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    emptyState.hidden = filtered.length !== 0;

    // imagens (fila)
    const imgs = grid.querySelectorAll("img.card__img");
    imgs.forEach((img) => {
      const id = Number(img.dataset.recipeId);
      const recipe = filtered.find((r) => Number(r.id) === id);
      if (recipe) enqueueImageLoad(img, recipe);
    });
  }

  /* =========================
     MODAL (INGREDIENTES + PREPARO melhorados)
     ========================= */
  function openModal(recipe) {
    modalTitle.textContent = recipe.title;
    modalCategory.textContent = categoryLabel(recipe.category);
    modalOrigin.textContent = originLabel(recipe.origin);
    modalTime.textContent = `⏱️ ${recipe.time || "-"}`;
    modalYield.textContent = `🍽️ ${recipe.yield || "-"}`;
    modalDifficulty.textContent = `⭐ ${recipe.difficulty || "-"}`;

    const prog = getRecipeProgress(recipe.id);

    // ===== Ingredientes =====
    const grouped = groupIngredients(recipe.ingredients || []);
    let totalIng = 0;
    let doneIng = 0;

    modalIngredients.innerHTML = grouped
      .map((g, gi) => {
        const itemsHtml = g.items
          .map((it, idx) => {
            totalIng++;
            const key = `ing:${gi}:${idx}`;
            const checked = !!prog.ing[key];
            if (checked) doneIng++;

            const qty = it.qty ? `<span class="ingQty">${escapeHtml(it.qty)}</span>` : "";
            const note = it.note ? `<span class="ingNote">• ${escapeHtml(it.note)}</span>` : "";

            return `
              <li class="ingItem">
                <label class="chk">
                  <input type="checkbox" data-ingcheck="${key}" ${checked ? "checked" : ""}/>
                  <span class="chkBox"></span>
                  <span class="ingText">
                    ${qty}<span class="ingName">${escapeHtml(it.item)}</span> ${note}
                  </span>
                </label>
              </li>
            `;
          })
          .join("");

        return `
          <li class="ingGroup">
            <div class="ingGroup__title">${escapeHtml(g.title)}</div>
            <ul class="ingGroup__list">${itemsHtml}</ul>
          </li>
        `;
      })
      .join("");

    // ===== Preparo =====
    const blocks = recipe.stepsBlocks || [];
    let totalSteps = 0;
    let doneSteps = 0;

    const blocksHtml = blocks
      .map((block, bi) => {
        const steps = block.steps || [];
        const stepsHtml = steps
          .map((s, si) => {
            totalSteps++;
            const k = stepKey(recipe.id, bi, si);
            const checked = !!prog.steps[k];
            if (checked) doneSteps++;

            return `
              <li class="prepStep">
                <label class="chk">
                  <input type="checkbox" data-stepcheck="${k}" ${checked ? "checked" : ""}/>
                  <span class="chkBox"></span>
                  <span class="prepStep__text">${escapeHtml(s)}</span>
                </label>
              </li>
            `;
          })
          .join("");

        const note = block.note ? `<div class="prepNote">💡 ${escapeHtml(block.note)}</div>` : "";

        return `
          <section class="prepBlock">
            <header class="prepBlock__head">
              <h4 class="prepBlock__title">${escapeHtml(block.title || "Passos")}</h4>
            </header>
            ${note}
            <ol class="prepBlock__list">${stepsHtml}</ol>
          </section>
        `;
      })
      .join("");

    modalSteps.innerHTML = `
      <div class="prepTop">
        <div class="prepProgress">
          <span class="prepProgress__label">Progresso</span>
          <span class="prepProgress__value" id="prepProgressText">${doneSteps}/${totalSteps}</span>
          <button class="btn btn--ghost btn--tiny" type="button" id="resetProgressBtn">Limpar progresso</button>
        </div>
      </div>
      ${blocksHtml}
    `;

    // ===== Dicas =====
    const tips = Array.isArray(recipe.tips) ? recipe.tips : [];
    tipsSection.hidden = tips.length === 0;
    modalTips.innerHTML = tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("");

    // ===== Imagem do modal =====
    modalImage.src = PLACEHOLDER;
    modalImage.dataset.loaded = "0";
    enqueueImageLoad(modalImage, recipe);

    // eventos dos checkboxes (ingredientes)
    modalIngredients.querySelectorAll("input[data-ingcheck]").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const key = e.target.dataset.ingcheck;
        const p = getRecipeProgress(recipe.id);
        p.ing[key] = e.target.checked;
        setRecipeProgress(recipe.id, p);
      });
    });

    // eventos dos checkboxes (passos)
    modalSteps.querySelectorAll("input[data-stepcheck]").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const key = e.target.dataset.stepcheck;
        const p = getRecipeProgress(recipe.id);
        p.steps[key] = e.target.checked;
        setRecipeProgress(recipe.id, p);

        const checks = modalSteps.querySelectorAll("input[data-stepcheck]");
        const done = [...checks].filter((x) => x.checked).length;
        const total = checks.length;
        const label = document.getElementById("prepProgressText");
        if (label) label.textContent = `${done}/${total}`;
      });
    });

    const resetBtn = document.getElementById("resetProgressBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        setRecipeProgress(recipe.id, { ing: {}, steps: {} });
        openModal(recipe); // re-render
      });
    }

    // abrir modal
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* =========================
     EVENTOS
     ========================= */
  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    render();
  });

  document.getElementById("categoryChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    state.filter = btn.dataset.filter;
    setActiveGroup("#categoryChips .chip", "filter", state.filter);
    render();
  });

  document.getElementById("originChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-origin]");
    if (!btn) return;
    state.origin = btn.dataset.origin;
    setActiveGroup("#originChips .chip", "origin", state.origin);
    render();
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (!btn) return;
    const id = Number(btn.dataset.open);
    const recipe = RECIPES.find((r) => Number(r.id) === id);
    if (recipe) openModal(recipe);
  });

  modal.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  printBtn.addEventListener("click", () => window.print());

  clearStorageBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  // menu mobile
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  render();
});
