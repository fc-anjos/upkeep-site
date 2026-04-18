// upkeep · lessons
(function () {
// ===========================================================================
// LESSON DIAGRAMS — small didactic animations, one per lesson card
// ===========================================================================
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
// ===========================================================================
// SVG DIAGRAMS — minimal-line originals (lessonStyle = "svg")
// ===========================================================================
function svgSetup(node) {
  const svg = svgEl('svg', { viewBox: '0 0 520 200', preserveAspectRatio: 'xMidYMid meet' });
  node.insertBefore(svg, node.firstChild);
  return svg;
}
const INK = '#1b1a18', INK2 = '#4a453e', INK3 = '#8b857a', ORA = '#cc5a1f', PAPER = '#f3efe4';
function svgText(svg, x, y, content, opts) {
  const t = svgEl('text', Object.assign({ x, y, 'font-family': 'var(--font-mono)', 'font-size': 10, fill: INK2, 'letter-spacing': '0.06em' }, opts || {}));
  t.textContent = content; svg.appendChild(t); return t;
}

const svgDiagrams = {
  'state-growth': (node) => {
    const svg = svgSetup(node);
    const panes = [
      { x0: 40,  y0: 40, x1: 244, y1: 170, color: INK, label: 'THEN · UNBOUNDED' },
      { x0: 276, y0: 40, x1: 496, y1: 170, color: ORA, label: 'NOW · BOUNDED' }
    ];
    panes.forEach((p, idx) => {
      svg.appendChild(svgEl('rect', { x: p.x0, y: p.y0, width: p.x1 - p.x0, height: p.y1 - p.y0, fill: 'none', stroke: INK3, 'stroke-width': 0.75, 'stroke-dasharray': '2 3' }));
      svgText(svg, p.x0, p.y0 - 8, p.label, { fill: p.color });
      svg.appendChild(svgEl('line', { x1: p.x0, y1: p.y1, x2: p.x1, y2: p.y1, stroke: INK2, 'stroke-width': 1 }));
      p.path = svg.appendChild(svgEl('path', { fill: 'none', stroke: p.color, 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      p.dot = svg.appendChild(svgEl('circle', { r: 3, fill: p.color }));
    });
    const oomTxt = svgText(svg, panes[0].x1 - 6, panes[0].y0 + 14, '× OOM', { fill: ORA, 'text-anchor': 'end', opacity: 0 });
    return (t) => {
      const p0 = panes[0], w0 = p0.x1 - p0.x0, h0 = p0.y1 - p0.y0;
      const N = 40; let d0 = '';
      for (let i = 0; i <= N; i++) {
        const s = (i / N) * t;
        const x = p0.x0 + s * w0;
        const y = s < 0.85 ? p0.y1 - Math.pow(s / 0.85, 1.15) * h0 : p0.y0 + 2;
        d0 += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      }
      p0.path.setAttribute('d', d0.trim());
      const sx = p0.x0 + t * w0;
      const sy = t < 0.85 ? p0.y1 - Math.pow(t / 0.85, 1.15) * h0 : p0.y0 + 2;
      p0.dot.setAttribute('cx', sx); p0.dot.setAttribute('cy', sy);
      oomTxt.setAttribute('opacity', t > 0.85 ? 1 : 0);

      const p1 = panes[1], w1 = p1.x1 - p1.x0, h1 = p1.y1 - p1.y0;
      const mid = p1.y1 - h1 * 0.4, band = h1 * 0.14;
      let d1 = '';
      for (let i = 0; i <= 80; i++) {
        const s = i / 80;
        const x = p1.x0 + s * w1;
        const y = mid + Math.sin(s * 22 + t * 8) * band * 0.6 + Math.sin(s * 7 + t * 3) * band * 0.4;
        d1 += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      }
      p1.path.setAttribute('d', d1.trim());
      const ex = p1.x1;
      const ey = mid + Math.sin(22 + t * 8) * band * 0.6 + Math.sin(7 + t * 3) * band * 0.4;
      p1.dot.setAttribute('cx', ex); p1.dot.setAttribute('cy', ey);
    };
  },

  'fanout-check': (node) => {
    const svg = svgSetup(node);
    const CX = 56;
    svg.appendChild(svgEl('circle', { cx: CX, cy: 100, r: 14, fill: 'none', stroke: INK, 'stroke-width': 1.5 }));
    svgText(svg, CX, 104, 'W', { 'text-anchor': 'middle', fill: INK });
    svgText(svg, CX, 135, 'write', { 'text-anchor': 'middle', fill: INK3, 'font-size': 9 });
    svgText(svg, 128, 24, 'THEN · EVERY SUB CHECKED', { fill: INK2 });
    svgText(svg, 128, 126, 'NOW · INDEXED LOOKUP', { fill: ORA });
    const topY = 52, botY = 156;
    const xs = []; for (let i = 0; i < 8; i++) xs.push(136 + i * 48);
    const topLines = [], topCircles = [];
    const botHits = [0, 4];
    xs.forEach((x, i) => {
      topLines.push(svg.appendChild(svgEl('line', { x1: CX + 14, y1: 100, x2: x, y2: topY, stroke: INK3, 'stroke-width': 0.6, 'stroke-dasharray': '2 2' })));
      topCircles.push(svg.appendChild(svgEl('circle', { cx: x, cy: topY, r: 7, fill: 'none', stroke: INK2, 'stroke-width': 1 })));
      const isHit = botHits.includes(i);
      svg.appendChild(svgEl('line', { x1: CX + 14, y1: 100, x2: x, y2: botY, stroke: isHit ? ORA : 'none', 'stroke-width': 1.5 }));
      svg.appendChild(svgEl('circle', { cx: x, cy: botY, r: 7, fill: isHit ? ORA : 'none', stroke: isHit ? ORA : INK3, 'stroke-width': 1 }));
    });
    return (t) => {
      const phase = (t * 8) % 8;
      topLines.forEach((l, i) => {
        const on = Math.abs(i - phase) < 0.6;
        l.setAttribute('stroke', on ? INK : INK3);
        l.setAttribute('stroke-width', on ? 1.2 : 0.6);
        topCircles[i].setAttribute('stroke', on ? INK : INK2);
        topCircles[i].setAttribute('stroke-width', on ? 1.6 : 1);
      });
    };
  },

  'cost-visibility': (node) => {
    const svg = svgSetup(node);
    svgText(svg, 24, 22, 'THEN · OPAQUE', { fill: INK2 });
    svg.appendChild(svgEl('rect', { x: 24, y: 36, width: 200, height: 140, fill: INK }));
    const q = svgEl('text', { x: 124, y: 130, 'text-anchor': 'middle', 'font-family': 'var(--font-mono)', 'font-size': 72, fill: PAPER, 'font-weight': '300' });
    q.textContent = '?'; svg.appendChild(q);
    svgText(svg, 256, 22, 'NOW · INSTRUMENTED', { fill: ORA });
    svg.appendChild(svgEl('line', { x1: 256, y1: 160, x2: 500, y2: 160, stroke: INK2, 'stroke-width': 1 }));
    const labels = ['invalidate', 'overlap', 'render', 'flush'];
    const segs = [];
    labels.forEach((lb, i) => {
      const y = 54 + i * 22;
      svgText(svg, 252, y + 4, lb, { 'text-anchor': 'end', fill: INK3, 'font-size': 9 });
      const bar = svgEl('rect', { x: 256, y: y - 4, width: 0, height: 8, fill: ORA });
      svg.appendChild(bar);
      segs.push({ bar, offset: [0, 20, 95, 210][i], dur: [20, 90, 140, 50][i] });
    });
    [0, 60, 120, 180, 240].forEach((dx, i) => {
      svg.appendChild(svgEl('line', { x1: 256 + dx, y1: 160, x2: 256 + dx, y2: 164, stroke: INK2, 'stroke-width': 1 }));
      svgText(svg, 256 + dx, 176, (i * 60) + 'ms', { 'text-anchor': 'middle', fill: INK3, 'font-size': 8 });
    });
    return (t) => {
      segs.forEach(s => {
        const prog = Math.min(1, Math.max(0, (t * 260 - s.offset) / s.dur));
        s.bar.setAttribute('x', 256 + s.offset);
        s.bar.setAttribute('width', prog * s.dur);
      });
    };
  },

  'backpressure': (node) => {
    const svg = svgSetup(node);
    svgText(svg, 24, 22, 'THEN · FIREHOSE', { fill: INK2 });
    svgText(svg, 24, 118, 'NOW · COALESCED', { fill: ORA });
    svg.appendChild(svgEl('line', { x1: 24, y1: 82, x2: 496, y2: 82, stroke: INK2, 'stroke-width': 1 }));
    svg.appendChild(svgEl('line', { x1: 24, y1: 180, x2: 496, y2: 180, stroke: INK2, 'stroke-width': 1 }));
    const chaosPath = svg.appendChild(svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }));
    const pulsePath = svg.appendChild(svgEl('path', { fill: 'none', stroke: ORA, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
    const seeds = []; for (let i = 0; i < 240; i++) seeds.push(Math.random());
    return (t) => {
      let d = 'M24 82 '; const W = 472;
      for (let i = 0; i <= W; i += 3) {
        const idx = Math.floor((i / W) * seeds.length);
        const s = seeds[(idx + Math.floor(t * 60)) % seeds.length];
        const dy = s > 0.7 ? (s - 0.7) * 140 : 0;
        d += 'L' + (24 + i) + ' ' + (82 - dy).toFixed(1) + ' ';
      }
      chaosPath.setAttribute('d', d);
      const cx = 24 + ((t * W) % W);
      let pd = 'M24 180 ';
      for (let i = 0; i <= W; i += 6) {
        const x = 24 + i;
        const dist = Math.abs(x - cx);
        const dy = dist < 40 ? Math.cos((dist / 40) * (Math.PI / 2)) * 48 : 0;
        pd += 'L' + x + ' ' + (180 - dy).toFixed(1) + ' ';
      }
      pulsePath.setAttribute('d', pd);
    };
  },

  'stateless': (node) => {
    const svg = svgSetup(node);
    svgText(svg, 24, 20, 'THEN · PINNED', { fill: INK2 });
    svgText(svg, 268, 20, 'NOW · ANY WORKER', { fill: ORA });
    function pane(x0) {
      svg.appendChild(svgEl('circle', { cx: x0 + 22, cy: 110, r: 12, fill: 'none', stroke: INK, 'stroke-width': 1.2 }));
      svgText(svg, x0 + 22, 114, 'cli', { 'text-anchor': 'middle', fill: INK, 'font-size': 9 });
      const boxes = [];
      for (let i = 0; i < 3; i++) {
        const bx = x0 + 140, by = 58 + i * 50;
        svg.appendChild(svgEl('rect', { x: bx, y: by, width: 68, height: 32, fill: 'none', stroke: INK2, 'stroke-width': 1 }));
        svgText(svg, bx + 34, by + 20, 'web-0' + (i + 1), { 'text-anchor': 'middle', fill: INK });
        boxes.push({ x: bx, y: by + 16 });
      }
      const line = svgEl('line', { x1: x0 + 34, y1: 110, x2: boxes[1].x, y2: boxes[1].y, stroke: ORA, 'stroke-width': 1.5 });
      svg.appendChild(line);
      return { boxes, line };
    }
    const p0 = pane(24);
    const p1 = pane(268);
    return (t) => {
      p0.line.setAttribute('x2', p0.boxes[1].x); p0.line.setAttribute('y2', p0.boxes[1].y);
      const idx = Math.floor(t * 3) % 3;
      p1.line.setAttribute('x2', p1.boxes[idx].x); p1.line.setAttribute('y2', p1.boxes[idx].y);
    };
  },

  'render-scale': (node) => {
    const svg = svgSetup(node);
    svgText(svg, 24, 20, 'THEN · ONE RENDERER', { fill: INK2 });
    svgText(svg, 268, 20, 'NOW · HORIZONTAL', { fill: ORA });
    for (let i = 0; i < 14; i++) {
      svg.appendChild(svgEl('rect', { x: 36 + (i % 7) * 14, y: 54 + Math.floor(i / 7) * 18, width: 10, height: 12, fill: INK }));
    }
    svg.appendChild(svgEl('rect', { x: 158, y: 90, width: 72, height: 60, fill: 'none', stroke: INK, 'stroke-width': 1.5 }));
    const tFill = svgEl('rect', { x: 160, y: 148, width: 68, height: 0, fill: ORA });
    svg.appendChild(tFill);
    svgText(svg, 194, 168, 'w1', { 'text-anchor': 'middle', fill: INK3, 'font-size': 9 });
    for (let i = 0; i < 4; i++) {
      svg.appendChild(svgEl('rect', { x: 280 + i * 14, y: 60, width: 10, height: 12, fill: INK }));
    }
    const nFills = [];
    for (let i = 0; i < 4; i++) {
      const bx = 292 + i * 46, by = 98;
      svg.appendChild(svgEl('rect', { x: bx, y: by, width: 34, height: 50, fill: 'none', stroke: INK, 'stroke-width': 1 }));
      const fill = svgEl('rect', { x: bx + 1, y: by + 48, width: 32, height: 0, fill: ORA, opacity: 0.85 });
      svg.appendChild(fill); nFills.push({ fill, by });
      svgText(svg, bx + 17, by + 64, 'w' + (i + 1), { 'text-anchor': 'middle', fill: INK3, 'font-size': 9 });
    }
    return (t) => {
      const sat = 0.5 + Math.sin(t * Math.PI * 2) * 0.45;
      const h = Math.max(0, Math.min(58, sat * 58));
      tFill.setAttribute('y', 148 - h); tFill.setAttribute('height', h);
      nFills.forEach((w, i) => {
        const v = 0.25 + Math.sin(t * Math.PI * 2 + i * 0.8) * 0.12;
        const hh = Math.max(0, Math.min(48, v * 48));
        w.fill.setAttribute('y', w.by + 48 - hh); w.fill.setAttribute('height', hh);
      });
    };
  },
};

let lessonUpdaters = [];
let lessonsStart = null;
document.querySelectorAll('.lesson-diagram[data-diagram]').forEach(node => {
  const kind = node.dataset.diagram;
  const builder = svgDiagrams[kind];
  if (!builder) return;
  const update = builder(node);
  if (update) { update(0); lessonUpdaters.push(update); }
});
function lessonsTick(ts) {
  if (lessonsStart == null) lessonsStart = ts;
  const t = (((ts - lessonsStart) / 1000) / 4.5) % 1;
  lessonUpdaters.forEach(u => u(t));
  requestAnimationFrame(lessonsTick);
}
if (lessonUpdaters.length) requestAnimationFrame(lessonsTick);
})();
