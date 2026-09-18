/* credits.gg — hash router, view state, and UI actions. */
const S = { chip: 'all', studioFilter: null, pills: null, q: '', wt: null };

const NAV = [
  ['#/', 'Discover'], ['#/search', 'Search'], ['#/franchises', 'Franchises'],
  ['#/studios', 'Studios'], ['#/tech', 'Tech'], ['#/worked-together', 'Worked together'],
];

function route() {
  const h = location.hash || '#/';
  const [path] = h.split('?');
  const seg = path.replace(/^#\//, '').split('/');
  if (path === '#/' || path === '') return { view: viewHome, nav: '#/' };
  if (seg[0] === 'franchises') return { view: viewFranchises, nav: '#/franchises' };
  if (seg[0] === 'franchise' && seg[1]) { S.chip = S.chip || 'all'; return { view: () => viewFranchise(seg[1]), nav: '#/franchises' }; }
  if (seg[0] === 'game' && seg[1]) { return { view: () => viewGame(seg[1]), nav: '' }; }
  if (seg[0] === 'studios') return { view: viewStudios, nav: '#/studios' };
  if (seg[0] === 'studio' && seg[1]) return { view: () => viewStudio(seg[1]), nav: '#/studios' };
  if (seg[0] === 'contributor' && seg[1]) return { view: () => viewContributor(seg[1]), nav: '' };
  if (seg[0] === 'worked-together') { if (!S.wt) S.wt = { mode: 'people', selected: [], q: '', dept: '', gameSel: [], gq: '' }; return { view: viewWT, nav: '#/worked-together' }; }
  if (seg[0] === 'search') return { view: viewSearch, nav: '#/search' };
  if (seg[0] === 'tech') return { view: viewTech, nav: '#/tech' };
  return { view: () => '<div class="page"><h1>Not found</h1></div>', nav: '' };
}

function render() {
  const r = route();
  const app = document.getElementById('app');
  app.innerHTML = r.view();
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === r.nav);
  });
  window.scrollTo(0, 0);
}

function headerHtml() {
  return `<header class="site-header"><div class="inner">
    <a class="brand" href="#/" style="text-decoration:none">credits<span class="dot">.</span>gg</a>
    <nav class="nav">${NAV.map(([href, lbl]) => `<a href="${href}">${lbl}</a>`).join('')}</nav>
    <div class="header-search"><input type="text" placeholder="Search…" onkeydown="if(event.key==='Enter'){App.searchFor(this.value)}" aria-label="Search"></div>
  </div></header>`;
}

const App = {
  setChip(k) { S.chip = k; render(); },
  toggleStudio(id) { S.studioFilter = (S.studioFilter === id) ? null : id; render(); },
  setPills(v) { S.pills = v; render(); },
  togglePill(p) {
    let sel = S.pills ? [...S.pills] : [];
    sel = sel.includes(p) ? sel.filter(x => x !== p) : [...sel, p];
    S.pills = sel.length ? sel : null;
    render();
  },
  searchFor(q) { S.q = q; location.hash = '#/search'; if ((location.hash || '') === '#/search') render(); },
  searchInput(v) { S.q = v; render(); const el = document.getElementById('search-q'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } },
  /* worked together */
  wtMode(m) { S.wt.mode = m; render(); },
  wtDept(d) { S.wt.dept = d; render(); },
  wtAdd(id) { if (!S.wt.selected.includes(id)) S.wt.selected.push(id); S.wt.q = ''; render(); },
  wtRemove(id) { S.wt.selected = S.wt.selected.filter(x => x !== id); render(); },
  wtAC(v) {
    S.wt.q = v;
    const box = document.getElementById('ac-list');
    const q = v.trim().toLowerCase();
    if (!q || q.length < 1) { box.style.display = 'none'; box.innerHTML = ''; return; }
    const hits = wtContributors()
      .filter(c => !S.wt.selected.includes(c.id) && c.name.toLowerCase().includes(q))
      .slice(0, 8);
    if (!hits.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.innerHTML = hits.map(c => `<button onclick="App.wtAdd('${c.id}')">${esc(c.name)}${c.fictional ? ' (sample)' : ''}</button>`).join('');
    box.style.display = 'block';
  },
  wtGAdd(id) { if (!S.wt.gameSel.includes(id)) S.wt.gameSel.push(id); S.wt.gq = ''; render(); },
  wtGRemove(id) { S.wt.gameSel = S.wt.gameSel.filter(x => x !== id); render(); },
  wtGAC(v) {
    S.wt.gq = v;
    const box = document.getElementById('ac-list');
    const q = v.trim().toLowerCase();
    if (!q || q.length < 1) { box.style.display = 'none'; box.innerHTML = ''; return; }
    const all = [...Object.values(DB.entries), ...Object.values(DB.stubs)];
    const hits = all.filter(g => !S.wt.gameSel.includes(g.id) && g.title.toLowerCase().includes(q)).slice(0, 8);
    if (!hits.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.innerHTML = hits.map(g => `<button onclick="App.wtGAdd('${g.id}')">${esc(g.title)}${g.fictional ? ' (sample)' : ''}</button>`).join('');
    box.style.display = 'block';
  },
};
window.App = App;

document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-nav]');
  if (t) { ev.preventDefault(); location.hash = t.getAttribute('data-nav'); }
  // close autocomplete when clicking elsewhere
  if (!ev.target.closest('.autocomplete')) {
    const box = document.getElementById('ac-list');
    if (box) box.style.display = 'none';
  }
  // quick-pill with preset query
  const q = ev.target.closest('[data-q]');
  if (q && q.hasAttribute('data-nav')) { S.q = q.getAttribute('data-q'); }
});
window.addEventListener('hashchange', () => {
  const h = location.hash || '#/';
  if (h.startsWith('#/game/')) S.pills = null;
  render();
});

(async function init() {
  document.body.insertAdjacentHTML('afterbegin', headerHtml());
  document.body.insertAdjacentHTML('beforeend', `<footer class="site-footer">credits.gg V1 demo · static rebuild · Research snapshot · 17 Sep 2026 · Fictional sample records are labeled SAMPLE.</footer>`);
  const app = document.createElement('main');
  app.id = 'app';
  document.body.insertBefore(app, document.querySelector('.site-footer'));
  app.innerHTML = '<div class="page"><p class="muted">Loading…</p></div>';
  try {
    await loadData();
  } catch (err) {
    app.innerHTML = '<div class="page"><h1>Failed to load data</h1><p class="muted">Serve this directory over HTTP (e.g. <code>python3 -m http.server</code>) — JSON cannot load from file://.</p></div>';
    return;
  }
  render();
})();
