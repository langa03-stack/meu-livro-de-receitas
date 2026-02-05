// script.js
const STORAGE_KEY = "mlr_recipes_v2";
const IMG_CACHE_KEY = "mlr_img_cache_v1";

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
   IMAGENS “CERTAS” (Wikipédia)
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
    .replace(/#\d+/g, "")         // remove "#23"
    .replace(/\(.*?\)/g, "")     // remove (xxx)
    .replace(/\s+/g, " ")
    .trim();
}

async function wikiSearchTitle(lang, query) {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json&origin=*`;
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

  // PT primeiro
  const ptTitle = await wikiSearchTitle("pt", q);
  const ptThumb = ptTitle ? await wikiSummaryThumb("pt", ptTitle) : "";
  if (ptThumb) return ptThumb;

  // EN como fallback
  const enTitle = await wikiSearchTitle("en", q);
  const enThumb = enTitle ? await wikiSummaryThumb("en", enTitle) : "";
  return enThumb || "";
}

// fila simples (limita fetch para não travar)
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
    runJob(job).finally(() => {
      IMG_ACTIVE--;
      pumpQueue();
    });
  }
}

async function runJob({ imgEl, recipe }) {
  if (!imgEl || !recipe) return;
  if (imgEl.dataset.loaded === "1") return;

  // se recipe.image já veio preenchida (ex.: receita adicionada com upload)
  if (recipe.image && recipe.image.trim()) {
    imgEl.src = recipe.image;
    imgEl.dataset.loaded = "1";
    return;
  }

  // cache
  const cached = cacheGet(recipe.title);
  if (cached) {
    imgEl.src = cached;
    imgEl.dataset.loaded = "1";
    return;
  }

  // buscar wiki
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
    return list.filter(r => {
      const matchesQuery = !q || normalize(r.title).includes(q);
      const matchesCategory = state.filter === "all" || r.category === state.filter;
      const matchesOrigin = state.origin === "all" || r.origin === state.origin;
      return matchesQuery && matchesCategory && matchesOrigin;
    });
  }

  function setActiveGroup(selector, key, value) {
    document.querySelectorAll(selector).forEach(btn => {
      if (btn.dataset[key] === value) btn.classList.add("is-active");
      else btn.classList.remove("is-active");
    });
  }

  function render() {
    const filtered = applyFilters(RECIPES);
    summaryText.textContent = `${filtered.length} receita(s) encontradas • Total: ${RECIPES.length}`;

    grid.innerHTML = filtered.map(recipe => `
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
    `).join("");

    emptyState.hidden = filtered.length !== 0;

    // carregar imagens corretas (wiki) em fila
    const imgs = grid.querySelectorAll("img.card__img");
    imgs.forEach(img => {
      const id = Number(img.dataset.recipeId);
      const recipe = filtered.find(r => Number(r.id) === id);
      if (recipe) enqueueImageLoad(img, recipe);
    });
  }

  function openModal(recipe) {
    modalTitle.textContent = recipe.title;
    modalCategory.textContent = categoryLabel(recipe.category);
    modalOrigin.textContent = originLabel(recipe.origin);
    modalTime.textContent = `⏱️ ${recipe.time}`;
    modalYield.textContent = `🍽️ ${recipe.yield}`;
    modalDifficulty.textContent = `⭐ ${recipe.difficulty}`;

    modalIngredients.innerHTML = (recipe.ingredients || [])
      .map(i => `<li>${escapeHtml(i)}</li>`).join("");

    modalSteps.innerHTML = (recipe.stepsBlocks || []).map(block => `
      <section class="stepBlock">
        <h4 class="stepBlock__title">${escapeHtml(block.title || "Passos")}</h4>
        <ol class="stepBlock__ol">
          ${(block.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}
        </ol>
        ${block.note ? `<p class="note">💡 ${escapeHtml(block.note)}</p>` : ""}
      </section>
    `).join("");

    const tips = Array.isArray(recipe.tips) ? recipe.tips : [];
    tipsSection.hidden = tips.length === 0;
    modalTips.innerHTML = tips.map(t => `<li>${escapeHtml(t)}</li>`).join("");

    // imagem do modal (wiki)
    modalImage.src = PLACEHOLDER;
    modalImage.dataset.loaded = "0";
    enqueueImageLoad(modalImage, recipe);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // eventos
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
    const recipe = RECIPES.find(r => Number(r.id) === id);
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
