/* ============================================
   TCT — ARTICLES ENGINE
   Loads, renders, and filters articles
   ============================================ */

let allArticles = [];

/* ============================================
   FETCH ARTICLES
   ============================================ */

async function loadArticles() {
  try {
    const res = await fetch('data/articles.json');
    if (!res.ok) throw new Error('Failed to load articles');
    allArticles = await res.json();
    return allArticles;
  } catch (err) {
    console.error('TCT: Could not load articles.json', err);
    return [];
  }
}

/* ============================================
   RENDER HERO SECTION
   ============================================ */

function renderHero(articles) {
  const featuredArticles = articles.filter(a => a.featured);
  if (!featuredArticles.length) return;

  const main = featuredArticles[0];
  const sideItems = featuredArticles.slice(1, 4);

  const heroSection = document.getElementById('hero-section');
  if (!heroSection) return;

  heroSection.innerHTML = `
    <div class="hero-inner">
      <div class="hero-label">Featured</div>
      <div class="hero-grid">

        <div class="hero-main" onclick="openModal('${main.id}')">
          <div class="article-category">${main.category}</div>
          <h1 class="hero-title">${main.title}</h1>
          <p class="hero-subtitle">${main.subtitle}</p>
          <div class="hero-meta">
            <span>${main.author}</span>
            <span class="hero-meta-dot"></span>
            <span>${main.date}</span>
            <span class="hero-meta-dot"></span>
            <span>${main.readTime}</span>
          </div>
        </div>

        <div class="hero-side">
          ${sideItems.map(a => `
            <div class="hero-side-item" onclick="openModal('${a.id}')">
              <div class="article-category">${a.category}</div>
              <div class="hero-side-title">${a.title}</div>
              <div class="hero-side-meta">
                <span>${a.date}</span>
                <span>·</span>
                <span>${a.readTime}</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
}

/* ============================================
   RENDER ARTICLE GRID
   ============================================ */

function renderArticleGrid(articles, containerId, limit = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = articles.slice(0, limit);

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">◎</div>
        <p class="empty-state-text">No articles in this category yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="cards-grid">
      ${items.map((a, i) => `
        <div class="article-card ${i === 0 ? 'featured' : ''}" onclick="openModal('${a.id}')">
          <div class="card-number">${String(i + 1).padStart(2, '0')}</div>
          <div class="article-category">${a.category}</div>
          <h2 class="article-title">${a.title}</h2>
          <p class="article-excerpt">${a.subtitle}</p>
          <div class="article-meta">
            <span>${a.author}</span>
            <span class="article-meta-sep">·</span>
            <span>${a.date}</span>
            <span class="article-meta-sep">·</span>
            <span>${a.readTime}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================
   RENDER ARTICLE LIST (category page)
   ============================================ */

function renderArticleList(articles, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!articles.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">◎</div>
        <p class="empty-state-text">No articles in this category yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="article-list">
      ${articles.map(a => `
        <div class="article-list-item" onclick="openModal('${a.id}')">
          <div>
            <div class="article-list-category">${a.category}</div>
            <div class="article-list-title">${a.title}</div>
            <p class="article-list-excerpt">${a.subtitle}</p>
          </div>
          <div class="article-list-meta">
            <div>${a.date}</div>
            <div>${a.readTime}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================
   FILTER ARTICLES
   ============================================ */

function filterArticles(category) {
  if (category === 'All') return allArticles;
  return allArticles.filter(a =>
    a.category.toLowerCase() === category.toLowerCase()
  );
}

/* ============================================
   FILTER BAR
   ============================================ */

function initFilterBar(containerId, gridId) {
  const bar = document.getElementById(containerId);
  if (!bar) return;

  const categories = ['All', ...new Set(allArticles.map(a => a.category))];

  bar.innerHTML = categories.map(cat => `
    <button
      class="filter-btn ${cat === 'All' ? 'active' : ''}"
      data-category="${cat}"
    >${cat}</button>
  `).join('');

  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = filterArticles(btn.dataset.category);
      renderArticleGrid(filtered, gridId);
    });
  });
}

/* ============================================
   SKELETON LOADING
   ============================================ */

function showSkeletons(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="cards-grid">
      ${Array(count).fill(0).map(() => `
        <div class="skeleton-card">
          <div class="skeleton skeleton-line" style="width:30%;height:10px;"></div>
          <div class="skeleton skeleton-line" style="width:90%;height:20px;margin-top:8px;"></div>
          <div class="skeleton skeleton-line" style="width:85%;height:14px;margin-top:4px;"></div>
          <div class="skeleton skeleton-line" style="width:60%;height:14px;margin-top:4px;"></div>
          <div class="skeleton skeleton-line" style="width:50%;height:10px;margin-top:16px;"></div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================
   EXPORT
   ============================================ */

window.TCT = window.TCT || {};
window.TCT.loadArticles = loadArticles;
window.TCT.renderHero = renderHero;
window.TCT.renderArticleGrid = renderArticleGrid;
window.TCT.renderArticleList = renderArticleList;
window.TCT.filterArticles = filterArticles;
window.TCT.initFilterBar = initFilterBar;
window.TCT.showSkeletons = showSkeletons;
window.TCT.getAll = () => allArticles;
