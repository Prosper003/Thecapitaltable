/* ============================================
   TCT — MODAL ENGINE
   The floating article reading platform
   ============================================ */

/* ============================================
   STATE
   ============================================ */

let currentArticleId = null;

/* ============================================
   OPEN MODAL
   ============================================ */

function openModal(articleId) {
  const articles = window.TCT.getAll();
  const article = articles.find(a => a.id === articleId);
  if (!article) return;

  currentArticleId = articleId;
  populateModal(article);

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Reset scroll
  const body = document.getElementById('modal-body');
  if (body) {
    body.scrollTop = 0;
    updateProgress(body);
  }
}

/* ============================================
   CLOSE MODAL
   ============================================ */

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  currentArticleId = null;
}

/* ============================================
   POPULATE MODAL CONTENT
   ============================================ */

function populateModal(article) {
  // Category + close bar
  document.getElementById('modal-category').textContent = article.category;

  // Read progress bar
  document.getElementById('modal-read-progress').style.width = '0%';

  // Build article HTML
  const liked = getLikeState(article.id);

  const sectionsHTML = article.sections.map(s => `
    <div class="modal-section">
      <div class="modal-section-heading">${s.heading}</div>
      <div class="modal-section-body">${s.body}</div>
    </div>
  `).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-article">
      <div class="modal-article-category">${article.category}</div>
      <h2 class="modal-article-title">${article.title}</h2>
      <p class="modal-article-subtitle">${article.subtitle}</p>
      <div class="modal-article-meta">
        <span>${article.author}</span>
        <span class="modal-article-meta-sep"></span>
        <span>${article.date}</span>
        <span class="modal-article-meta-sep"></span>
        <span>${article.readTime}</span>
      </div>

      <div class="modal-article-hook">${article.hook}</div>

      ${sectionsHTML}

      ${article.africanAngle ? `
        <div class="modal-special-block">
          <div class="modal-special-label">The African Angle</div>
          <div class="modal-special-text">${article.africanAngle}</div>
        </div>
      ` : ''}

      ${article.futureOutlook ? `
        <div class="modal-special-block">
          <div class="modal-special-label">Future Outlook</div>
          <div class="modal-special-text">${article.futureOutlook}</div>
        </div>
      ` : ''}

      ${article.conclusion ? `
        <div class="modal-conclusion">${article.conclusion}</div>
      ` : ''}

    </div>
  `;

  // Set like button state
  const likeBtn = document.getElementById('modal-like-btn');
  if (liked) {
    likeBtn.classList.add('liked');
    likeBtn.querySelector('.like-text').textContent = 'Liked';
  } else {
    likeBtn.classList.remove('liked');
    likeBtn.querySelector('.like-text').textContent = 'Like';
  }
}

/* ============================================
   LIKE SYSTEM (localStorage)
   ============================================ */

function getLikeState(articleId) {
  try {
    const likes = JSON.parse(localStorage.getItem('tct_likes') || '{}');
    return !!likes[articleId];
  } catch { return false; }
}

function toggleLike(articleId) {
  try {
    const likes = JSON.parse(localStorage.getItem('tct_likes') || '{}');
    likes[articleId] = !likes[articleId];
    localStorage.setItem('tct_likes', JSON.stringify(likes));

    const likeBtn = document.getElementById('modal-like-btn');
    if (likes[articleId]) {
      likeBtn.classList.add('liked');
      likeBtn.querySelector('.like-text').textContent = 'Liked';
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.querySelector('.like-text').textContent = 'Like';
    }
  } catch (e) {
    console.warn('TCT: Could not save like state', e);
  }
}

/* ============================================
   SHARE SYSTEM (Web Share API)
   ============================================ */

function shareArticle(articleId) {
  const articles = window.TCT.getAll();
  const article = articles.find(a => a.id === articleId);
  if (!article) return;

  const shareData = {
    title: article.title,
    text: article.subtitle,
    url: `https://thecapitaltable.blog`
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    // Fallback: copy to clipboard
    const text = `${article.title}\n${shareData.url}`;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('modal-share-btn');
      const original = btn.innerHTML;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        <span>Copied!</span>
      `;
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    }).catch(() => {});
  }
}

/* ============================================
   READ PROGRESS BAR
   ============================================ */

function updateProgress(bodyEl) {
  const scrollable = bodyEl.scrollHeight - bodyEl.clientHeight;
  const pct = scrollable > 0 ? (bodyEl.scrollTop / scrollable) * 100 : 0;
  const bar = document.getElementById('modal-read-progress');
  if (bar) bar.style.width = `${Math.min(100, pct)}%`;

  // Update progress text
  const prog = document.getElementById('modal-progress-text');
  if (prog) prog.textContent = `${Math.round(pct)}%`;
}

/* ============================================
   INIT
   ============================================ */

function initModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  // Close on overlay click (outside platform)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close button
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);

  // Like button
  document.getElementById('modal-like-btn')?.addEventListener('click', () => {
    if (currentArticleId) toggleLike(currentArticleId);
  });

  // Share button
  document.getElementById('modal-share-btn')?.addEventListener('click', () => {
    if (currentArticleId) shareArticle(currentArticleId);
  });

  // Scroll progress
  document.getElementById('modal-body')?.addEventListener('scroll', function() {
    updateProgress(this);
  });

  // Keyboard: ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentArticleId) closeModal();
  });
}

/* ============================================
   EXPORT
   ============================================ */

window.openModal = openModal;
window.closeModal = closeModal;
window.initModal = initModal;
                                      
