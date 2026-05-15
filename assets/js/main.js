/* ============================================
   TCT — MAIN
   Nav, menu drawer, page init
   ============================================ */

/* ============================================
   MENU DRAWER
   ============================================ */

function initMenuDrawer() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('menu-drawer');
  const overlay   = document.getElementById('menu-overlay');
  const closeBtn  = document.getElementById('menu-close');

  if (!hamburger || !drawer) return;

  function openMenu() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeMenu() : openMenu();
  });

  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Category nav items in drawer
  document.querySelectorAll('.menu-nav-item[data-category]').forEach(item => {
    item.addEventListener('click', () => {
      const cat = item.dataset.category;
      closeMenu();
      // Navigate to category page
      window.location.href = `category.html?cat=${encodeURIComponent(cat)}`;
    });
  });
}

/* ============================================
   NAV SCROLL BEHAVIOR
   ============================================ */

function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    if (current > 80) {
      nav.style.borderBottomColor = 'var(--border)';
    } else {
      nav.style.borderBottomColor = 'var(--border)';
    }

    lastScroll = current;
  }, { passive: true });
}

/* ============================================
   LIVE DATE IN NAV
   ============================================ */

function setNavDate() {
  const el = document.getElementById('nav-date');
  if (!el) return;

  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = now.toLocaleDateString('en-GB', options);
}

/* ============================================
   TICKER BAR
   ============================================ */

function setTickerText(articles) {
  const el = document.getElementById('ticker-text');
  if (!el || !articles.length) return;

  const headlines = articles.map(a => a.title).join('   ·   ');
  el.textContent = headlines;
}

/* ============================================
   PAGE FADE IN
   ============================================ */

function initPageAnimation() {
  document.body.classList.add('page-fade-in');
}

/* ============================================
   HOME PAGE INIT
   ============================================ */

async function initHomePage() {
  initPageAnimation();
  initMenuDrawer();
  initNavScroll();
  setNavDate();
  initModal();

  // Show skeletons while loading
  window.TCT.showSkeletons('articles-grid', 6);

  const articles = await window.TCT.loadArticles();

  if (!articles.length) {
    document.getElementById('articles-grid').innerHTML =
      '<p style="color:var(--text-muted);padding:var(--space-md)">Could not load articles.</p>';
    return;
  }

  // Render sections
  window.TCT.renderHero(articles);
  window.TCT.renderArticleGrid(articles, 'articles-grid');
  window.TCT.initFilterBar('filter-bar', 'articles-grid');
  setTickerText(articles);
}

/* ============================================
   CATEGORY PAGE INIT
   ============================================ */

async function initCategoryPage() {
  initPageAnimation();
  initMenuDrawer();
  initNavScroll();
  setNavDate();
  initModal();

  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat') || 'All';

  // Set page title
  const nameEl = document.getElementById('category-name');
  const descEl = document.getElementById('category-desc');

  const catDescriptions = {
    'All':        'Everything published on The Capital Table.',
    'AI':         'Artificial intelligence, machine learning, and the tools reshaping Africa.',
    'Startups':   'Founders, funding, and the companies building Africa\'s future.',
    'Business':   'Markets, strategy, and the forces driving African economies.',
    'Finance':    'Capital, investment, and the money behind African ambition.',
    'Technology': 'The tools, platforms, and infrastructure powering the continent.',
    'Founders':   'The people behind the products. Origin stories and hard lessons.',
    'Editorial':  'Perspectives and positions from The Capital Table.',
    'Innovation': 'New ideas, new models, and the experiments worth watching.',
  };

  if (nameEl) nameEl.textContent = cat;
  if (descEl) descEl.textContent = catDescriptions[cat] || `Articles about ${cat}.`;

  // Update page title
  document.title = `${cat} — The Capital Table`;

  window.TCT.showSkeletons('category-articles', 6);

  const articles = await window.TCT.loadArticles();
  const filtered = window.TCT.filterArticles(cat);

  window.TCT.renderArticleList(filtered, 'category-articles');
  setTickerText(articles);
}

/* ============================================
   AUTO-INIT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home')     initHomePage();
  if (page === 'category') initCategoryPage();
});
