/* ─── Scroll-reveal ──────────────────────────────────────── */
(function () {
  const SECTIONS = ['.hero', '.about', '.experience', '.toolbox', '.contact', '.moodboards', '.activity'];
  const DELAYS   = [0, 0.06, 0.10, 0.13, 0.16, 0.19, 0.22];

  const els = SECTIONS.map(s => document.querySelector(s)).filter(Boolean);
  els.forEach(el => el.classList.add('will-animate'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const i = els.indexOf(entry.target);
      const delay = i !== -1 ? DELAYS[i] : 0;
      setTimeout(() => entry.target.classList.add('animated'), delay * 1000);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  els.forEach(el => io.observe(el));
})();

/* ─── Are.na moodboards ──────────────────────────────────── */
const ARENA_CHANNELS = [
  { slug: 'move-fbvlnbq1piq',   href: 'https://www.are.na/kr-dv/move-fbvlnbq1piq' },
  { slug: 'fnth',               href: 'https://www.are.na/kr-dv/fnth' },
  { slug: 'bits-zlyzwoq6bvo',   href: 'https://www.are.na/kr-dv/bits-zlyzwoq6bvo' },
];

async function loadArena() {
  const container = document.getElementById('arenaChannels');
  if (!container) return;

  try {
    const results = await Promise.all(
      ARENA_CHANNELS.map(({ slug }) =>
        fetch(`https://api.are.na/v2/channels/${slug}?per=30`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    );

    const allImages = results
      .filter(Boolean)
      .flatMap((ch, i) =>
        (ch.contents || [])
          .filter(b => b.class === 'Image' && b.image?.large?.url)
          .map(b => ({ ...b, _channelHref: ARENA_CHANNELS[i].href }))
      );

    // Shuffle
    for (let i = allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }

    if (!allImages.length) {
      container.innerHTML = '<div class="feed-loading">Could not load images.</div>';
      return;
    }

    const scroll = document.createElement('div');
    scroll.className = 'arena-scroll';

    allImages.forEach((b, i) => {
      const a = document.createElement('a');
      a.href = b._channelHref;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'arena-thumb-link';
      a.style.animationDelay = `${0.04 * i}s`;

      const img = document.createElement('img');
      img.className = 'arena-thumb';
      img.src = b.image.large.url;
      img.alt = '';
      img.loading = 'lazy';

      a.appendChild(img);
      scroll.appendChild(a);
    });

    container.innerHTML = '';
    container.appendChild(scroll);
  } catch (_) {
    container.innerHTML = '<div class="feed-loading">Could not load images.</div>';
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

if (btn) {
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  });
}

/* ─── Type labels ────────────────────────────────────────── */
const TYPE_LABELS = {
  article:    'Article',
  medium:     'Article on Medium',
  linkedin:   'LinkedIn post',
  talk:       'Talk',
  case:       'Case Study',
  ai:         'AI experiment',
  mentorship: 'Mentorship',
  career:     'Career',
  award:      'Award',
};

/* ─── Platform icon ──────────────────────────────────────── */
function getPlatformSlug(link) {
  if (!link) return '';
  if (link.includes('linkedin.com'))                      return 'linkedin';
  if (link.includes('medium.com'))                        return 'medium';
  if (link.includes('youtube.com') || link.includes('youtu.be')) return 'youtube';
  return '';
}

/* ─── Date formatter ─────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/* ─── Render feed (main page) ────────────────────────────── */
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
    const platform = getPlatformSlug(item.link);
    const platformIcon = platform
      ? `<img class="feed-platform-icon" src="https://cdn.simpleicons.org/${platform}" alt="${platform}">`
      : '';

    el.innerHTML = `
      <div class="feed-date">${formatDate(item.date)}</div>
      <div class="feed-body">
        <div class="feed-type-badge">
          <span class="feed-type-dot"></span>
          ${label}${platformIcon}
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

/* ─── Render activities page (list style) ────────────────── */
function renderActivitiesList(items) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  items.forEach((item, i) => {
    const hasLink = item.link && item.link.trim() !== '';
    const el = document.createElement('div');
    el.className = 'act-item';
    el.style.animationDelay = `${0.04 * i}s`;

    el.innerHTML = `
      ${hasLink
        ? `<a class="act-title" href="${item.link}" target="_blank" rel="noopener">${item.title} ↗</a>`
        : `<span class="act-title">${item.title}</span>`
      }
      ${item.description ? `<p class="act-desc">${item.description}</p>` : ''}
    `;

    feed.appendChild(el);
  });
}

/* ─── RSS sources (auto-imported) ───────────────────────── */
const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

const RSS_SOURCES = [
  {
    url: 'https://medium.com/feed/@askirdyaev',
    type: 'medium',
  },
  {
    url: 'https://habr.com/ru/users/FlappyKird/rss/articles/',
    type: 'article',
  },
];

function isoFromRssDate(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 10);
}

async function fetchRss(source) {
  try {
    const res = await fetch(RSS_PROXY + encodeURIComponent(source.url));
    const json = await res.json();
    if (json.status !== 'ok' || !json.items) return [];
    return json.items.map(item => ({
      date: isoFromRssDate(item.pubDate),
      type: source.type,
      title: item.title || '',
      description: item.description
        ? item.description.replace(/<[^>]+>/g, '').slice(0, 160).trim() + '…'
        : '',
      link: item.link || item.guid || '',
      _auto: true,
    })).filter(i => i.date);
  } catch (_) {
    return [];
  }
}

/* ─── Load activities ────────────────────────────────────── */
const FEED_LIMIT = 5;
const isActivitiesPage = document.body.dataset.page === 'activities';

async function loadActivities() {
  const feed = document.getElementById('feed');
  if (!feed) return;

  // Fetch manual entries + all RSS sources in parallel
  const [manual, ...rssResults] = await Promise.all([
    fetch('activities.json').then(r => r.json()).catch(() => []),
    ...RSS_SOURCES.map(fetchRss),
  ]);

  // Build a set of known links from manual entries (to avoid duplicates)
  const manualLinks = new Set(
    manual.map(i => i.link).filter(Boolean).map(l => l.split('?')[0])
  );

  // Keep only RSS items not already in manual
  const fresh = rssResults
    .flat()
    .filter(i => !manualLinks.has(i.link.split('?')[0]));

  const all = [...manual, ...fresh]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (isActivitiesPage) {
    renderFeed(all);
  } else {
    renderFeed(all.slice(0, FEED_LIMIT));
    if (all.length > FEED_LIMIT) {
      const btn = document.createElement('a');
      btn.href = 'activities.html';
      btn.className = 'show-more';
      btn.textContent = `Show all ${all.length} activities →`;
      feed.after(btn);
    }
  }
}

loadActivities();
