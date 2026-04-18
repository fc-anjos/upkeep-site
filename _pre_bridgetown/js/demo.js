// upkeep · demo
(function () {
// ===========================================================================
// LIVE DEMO — two-pane kanban
// ===========================================================================
const LANES = [
  { id: 'todo',  name: 'to do' },
  { id: 'doing', name: 'in progress' },
  { id: 'done',  name: 'done' },
];

const seedCards = () => ([
  { id: 1, title: 'Write README',          lane: 'todo',  rev: 1 },
  { id: 2, title: 'Refactor read-set',     lane: 'todo',  rev: 1 },
  { id: 3, title: 'Overlap benchmark',     lane: 'doing', rev: 1 },
  { id: 4, title: 'ActionCable demo',      lane: 'doing', rev: 1 },
  { id: 5, title: 'Release 0.1.3',         lane: 'done',  rev: 1 },
]);

const db = { cards: seedCards(), nextId: 6, subs: [], stats: { writes: 0, checks: 0, pushes: 0, noops: 0 } };

function escapeHtml(s){return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function log(kind, action, payload) {
  const el = document.getElementById('demoLog'); if (!el) return;
  const ts = new Date().toTimeString().slice(0,8);
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `<span class="t">${ts}</span><span class="a ${kind}">${action}</span><span class="p">${payload}</span>`;
  el.prepend(row);
  while (el.children.length > 60) el.removeChild(el.lastChild);
}
function bumpStats() {
  document.getElementById('kv-writes').textContent = db.stats.writes;
  document.getElementById('kv-checks').textContent = db.stats.checks;
  document.getElementById('kv-pushes').textContent = db.stats.pushes;
  document.getElementById('kv-noops').textContent  = db.stats.noops;
}
function cardHTML(card) {
  return `<div class="card" data-card="${card.id}"><div class="t">${escapeHtml(card.title)}</div><div class="meta"><span>card#${card.id}</span><span>rev ${card.rev}</span></div></div>`;
}

function ensureBoards() {
  document.querySelectorAll('.browser[data-pane]').forEach(paneEl => {
    const root = paneEl.querySelector('.board');
    if (!root.children.length) {
      LANES.forEach(lane => {
        const el = document.createElement('div');
        el.className = 'lane'; el.dataset.lane = lane.id;
        el.innerHTML = `<h6>${lane.name} <span class="count">0</span></h6><div class="lane-body"></div>`;
        root.appendChild(el);
      });
      paneEl.addEventListener('click', e => {
        const c = e.target.closest('.card'); if (!c) return;
        const id = parseInt(c.dataset.card, 10);
        cycleLane(id, paneEl.dataset.pane);
      });
    }
  });
}

function renderPaneFull(paneEl, changedIds) {
  const root = paneEl.querySelector('.board');
  LANES.forEach(lane => {
    const laneEl = root.querySelector(`[data-lane="${lane.id}"]`);
    const body = laneEl.querySelector('.lane-body');
    const cards = db.cards.filter(c => c.lane === lane.id);
    laneEl.querySelector('.count').textContent = cards.length;
    body.innerHTML = '';
    cards.forEach(c => {
      const holder = document.createElement('div');
      holder.innerHTML = cardHTML(c).trim();
      const node = holder.firstChild;
      body.appendChild(node);
      if (changedIds && changedIds.includes(c.id)) {
        node.classList.add('flash');
        if (paneEl.dataset.pane === 'B') node.classList.add('blue');
        setTimeout(() => node.classList.remove('flash', 'blue'), 1200);
      }
    });
  });
}

function pushToSubscribers(changedIds, origin) {
  // simulate overlap check per subscriber
  db.subs.forEach(sub => {
    db.stats.checks++;
    // every subscriber has the whole board here, so every check overlaps;
    // but for completeness we count a "noop" for empty changes
    if (!changedIds.length) { db.stats.noops++; return; }
    db.stats.pushes++;
    renderPaneFull(sub.paneEl, changedIds);
  });
  bumpStats();
  if (changedIds.length) {
    const payload = changedIds.map(id => `card#${id}`).join(', ');
    log('push', `push →`, `${db.subs.length} subscribers · ${payload}`);
  }
}

function cycleLane(id, origin) {
  const card = db.cards.find(c => c.id === id); if (!card) return;
  const idx = LANES.findIndex(l => l.id === card.lane);
  card.lane = LANES[(idx + 1) % LANES.length].id;
  card.rev += 1;
  db.stats.writes++;
  log('write', `write (${origin})`, `update card#${id} → lane=${card.lane}`);
  pushToSubscribers([id], origin);
}

function moveRandom() {
  const c = db.cards[Math.floor(Math.random() * db.cards.length)];
  cycleLane(c.id, 'system');
}

function addCard() {
  const id = db.nextId++;
  const titles = ['Document read-set API', 'Benchmark overlap cost', 'Transport fuzz test',
    'Publish changelog', 'Investigate render N+1', 'Wire diagnostics panel', 'Triage issue #24'];
  db.cards.push({ id, title: titles[Math.floor(Math.random()*titles.length)], lane: 'todo', rev: 1 });
  db.stats.writes++;
  log('write', `write (A)`, `insert card#${id}`);
  pushToSubscribers([id], 'A');
}

function renameRandom() {
  const c = db.cards[Math.floor(Math.random() * db.cards.length)];
  const tags = ['(draft)','(v2)','(wip)','(urgent)','(revisit)','(blocked)'];
  c.title = c.title.replace(/\s+\([^)]+\)$/, '') + ' ' + tags[Math.floor(Math.random()*tags.length)];
  c.rev += 1;
  db.stats.writes++;
  log('write', `write (system)`, `update card#${c.id} title`);
  pushToSubscribers([c.id], 'system');
}

function reset() {
  db.cards = seedCards(); db.nextId = 6;
  db.stats = { writes: 0, checks: 0, pushes: 0, noops: 0 };
  log('meta', `reset`, `seed cards restored`);
  pushToSubscribers(db.cards.map(c => c.id), 'system');
  bumpStats();
}

// init
document.querySelectorAll('.browser[data-pane]').forEach(paneEl => db.subs.push({ paneEl }));
ensureBoards();
document.getElementById('kv-subs').textContent = db.subs.length;
log('meta', `init`, `two subscribers attached · read-sets empty`);
pushToSubscribers(db.cards.map(c => c.id), 'init');
// initial paint should not count as writes/pushes in the stats
db.stats = { writes: 0, checks: 0, pushes: 0, noops: 0 };
bumpStats();

// controls
document.querySelectorAll('[data-act]').forEach(btn => {
  btn.addEventListener('click', () => {
    const act = btn.dataset.act;
    if (act === 'move-random') moveRandom();
    if (act === 'add') addCard();
    if (act === 'rename') renameRandom();
    if (act === 'reset') reset();
  });
});

// ambient activity (pauses on hover)
let ambient = null;
function startAmbient() {
  if (ambient) return;
  ambient = setInterval(() => {
    const r = Math.random();
    if (r < 0.65) moveRandom();
    else if (r < 0.92) renameRandom();
    else if (db.cards.length < 9) addCard();
  }, 5200);
}
function stopAmbient() { if (ambient) { clearInterval(ambient); ambient = null; } }
startAmbient();

const demoShell = document.querySelector('.demo-shell');
if (demoShell) {
  demoShell.addEventListener('mouseenter', stopAmbient);
  demoShell.addEventListener('mouseleave', startAmbient);
}

})();
