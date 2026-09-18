/* credits.gg — data layer: loads JSON, builds lookup indexes. */
const DB = {
  franchises: [],
  entries: {},       // id -> entry (+franchise_id)
  contributors: {},  // id -> contributor
  studios: {},       // id -> studio (+franchise_ids[])
  stubs: {},         // fictional stub games
  loaded: false,
};

async function loadData() {
  if (DB.loaded) return;
  const [fr, gow, witcher, gta, samples] = await Promise.all([
    fetch('data/franchises.json').then(r => r.json()),
    fetch('data/gow.json').then(r => r.json()),
    fetch('data/witcher.json').then(r => r.json()),
    fetch('data/gta.json').then(r => r.json()),
    fetch('data/samples.json').then(r => r.json()),
  ]);
  DB.franchises = fr.franchises;
  for (const pack of [gow, witcher, gta]) {
    const fid = pack.franchise_id;
    for (const e of pack.entries) {
      e.franchise_id = fid;
      DB.entries[e.id] = e;
    }
    const contribs = pack.contributors || [];
    for (const c of contribs) {
      if (!DB.contributors[c.id]) DB.contributors[c.id] = { ...c, credit_list: [] };
      for (const cr of (c.credits || [])) {
        DB.contributors[c.id].credit_list.push({ ...cr, franchise_id: fid });
      }
    }
    for (const s of (pack.studios || [])) {
      if (!DB.studios[s.id]) DB.studios[s.id] = { ...s, franchise_ids: [] };
      if (!DB.studios[s.id].franchise_ids.includes(fid)) DB.studios[s.id].franchise_ids.push(fid);
    }
  }
  // fictional sample contributors (Worked Together + sample credits)
  for (const c of samples.contributors) {
    DB.contributors[c.id] = {
      id: c.id, name: c.name, fictional: true,
      discipline: c.discipline, credit_list: [],
      sample_games: c.games || [],
    };
  }
  for (const s of samples.stubs) DB.stubs[s.id] = s;
  DB.loaded = true;
}

/* ---------- lookups ---------- */
const franchiseById = id => DB.franchises.find(f => f.id === id);
const entryById = id => DB.entries[id] || DB.stubs[id] || null;
const contributorById = id => DB.contributors[id] || null;
const studioById = id => DB.studios[id] || null;
const isStub = id => !!DB.stubs[id];

function franchiseEntries(fid) {
  return Object.values(DB.entries).filter(e => e.franchise_id === fid);
}
function entryFranchise(e) { return franchiseById(e.franchise_id); }

/* all contributors credited on an entry (sourced credits + fictional sample credits) */
function entryCredits(entryId) {
  const out = [];
  for (const c of Object.values(DB.contributors)) {
    for (const cr of (c.credit_list || [])) {
      if (cr.entry === entryId) out.push({ contributor: c, ...cr });
    }
  }
  const e = DB.entries[entryId];
  if (e && e.sample_credits) {
    for (const sc of e.sample_credits) {
      const c = DB.contributors[sc.contributor] || { id: sc.contributor, name: sc.name, fictional: true };
      out.push({ contributor: c, entry: entryId, role: sc.role, discipline: sc.discipline, sub: sc.sub, platforms: sc.platforms, fictional: true, verified: false, source: null });
    }
  }
  return out;
}

/* entry ids a contributor is associated with (credits + sample games) */
function contributorEntries(cid) {
  const c = contributorById(cid);
  if (!c) return [];
  const ids = new Set((c.credit_list || []).map(cr => cr.entry));
  for (const g of (c.sample_games || [])) ids.add(g);
  return [...ids].filter(id => entryById(id));
}

/* studios referenced by a franchise's entries */
function franchiseStudios(fid) {
  const ids = new Set();
  for (const e of franchiseEntries(fid)) for (const s of (e.studios || [])) ids.add(s);
  return [...ids].map(studioById).filter(Boolean);
}

/* per-platform counts for a studio within a franchise */
function studioPlatformBreakdown(sid, fid) {
  const counts = {};
  for (const e of franchiseEntries(fid)) {
    if (!(e.studios || []).includes(sid)) continue;
    for (const r of (e.releases || [])) {
      const p = r.platform || 'Unknown';
      counts[p] = (counts[p] || 0) + 1;
    }
  }
  return counts;
}

function studioEntries(sid) {
  return Object.values(DB.entries).filter(e => (e.studios || []).includes(sid));
}

/* monogram initials for logo tiles */
function monogram(name) {
  const words = name.replace(/^The /, '').split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w[0]));
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
function hueFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}
