/* ─── Are.na moodboards ──────────────────────────────────── */
const ARENA_CHANNELS = [
  { slug: 'move-fbvlnbq1piq',   href: 'https://www.are.na/kr-dv/move-fbvlnbq1piq' },
  { slug: 'fnth',               href: 'https://www.are.na/kr-dv/fnth' },
  { slug: 'bits-zlyzwoq6bvo',   href: 'https://www.are.na/kr-dv/bits-zlyzwoq6bvo' },
];

async function loadArena() {
  const container = document.getElementById('arenaChannels');
  if (!container) return;

  container.innerHTML = '';

  for (const { slug, href } of ARENA_CHANNELS) {
    try {
      const res = await fetch(`https://api.are.na/v2/channels/${slug}?per=12`);
      if (!res.ok) continue;
      const ch = await res.json();

      const year = new Date(ch.created_at).getFullYear();
      const images = (ch.contents || [])
        .filter(b => b.class === 'Image' && b.image?.large?.url)
        .slice(0, 10);

      const thumbsHTML = images.length
        ? images.map(b => `<img class="arena-thumb" src="${b.image.large.url}" alt="" loading="lazy">`).join('')
        : Array(4).fill('<div class="arena-thumb-placeholder"></div>').join('');

      const el = document.createElement('div');
      el.className = 'arena-channel';
      el.innerHTML = `
        <div class="arena-channel-meta">
          <span class="arena-channel-period">${year}</span>
          <a class="arena-channel-title" href="${href}" target="_blank" rel="noopener">
            ${ch.title} ↗ <span class="arena-channel-count">${ch.length} blocks</span>
          </a>
        </div>
        <div class="arena-scroll">${thumbsHTML}</div>
      `;
      container.appendChild(el);
    } catch (_) {}
  }

  if (!container.children.length) {
    container.innerHTML = '<div class="feed-loading">Could not load channels.</div>';
  }
}

loadArena();

/* ─── Theme toggle ───────────────────────────────────────── */
const root = document.documentElement;
const btn  = document.getElementById('themeToggle');
const STORAGE_KEY = 'ak-theme';

// Default is always dark unless the user has explicitly toggled
const savedTheme = localStorage.getItem(STORAGE_KEY) || 'dark';

root.setAttribute('data-theme', savedTheme);

btn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEY, next);
});

/* ─── Type labels ────────────────────────────────────────── */
const TYPE_LABELS = {
  article:    'Article',
  talk:       'Talk',
  case:       'Case Study',
  ai:         'AI experiment',
  mentorship: 'Mentorship',
  career:     'Career',
  award:      'Award',
};

/* ─── Date formatter ─────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/* ─── Render feed ────────────────────────────────────────── */
function renderFeed(items) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  items.forEach((item, i) => {
    const hasLink = item.link && item.link.trim() !== '';
    const el = document.createElement(hasLink ? 'a' : 'div');
    el.className = `feed-item type-${item.type}${hasLink ? ' is-link' : ''}`;
    el.style.animationDelay = `${0.05 * i}s`;

    if (hasLink) {
      el.href = item.link;
      el.target = '_blank';
      el.rel = 'noopener';
    }

    const label = TYPE_LABELS[item.type] || item.type;

    el.innerHTML = `
      <div class="feed-date">${formatDate(item.date)}</div>
      <div class="feed-body">
        <div class="feed-type-badge">
          <span class="feed-type-dot"></span>
          ${label}
        </div>
        <div class="feed-title">
          ${item.title}
          ${hasLink ? '<span class="feed-title-arrow">↗</span>' : ''}
        </div>
        ${item.description ? `<div class="feed-desc">${item.description}</div>` : ''}
      </div>
    `;

    feed.appendChild(el);
  });
}

/* ─── Load activities ────────────────────────────────────── */
fetch('activities.json')
  .then(r => r.json())
  .then(data => renderFeed(data))
  .catch(() => {
    document.getElementById('feed').innerHTML =
      '<div class="feed-loading">Could not load updates.</div>';
  });
