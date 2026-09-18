/* credits.gg — view components and pages (render to HTML strings). */

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtDate(d) { return d || 'TBC'; }
function yearOf(e) { return e.year || 'TBC'; }

const KIND_LABEL = { original: 'ORIGINAL', remaster: 'REMASTER', collection: 'COLLECTION', port: 'PORT', patch: 'PATCH', dlc: 'DLC', announced: 'ANNOUNCED' };
function kindTag(kind) { return `<span class="tag">${KIND_LABEL[kind] || esc(kind).toUpperCase()}</span>`; }
function sampleBadge() { return ` <span class="tag-sample">SAMPLE</span>`; }
function unverifiedBadge() { return ` <span class="tag-unverified">UNVERIFIED</span>`; }

/* AI-adapted studio logo tile: dark monogram + orange AI corner badge */
function logoTile(studio, cls) {
  if (!studio) return '';
  const hue = hueFor(studio.id);
  return `<span class="logo-tile ${cls || ''}" title="${esc(studio.name)} — AI-adapted logo" style="--h:${hue}">${esc(monogram(studio.name))}<span class="ai-badge">AI</span></span>`;
}

function contributorLink(c, extra) {
  if (!c) return '';
  const badge = c.fictional ? sampleBadge() : '';
  return `<button class="link-btn" data-nav="#/contributor/${c.id}">${esc(c.name)}</button>${badge}${extra || ''}`;
}

function studioNames(entry) {
  if (entry.text_attribution && entry.studio_text) return esc(entry.studio_text);
  return (entry.studios || []).map(id => { const s = studioById(id); return s ? esc(s.name) : ''; }).filter(Boolean).join(' · ');
}

function studioLogos(entry) {
  if (entry.text_attribution) return '';
  const logos = (entry.studios || []).map(id => logoTile(studioById(id))).join('');
  return logos ? `<span class="logo-row">${logos}</span>` : '';
}

function entryCard(e) {
  const announced = e.kind === 'announced' ? ' announced' : '';
  const studios = studioNames(e);
  const platforms = [...new Set((e.releases || []).map(r => r.platform))].join(' · ');
  return `<div class="card clickable${announced}" data-nav="#/game/${e.id}">
    <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
      <span class="year">${yearOf(e)}</span>${kindTag(e.kind)}
    </div>
    <div class="title">${esc(e.title)}</div>
    ${e.fictional ? `<div>${sampleBadge()}</div>` : ''}
    <div class="sub">${esc(studios)}</div>
    <div class="sub small" style="color:var(--faint)">${esc(platforms)}</div>
    <div class="logo-row">${studioLogos(e)}</div>
  </div>`;
}

function sectionTitle(fid, section) {
  const names = {
    'god-of-war': { greek: 'Greek originals', library: 'Collections, remasters & ports', norse: 'Norse era', announced: 'Announced / unreleased' },
  };
  const generic = { main: 'Main series', library: 'Updates & re-releases', announced: 'Announced / unreleased', greek: 'Classics', norse: 'Modern era' };
  return (names[fid] && names[fid][section]) || generic[section] || section;
}

function chipMatch(e, chip) {
  if (chip === 'all') return true;
  if (chip === 'originals') return e.kind === 'original';
  if (chip === 'library') return ['remaster', 'collection', 'port', 'patch', 'dlc'].includes(e.kind);
  if (chip === 'announced') return e.kind === 'announced';
  return true;
}

/* ---------------- home ---------------- */
function viewHome() {
  const cards = DB.franchises.map(f => {
    const n = franchiseEntries(f.id).length;
    return `<div class="card clickable theme-${f.theme}" data-nav="#/franchise/${f.id}" style="padding:0;overflow:hidden">
      <div class="hero-art" style="padding:22px;position:relative">
        <div class="eyebrow">Franchise</div>
        <div class="title" style="font-size:20px">${esc(f.name)}</div>
        <div class="sub">${n} tracked releases</div>
      </div>
      <div style="padding:14px 18px"><span class="small muted">${esc(f.publisher)}</span></div>
    </div>`;
  }).join('');
  return `<div class="page">
    <div class="hero-card tall home-hero">
      <div class="eyebrow">credits.gg — the people behind the games</div>
      <h1>Games have <span class="amber">credits.</span><br>Now they have context.</h1>
      <p class="muted" style="max-width:640px">An IMDb-style database for video games — who made them, which studios, and how their careers connect across franchises.</p>
      <div class="mt"><button class="btn" data-nav="#/search">Search catalog</button>
      <button class="btn-ghost" data-nav="#/worked-together" style="margin-left:10px">Worked together</button></div>
      <div class="quick-pills">
        <button class="pill" data-nav="#/franchise/god-of-war">God of War</button>
        <button class="pill" data-nav="#/search" data-q="audio">audio credits</button>
        <button class="pill" data-nav="#/worked-together">fictional studio</button>
      </div>
    </div>
    <div class="section"><h2>Franchises</h2>
      <div class="grid-4">${cards}</div>
    </div>
    <div class="section">
      <details class="blueprint"><summary>Production data &amp; asset blueprint (V1)</summary><div class="body">
        <p>Database models: franchises, games, releases (per-platform, each with date + contributor group), studios, contributors, credits (role, discipline, sub-discipline), tenure ranges, sources, asset references.</p>
        <p>Asset storage: <code>site/assets/logos/</code> (studio logo tiles), <code>site/assets/art/</code> (franchise key art &amp; backgrounds), every asset recorded in <code>site/assets/provenance.json</code> with origin and AI-derivative flags.</p>
      </div></details>
    </div>
  </div>`;
}

function viewFranchises() {
  const cards = DB.franchises.map(f => {
    const n = franchiseEntries(f.id).length;
    const studios = franchiseStudios(f.id).length;
    return `<div class="card clickable" data-nav="#/franchise/${f.id}">
      <div class="eyebrow">${esc(f.span)}</div>
      <div class="title" style="font-size:20px">${esc(f.name)}</div>
      <div class="sub">${n} tracked releases · ${studios} studios</div>
      <div class="sub small">${esc(f.publisher)}</div>
      ${f.sample_note ? `<div class="small muted">${esc(f.sample_note)}</div>` : ''}
    </div>`;
  }).join('');
  return `<div class="page"><div class="breadcrumb"><a data-nav="#/">Discover</a> / Franchises</div>
    <h1>Franchises</h1><div class="section"><div class="grid-4">${cards}</div></div></div>`;
}

/* ---------------- franchise page ---------------- */
function viewFranchise(fid) {
  const f = franchiseById(fid);
  if (!f) return `<div class="page"><h1>Not found</h1></div>`;
  const chip = S.chip || 'all';
  const studioFilter = S.studioFilter || null;
  let entries = franchiseEntries(fid).filter(e => chipMatch(e, chip));
  if (studioFilter) entries = entries.filter(e => (e.studios || []).includes(studioFilter));

  const all = franchiseEntries(fid);
  const nOrig = all.filter(e => e.kind === 'original').length;
  const nLib = all.filter(e => ['remaster', 'collection', 'port', 'patch', 'dlc'].includes(e.kind)).length;
  const nAnn = all.filter(e => e.kind === 'announced').length;

  const chips = [
    ['all', `All ${all.length}`], ['originals', 'Originals'],
    ['library', 'Collections, ports & remasters'], ['announced', 'Announced / unreleased'],
  ].map(([k, lbl]) => `<button class="pill${chip === k ? ' active' : ''}" onclick="App.setChip('${k}')">${lbl}</button>`).join('');

  const order = ['greek', 'main', 'library', 'norse', 'announced'];
  const sections = order.map(sec => {
    const list = entries.filter(e => e.section === sec).sort((a, b) => (a.year || 9999) - (b.year || 9999));
    if (!list.length) return '';
    return `<div class="section"><h2>${sectionTitle(fid, sec)}</h2>
      <div class="grid-4">${list.map(entryCard).join('')}</div></div>`;
  }).join('');

  const studios = franchiseStudios(fid);
  const studioCards = studios.map(s => {
    const n = all.filter(e => (e.studios || []).includes(s.id)).length;
    const sel = studioFilter === s.id;
    let detail = '';
    if (sel) {
      const bd = studioPlatformBreakdown(s.id, fid);
      const bdStr = Object.entries(bd).map(([p, n2]) => `${esc(p)} · ${n2}`).join(', ') || '—';
      detail = `<div class="detail">
        <div class="kv"><span class="k">Established</span><span>${s.established || '—'}</span></div>
        <div class="kv"><span class="k">Tracked games by platform</span><span>${bdStr}</span></div>
        <div><a href="#/studio/${s.id}" class="link-btn" onclick="event.stopPropagation()">Open full studio profile →</a></div>
      </div>`;
    }
    return `<button class="studio-card${sel ? ' selected' : ''}" onclick="App.toggleStudio('${s.id}')">
      <span class="logo-row">${logoTile(s)}<span><span class="name">${esc(s.name)}</span><br><span class="meta">${n} tracked releases</span></span></span>
      ${detail}
    </button>`;
  }).join('');

  const filterNotice = studioFilter ? (() => {
    const s = studioById(studioFilter);
    return `<div class="notice"><span>Timeline filtered to <strong>${esc(s ? s.name : '')}</strong>. Select the studio card again to clear.</span>
      <button class="btn-ghost" onclick="App.toggleStudio('${studioFilter}')">Clear studio filter</button></div>`;
  })() : `<div class="hint">Showing every studio in this franchise.</div>`;

  // people who shaped the franchise: top contributors by credit count
  const counts = {};
  for (const c of Object.values(DB.contributors)) {
    const n = (c.credit_list || []).filter(cr => cr.franchise_id === fid).length;
    if (n) counts[c.id] = n;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const people = top.map(([cid, n]) => {
    const c = contributorById(cid);
    return `<div>${contributorLink(c)} <span class="small muted">· ${n} credit${n > 1 ? 's' : ''}</span></div>`;
  }).join('');

  return `<div class="page theme-${f.theme}">
    <div class="breadcrumb"><a data-nav="#/franchises">Franchises</a> / ${esc(f.name)}</div>
    <div class="hero-card tall hero-art" style="position:relative">
      <div class="eyebrow">Franchise timeline · ${esc(f.span)}</div>
      <h1 style="font-size:42px">${esc(f.name)}</h1>
      <div class="pill-row">
        <span class="pill">Publisher: ${esc(f.publisher)}</span>
        <span class="pill">${all.length} tracked releases / projects</span>
        <span class="pill">${studios.length} studios</span>
      </div>
      <div class="stats-row">
        <div class="stat"><span class="num">${all.length}</span><span class="lbl">tracked releases / projects</span></div>
        <div class="stat"><span class="num">${nOrig}</span><span class="lbl">original released games</span></div>
        <div class="stat"><span class="num">${nLib}</span><span class="lbl">library / remaster / port / patch / DLC</span></div>
        <div class="stat"><span class="num">${nAnn}</span><span class="lbl">announced projects</span></div>
      </div>
      <div class="pill-row">${chips}</div>
    </div>
    ${f.sample_note ? `<div class="notice mt"><span>${esc(f.sample_note)}</span></div>` : ''}
    ${fid === 'god-of-war' ? `<div class="dossier"><span class="tag">Real franchise dossier</span><br>Release dates, studios and key credits are source-backed from the Sep 2026 research pass. The God of War (2018) page pairs sourced key credits with a clearly labeled fictional list used to demonstrate release filtering. Research snapshot · 17 Sep 2026.</div>` : ''}
    ${filterNotice}
    ${sections}
    <div class="section"><h2>Studios across ${esc(f.name)}</h2>
      <div class="hint">Select a studio to filter; select it again to clear.</div>
      <div class="grid-4">${studioCards}</div></div>
    <div class="section"><h2>People who shaped the franchise</h2>
      <div class="hint">Most credited contributors across the timeline.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px">${people}</div></div>
  </div>`;
}

/* ---------------- game page ---------------- */
function platformPills(e) {
  const sel = S.pills || null; // null = all
  const platforms = [...new Set((e.releases || []).map(r => r.platform))];
  const allBtn = `<button class="pill${!sel ? ' active' : ''}" onclick="App.setPills(null)">All releases</button>`;
  const btns = platforms.map(p => {
    const rel = (e.releases || []).find(r => r.platform === p);
    const tip = [p, rel && rel.date ? fmtDate(rel.date) : 'date TBC', rel && rel.port_studio ? '· ' + rel.port_studio : ''].join(' ');
    const active = sel && sel.includes(p);
    return `<button class="pill${active ? ' active' : ''}" title="${esc(tip)}" onclick="App.togglePill('${esc(p)}')">${esc(p)}${rel && rel.type !== 'original' ? ' · ' + esc(rel.type.split(' ')[0]) : ''}</button>`;
  }).join('');
  return `<div class="pill-row">${allBtn}${btns}</div>`;
}

function creditVisible(cr, pills) {
  if (!pills) return true;
  if (!cr.platforms) return true; // sourced credits span all releases by default
  return cr.platforms.some(p => pills.includes(p));
}

function viewGame(id) {
  const e = entryById(id);
  if (!e) return `<div class="page"><h1>Not found</h1></div>`;
  const stub = isStub(id);
  const f = e.franchise_id ? franchiseById(e.franchise_id) : null;
  const pills = S.pills || null;
  const announced = e.kind === 'announced';

  const credits = stub ? [] : entryCredits(id).filter(cr => creditVisible(cr, pills));
  const byDept = {};
  for (const cr of credits) {
    const d = cr.discipline || 'Other';
    (byDept[d] = byDept[d] || []).push(cr);
  }
  const deptHtml = Object.entries(byDept).sort().map(([d, list]) => `
    <details class="dept" open><summary>${esc(d)} <span class="count">${list.length}</span></summary><div class="body">
      ${list.map(cr => {
        const scope = cr.platforms ? `<span class="small muted"> · ${esc(cr.platforms.join(', '))} only</span>` : '';
        const badges = `${cr.fictional ? sampleBadge() : ''}${cr.verified === false ? unverifiedBadge() : ''}`;
        const sub = cr.sub ? ` <span class="small muted">(${esc(cr.sub)})</span>` : '';
        return `<div class="credit-row"><span>${contributorLink(cr.contributor)}${badges}${scope}</span><span class="role">${esc(cr.role)}${sub}</span></div>`;
      }).join('')}
    </div></details>`).join('');

  const sampleNote = (e.sample_credits && e.sample_credits.length)
    ? `<div class="notice"><span>Sample credits below are <strong>fictional</strong> and demonstrate release-scoped filtering — select platform pills to filter.</span></div>` : '';

  const releases = (e.releases || []).map(r => `<tr>
    <td>${esc(r.platform)}</td><td>${fmtDate(r.date)}</td><td>${esc(r.type)}</td>
    <td>${r.port_studio ? esc(r.port_studio) : '<span class="muted">—</span>'}</td>
    <td>${r.source ? `<a href="${esc(r.source)}" target="_blank" rel="noopener">source</a>` : '<span class="muted">—</span>'}</td>
  </tr>`).join('');

  const children = Object.values(DB.entries).filter(x => x.parent === id);
  const related = children.length ? `<div class="section"><h2>Related releases</h2><div class="grid-4">${children.map(entryCard).join('')}</div></div>` : '';
  const parent = e.parent && DB.entries[e.parent]
    ? `<div class="mt"><span class="small muted">${esc(e.parent_label || 'Related to')}: </span><button class="link-btn" data-nav="#/game/${e.parent}">${esc(DB.entries[e.parent].title)}</button></div>` : '';

  const limited = announced ? `<div class="notice"><span>Announced / unreleased — deliberately limited page: sparse verified metadata only.</span></div>` : '';

  return `<div class="page${f ? ' theme-' + f.theme : ''}">
    <div class="breadcrumb">${f ? `<a data-nav="#/franchises">Franchises</a> / <a data-nav="#/franchise/${f.id}">${esc(f.name)}</a>` : `<a data-nav="#/">Discover</a> / Sample games`} / ${esc(e.title)}</div>
    <div class="hero-card${announced ? ' announced' : ''}" style="${announced ? 'border-style:dashed' : ''}">
      <div class="eyebrow">${yearOf(e)}${e.genre ? ' · ' + esc(e.genre).toUpperCase() : ''}</div>
      <h1>${esc(e.title)} ${kindTag(e.kind)}${e.fictional ? sampleBadge() : ''}${e.unverified_note ? unverifiedBadge() : ''}</h1>
      ${f ? `<div class="pill-row"><button class="pill" data-nav="#/franchise/${f.id}">Franchise: ${esc(f.name)}</button></div>` : ''}
      ${parent}${limited}
      <p class="muted">${esc(e.description || '')}</p>
      ${e.dossier_note ? `<div class="dossier"><span class="tag">Dossier note</span><br>${esc(e.dossier_note)}</div>` : ''}
      ${e.unverified_note ? `<div class="notice"><span>${esc(e.unverified_note)}</span></div>` : ''}
      <div class="mt"><div class="logo-row">${studioLogos(e)}<span class="muted">${esc(studioNames(e))}</span></div></div>
      ${stub ? '' : `<div class="mt"><h3 style="font-size:14px;color:var(--faint);text-transform:uppercase;letter-spacing:0.1em">Platform releases</h3>${platformPills(e)}</div>`}
    </div>
    ${stub ? '' : `<div class="section"><h2>Releases</h2>
      ${e.releases && e.releases.length ? `<table class="plain"><tr><th>Platform</th><th>Date</th><th>Type</th><th>Port studio</th><th>Source</th></tr>${releases}</table>` : '<p class="muted">No dated releases tracked yet.</p>'}
    </div>`}
    ${credits.length ? `<div class="section"><h2>${e.sample_credits && e.sample_credits.length ? 'Sourced credits by department' : 'Credits by department'}</h2>${sampleNote}${deptHtml}</div>`
      : (stub ? `<div class="section"><p class="muted">Fictional sample game used to demonstrate the Worked Together flow. No credits tracked.</p></div>` : '')}
    ${related}
  </div>`;
}

/* ---------------- studio pages ---------------- */
function viewStudios() {
  const cards = Object.values(DB.studios).map(s => {
    const n = studioEntries(s.id).length;
    return `<button class="studio-card" data-nav="#/studio/${s.id}">
      <span class="logo-row">${logoTile(s)}<span><span class="name">${esc(s.name)}</span><br><span class="meta">${n} tracked releases · ${s.franchise_ids.length} franchise${s.franchise_ids.length > 1 ? 's' : ''}</span></span></span>
    </button>`;
  }).join('');
  return `<div class="page"><div class="breadcrumb"><a data-nav="#/">Discover</a> / Studios</div>
    <h1>Studios</h1><p class="muted">Every studio tracked in the demo. Logo tiles are AI-adapted monograms — see the AI badge.</p>
    <div class="section"><div class="grid-4">${cards}</div></div></div>`;
}

function viewStudio(id) {
  const s = studioById(id);
  if (!s) return `<div class="page"><h1>Not found</h1></div>`;
  const entries = studioEntries(id);
  const perFranchise = {};
  for (const e of entries) (perFranchise[e.franchise_id] = perFranchise[e.franchise_id] || []).push(e);
  const blocks = Object.entries(perFranchise).map(([fid, list]) => {
    const f = franchiseById(fid);
    const bd = studioPlatformBreakdown(id, fid);
    const bdStr = Object.entries(bd).map(([p, n]) => `${esc(p)} · ${n}`).join(', ') || '—';
    const rows = list.sort((a, b) => (a.year || 9999) - (b.year || 9999)).map(e =>
      `<div class="game-result"><span><span class="year" style="color:var(--teal);font-weight:700">${yearOf(e)}</span> · <button class="link-btn" data-nav="#/game/${e.id}">${esc(e.title)}</button> ${kindTag(e.kind)}</span><button class="link-btn" data-nav="#/franchise/${fid}">Open franchise →</button></div>`).join('');
    return `<div class="section"><h2>${esc(f ? f.name : fid)}</h2>
      <div class="kv"><span class="k">Tracked games by platform</span><span>${bdStr}</span></div><div class="mt">${rows}</div></div>`;
  }).join('');
  return `<div class="page"><div class="breadcrumb"><a data-nav="#/studios">Studios</a> / ${esc(s.name)}</div>
    <div class="hero-card"><div class="logo-row">${logoTile(s, 'lg')}
      <div><div class="eyebrow">Studio dossier</div><h1 style="margin:0">${esc(s.name)}</h1></div></div>
      <div class="stats-row">
        <div class="stat"><span class="num">${entries.length}</span><span class="lbl">franchise release records</span></div>
        <div class="stat"><span class="num">${s.established || '—'}</span><span class="lbl">established</span></div>
      </div>
      ${s.note ? `<p class="small muted">${esc(s.note)}</p>` : ''}
      <p class="small muted">Logo tile is an AI-adapted monogram (orange AI badge).</p>
    </div>${blocks}</div>`;
}

/* ---------------- contributor profile ---------------- */
function viewContributor(id) {
  const c = contributorById(id);
  if (!c) return `<div class="page"><h1>Not found</h1></div>`;
  const credits = c.credit_list || [];
  const games = contributorEntries(id);
  const initials = c.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // tenure: per-franchise year span from credits
  const perFr = {};
  for (const cr of credits) {
    const e = DB.entries[cr.entry];
    if (!e || !e.year) continue;
    const f = cr.franchise_id;
    (perFr[f] = perFr[f] || []).push(e.year);
  }
  const tenure = Object.entries(perFr).map(([fid, years]) => {
    const f = franchiseById(fid);
    const lo = Math.min(...years), hi = Math.max(...years);
    return `<div class="mt"><div style="display:flex;justify-content:space-between"><strong>${esc(f ? f.name : fid)}</strong><span class="small muted">${lo} — ${hi}</span></div>
      <div class="tenure-bar"><div class="fill" style="left:0%;width:100%"></div></div>
      <div class="small muted">${years.length} credited appearance${years.length > 1 ? 's' : ''}</div></div>`;
  }).join('');

  const context = credits.map(cr => {
    const e = DB.entries[cr.entry];
    const f = franchiseById(cr.franchise_id);
    return `<div class="credit-row"><span>${e ? `<button class="link-btn" data-nav="#/game/${e.id}">${esc(e.title)}</button>` : ''} <span class="small muted">· ${esc(f ? f.name : '')}</span>${cr.verified === false ? unverifiedBadge() : ''}</span><span class="role">${esc(cr.role)}${cr.sub ? ` (${esc(cr.sub)})` : ''}</span></div>`;
  }).join('');

  const sampleGames = (c.sample_games || []).map(gid => {
    const g = entryById(gid);
    if (!g) return '';
    return `<div class="game-result"><span>${g.fictional ? sampleBadge() + ' ' : ''}<button class="link-btn" data-nav="#/game/${gid}">${esc(g.title)}</button> <span class="small muted">· ${g.year || 'TBC'}</span></span><span class="small muted">${esc(g.genre || '')}</span></div>`;
  }).join('');

  const sources = [...new Set(credits.map(cr => cr.source).filter(Boolean))];
  const srcHtml = sources.length ? `<div class="section"><h2>Sources in this demo</h2><div class="src-list">${sources.map(s => `<div><a href="${esc(s)}" target="_blank" rel="noopener">${esc(s)}</a></div>`).join('')}</div></div>` : '';

  const cards = games.filter(gid => DB.entries[gid]).map(gid => {
    const g = DB.entries[gid];
    return `<div class="card clickable" data-nav="#/game/${gid}"><span class="year">${yearOf(g)}</span><div class="title" style="font-size:15px">${esc(g.title)}</div><div class="sub small">${esc(studioNames(g))}</div></div>`;
  }).join('');

  return `<div class="page"><div class="breadcrumb"><a data-nav="#/search">Search</a> / Contributor</div>
    <div class="hero-card"><div class="logo-row"><span class="avatar">${esc(initials)}</span>
      <div><div class="eyebrow">${c.fictional ? 'Sample' : 'Sourced'} contributor profile</div>
      <h1 style="margin:0">${esc(c.name)}${c.fictional ? sampleBadge() : ''}</h1>
      <div class="muted">${credits.length + (c.sample_games || []).length} tracked credit appearances${c.discipline ? ' · ' + esc(c.discipline) : ''}</div></div></div>
      ${c.note ? `<p class="small muted mt">${esc(c.note)}</p>` : ''}
      ${c.fictional ? `<div class="notice mt"><span>Fictional sample contributor used to demonstrate the Worked Together flow.</span></div>` : ''}
    </div>
    ${tenure ? `<div class="section"><h2>Tenure across franchises</h2><p class="hint">Joined from credit dates — inline, never a modal.</p>${tenure}</div>` : ''}
    ${context ? `<div class="section"><h2>Franchise and role context</h2>${context}</div>` : ''}
    ${sampleGames ? `<div class="section"><h2>Sample game associations</h2>${sampleGames}</div>` : ''}
    ${srcHtml}
    ${cards ? `<div class="section"><h2>Games and releases</h2><div class="grid-4">${cards}</div></div>` : ''}
  </div>`;
}

/* ---------------- worked together ---------------- */
function wtContributors() { return Object.values(DB.contributors); }
function wtGamesOf(cid) { return contributorEntries(cid); }
function wtGameContributors(gid) {
  return wtContributors().filter(c => wtGamesOf(c.id).includes(gid));
}
function gameTitle(gid) { const g = entryById(gid); return g ? g.title : gid; }

function viewWT() {
  const w = S.wt || (S.wt = { mode: 'people', selected: [], q: '', dept: '', gameSel: [], gq: '' });
  const modeBtns = `<div class="pill-row">
    <button class="pill${w.mode === 'people' ? ' active' : ''}" onclick="App.wtMode('people')">People → games</button>
    <button class="pill${w.mode === 'games' ? ' active' : ''}" onclick="App.wtMode('games')">Games → games</button></div>`;
  return `<div class="page"><div class="breadcrumb"><a data-nav="#/">Discover</a> / Worked together</div>
    <h1>Worked together</h1>
    <p class="muted" style="max-width:700px">Pick contributors and find the games they share — or pick games and find others with overlapping crews. ${''}</p>
    ${modeBtns}
    ${w.mode === 'people' ? wtPeopleView(w) : wtGamesView(w)}
  </div>`;
}

function wtPeopleView(w) {
  const sel = w.selected;
  const chips = sel.map(cid => {
    const c = contributorById(cid);
    return `<span class="chip-x">${esc(c ? c.name : cid)}<button onclick="App.wtRemove('${cid}')" aria-label="remove">×</button></span>`;
  }).join('');

  const deptOpts = [...new Set(wtContributors().map(c => c.discipline || (c.credit_list[0] && c.credit_list[0].discipline)).filter(Boolean))].sort();
  let suggestions, header;
  if (!sel.length) {
    suggestions = wtContributors()
      .map(c => ({ c, n: wtGamesOf(c.id).length }))
      .filter(x => x.n > 0 && (!w.dept || (x.c.discipline || (x.c.credit_list[0] || {}).discipline) === w.dept))
      .sort((a, b) => b.n - a.n || a.c.name.localeCompare(b.c.name));
    header = 'Ranked by total sample game credits';
  } else {
    const selGames = new Set(sel.flatMap(wtGamesOf));
    suggestions = wtContributors()
      .filter(c => !sel.includes(c.id))
      .map(c => ({ c, n: wtGamesOf(c.id).filter(g => selGames.has(g)).length }))
      .filter(x => x.n > 0 && (!w.dept || (x.c.discipline || (x.c.credit_list[0] || {}).discipline) === w.dept))
      .sort((a, b) => b.n - a.n || a.c.name.localeCompare(b.c.name));
    header = 'Ranked by shared sample credits';
  }
  const label = x => sel.length ? `${x.n} shared` : `${x.n} game${x.n > 1 ? 's' : ''}`;
  const suggHtml = suggestions.slice(0, 12).map(x =>
    `<button class="suggest-row" onclick="App.wtAdd('${x.c.id}')">
      <span>+ ${esc(x.c.name)}${x.c.fictional ? sampleBadge() : ''} <span class="small muted">· ${esc(x.c.discipline || ((x.c.credit_list[0] || {}).discipline) || '')}</span></span>
      <span class="n">${label(x)}</span></button>`).join('') || '<p class="muted">No suggestions match.</p>';

  let results = '';
  if (sel.length) {
    const allGames = [...new Set(sel.flatMap(wtGamesOf))];
    const exact = [], partial = [];
    for (const g of allGames) {
      const overlap = sel.filter(cid => wtGamesOf(cid).includes(g));
      if (overlap.length === sel.length) exact.push(g);
      else if (overlap.length) partial.push({ g, overlap });
    }
    partial.sort((a, b) => b.overlap.length - a.overlap.length);
    const gameRow = (g, over) => {
      const e = entryById(g);
      const names = over.map(cid => esc((contributorById(cid) || {}).name || cid)).join(', ');
      return `<div class="game-result"><span>${e && e.fictional ? sampleBadge() + ' ' : ''}<button class="link-btn" data-nav="#/game/${g}">${esc(gameTitle(g))}</button><br><span class="small muted">${names}</span></span><span class="overlap">${over.length}/${sel.length}</span></div>`;
    };
    results = `<div class="section"><h2>Results</h2>
      ${exact.length ? `<h3 class="small" style="color:var(--teal)">Exact matches — everyone selected (${exact.length})</h3>${exact.map(g => gameRow(g, sel)).join('')}`
        : `<div class="notice"><span>No single game features everyone selected — closest matches below.</span></div>`}
      ${partial.length ? `<h3 class="small muted mt">Partial matches (${partial.length})</h3>${partial.map(x => gameRow(x.g, x.overlap)).join('')}` : ''}
    </div>`;
  }

  return `<div class="wt-layout"><div>
      <h3>Selected</h3>
      <div class="pill-row">${chips || '<span class="muted small">Nobody selected yet.</span>'}</div>
      <div class="autocomplete mt"><input id="wt-q" type="text" placeholder="Type a contributor name…" value="${esc(w.q)}" oninput="App.wtAC(this.value)" autocomplete="off"><div class="ac-list" id="ac-list" style="display:none"></div></div>
      <div class="filter-row"><label class="small muted">Department</label>
        <select onchange="App.wtDept(this.value)"><option value="">All</option>${deptOpts.map(d => `<option${w.dept === d ? ' selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
    </div><div>
      <h3>Suggested to add</h3><p class="hint">${header}</p>${suggHtml}${results}
    </div></div>`;
}

function wtGamesView(w) {
  const sel = w.gameSel;
  const chips = sel.map(gid =>
    `<span class="chip-x">${esc(gameTitle(gid))}<button onclick="App.wtGRemove('${gid}')" aria-label="remove">×</button></span>`).join('');
  let suggHtml = '<p class="muted">Select games to find others with overlapping crews.</p>';
  let results = '';
  if (sel.length) {
    const crewOf = g => new Set(wtGameContributors(g).map(c => c.id));
    const selCrew = new Set(sel.flatMap(g => [...crewOf(g)]));
    const allGames = [...new Set(Object.keys(DB.entries).concat(Object.keys(DB.stubs)))].filter(g => !sel.includes(g));
    const ranked = allGames.map(g => {
      const shared = [...crewOf(g)].filter(c => selCrew.has(c));
      return { g, shared };
    }).filter(x => x.shared.length).sort((a, b) => b.shared.length - a.shared.length).slice(0, 12);
    suggHtml = ranked.map(x => {
      const e = entryById(x.g);
      return `<div class="game-result"><span>${e && e.fictional ? sampleBadge() + ' ' : ''}<button class="link-btn" data-nav="#/game/${x.g}">${esc(gameTitle(x.g))}</button><br><span class="small muted">${x.shared.map(cid => esc((contributorById(cid) || {}).name || '')).join(', ')}</span></span><span class="overlap">${x.shared.length} shared</span></div>`;
    }).join('') || '<p class="muted">No overlapping crews found.</p>';
  }
  return `<div class="wt-layout"><div>
      <h3>Selected games</h3>
      <div class="pill-row">${chips || '<span class="muted small">No games selected yet.</span>'}</div>
      <div class="autocomplete mt"><input id="wt-gq" type="text" placeholder="Type a game title…" value="${esc(w.gq)}" oninput="App.wtGAC(this.value)" autocomplete="off"><div class="ac-list" id="ac-list" style="display:none"></div></div>
    </div><div><h3>Games with overlapping crews</h3><p class="hint">Ranked by shared contributors</p>${suggHtml}</div></div>`;
}

/* ---------------- search ---------------- */
function viewSearch() {
  const q = (S.q || '').trim().toLowerCase();
  let html = '';
  if (q) {
    const games = Object.values(DB.entries).filter(e => e.title.toLowerCase().includes(q)).slice(0, 10);
    const stubs = Object.values(DB.stubs).filter(e => e.title.toLowerCase().includes(q));
    const people = Object.values(DB.contributors).filter(c => c.name.toLowerCase().includes(q)).slice(0, 10);
    const studios = Object.values(DB.studios).filter(s => s.name.toLowerCase().includes(q));
    const frs = DB.franchises.filter(f => f.name.toLowerCase().includes(q));
    const grp = (t, items) => items.length ? `<h3 class="mt">${t}</h3>${items}` : '';
    html = `<div class="section">
      ${grp('Games', games.map(e => `<div class="game-result"><span><button class="link-btn" data-nav="#/game/${e.id}">${esc(e.title)}</button> <span class="small muted">· ${yearOf(e)}</span> ${kindTag(e.kind)}</span><span class="small muted">${esc(studioNames(e))}</span></div>`).join(''))}
      ${grp('Sample games', stubs.map(e => `<div class="game-result"><span>${sampleBadge()} <button class="link-btn" data-nav="#/game/${e.id}">${esc(e.title)}</button></span></div>`).join(''))}
      ${grp('Contributors', people.map(c => `<div class="game-result"><span>${contributorLink(c)}</span><span class="small muted">${contributorEntries(c.id).length} games</span></div>`).join(''))}
      ${grp('Studios', studios.map(s => `<div class="game-result"><span class="logo-row">${logoTile(s)}<button class="link-btn" data-nav="#/studio/${s.id}">${esc(s.name)}</button></span><span class="small muted">${studioEntries(s.id).length} releases</span></div>`).join(''))}
      ${grp('Franchises', frs.map(f => `<div class="game-result"><span><button class="link-btn" data-nav="#/franchise/${f.id}">${esc(f.name)}</button></span><span class="small muted">${esc(f.publisher)}</span></div>`).join(''))}
      ${(!games.length && !people.length && !studios.length && !frs.length && !stubs.length) ? '<p class="muted">No results.</p>' : ''}
    </div>`;
  } else {
    html = `<div class="section"><p class="muted">Search games, contributors, studios, and franchises. Search is the flagship feature — full search UX is deferred in V1.</p>
      <div class="quick-pills"><button class="pill" onclick="App.searchFor('god of war')">God of War</button><button class="pill" onclick="App.searchFor('barlog')">Barlog</button><button class="pill" onclick="App.searchFor('santa monica')">Santa Monica</button></div></div>`;
  }
  return `<div class="page"><div class="breadcrumb"><a data-nav="#/">Discover</a> / Search</div>
    <h1>Search</h1>
    <div class="mt" style="max-width:560px"><input id="search-q" type="text" placeholder="Games, people, studios…" value="${esc(S.q || '')}" oninput="App.searchInput(this.value)" style="width:100%;padding:12px 16px;font-size:16px"></div>
    ${html}</div>`;
}

/* ---------------- tech (deferred) ---------------- */
function viewTech() {
  const plats = {};
  for (const e of Object.values(DB.entries)) for (const r of (e.releases || [])) plats[r.platform] = (plats[r.platform] || 0) + 1;
  const rows = Object.entries(plats).sort((a, b) => b[1] - a[1]).map(([p, n]) => `<tr><td>${esc(p)}</td><td>${n}</td></tr>`).join('');
  return `<div class="page"><div class="breadcrumb"><a data-nav="#/">Discover</a> / Tech</div>
    <h1>Technology</h1>
    <div class="dossier"><span class="tag">Deferred in V1</span><br>Per-game tech-stack tracking (engines, middleware, tools) is planned for a later phase. V1 focuses on people, studios, and releases. Below: platform coverage across tracked releases.</div>
    <div class="section"><h2>Platforms covered</h2><table class="plain"><tr><th>Platform</th><th>Tracked releases</th></tr>${rows}</table></div>
  </div>`;
}
