// upkeep · hero
(function () {
// ===========================================================================
// HERO DIAGRAM — slower, cleaner, narrated staging
// ===========================================================================
const heroSvg = document.querySelector('.hero .dgm svg');
const heroCap = document.getElementById('h-caption');
let heroTick = 0;

const scenarios = [
  { record: 'r1', label: 'Card#42', frags: ['f1', 'f2'], fcEdges: [['f1','c1'], ['f2','c1'], ['f2','c2']], rfEdges: ['r1-f1', 'r1-f2'] },
  { record: 'r2', label: 'Card#43', frags: ['f2'],       fcEdges: [['f2','c1'], ['f2','c2']],            rfEdges: ['r2-f2'] },
  { record: 'r3', label: 'User#7',  frags: ['f3'],       fcEdges: [['f3','c3']],                          rfEdges: ['r3-f3'] },
];

function heroReset() {
  if (!heroSvg) return;
  heroSvg.querySelectorAll('.node').forEach(n => { n.classList.remove('on','write','push'); });
  heroSvg.querySelectorAll('.edge').forEach(e => e.classList.remove('on'));
}

function heroFrame() {
  if (!heroSvg) return;
  const sc = scenarios[heroTick % scenarios.length];
  heroTick++;

  // stage 0: reset
  heroReset();
  heroCap.textContent = "standby · read-sets recorded during initial render";

  // stage 1 (400ms): write arrives
  setTimeout(() => {
    heroSvg.querySelector(`[data-id="${sc.record}"]`)?.classList.add('write');
    heroCap.textContent = `stage 1 · write on ${sc.label}`;
  }, 400);

  // stage 2 (1300ms): overlap, light matching fragments + read edges
  setTimeout(() => {
    sc.rfEdges.forEach(id => heroSvg.querySelector(`[data-rf="${id}"]`)?.classList.add('on'));
    sc.frags.forEach(f => heroSvg.querySelector(`[data-id="${f}"]`)?.classList.add('on'));
    heroCap.textContent = `stage 2 · overlap · ${sc.frags.length} fragment${sc.frags.length>1?'s':''} match`;
  }, 1300);

  // stage 3 (2300ms): push to clients
  setTimeout(() => {
    sc.fcEdges.forEach(([f,c]) => heroSvg.querySelector(`[data-fc="${f}-${c}"]`)?.classList.add('on'));
    const clients = Array.from(new Set(sc.fcEdges.map(([,c]) => c)));
    clients.forEach(c => heroSvg.querySelector(`[data-id="${c}"]`)?.classList.add('push'));
    heroCap.textContent = `stage 3 · push · ${clients.length} subscriber${clients.length>1?'s':''}`;
  }, 2300);
}
heroFrame();
setInterval(heroFrame, 3800);

})();
