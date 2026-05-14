;(function () {

const RADIUS = 24;
const CAT    = { x: 8, y: 70, w: 160, h: 160 };
const QUAD_SCALE = 0.30;

const layers = [
  { x: 245, nodes: [60, 120, 180, 240]      },   // Input
  { x: 415, nodes: [36, 93, 150, 207, 264]  },   // Hidden
  { x: 555, nodes: [113, 188]               },   // Output
];

const ACTIVATIONS = [
  [0.85, 0.55, 0.90, 0.70],
  [0.35, 0.80, 0.50, 0.75, 0.40],
  [0.10, 0.90],
];

const QUADS = [
  { clip: 'inset(0% 50% 50% 0%)', dx: 197, dy: -50, ox:  48, oy: 110 },
  { clip: 'inset(0% 0% 50% 50%)', dx: 117, dy:  10, ox: 128, oy: 110 },
  { clip: 'inset(50% 50% 0% 0%)', dx: 197, dy: -10, ox:  48, oy: 190 },
  { clip: 'inset(50% 0% 0% 50%)', dx: 117, dy:  50, ox: 128, oy: 190 },
];

// Sparse regular links [srcIdx, dstIdx] per layer transition
const REGULAR_LINKS = [
  [[0,1], [2,3], [3,3]],           // input→hidden
  [[0,0], [2,1], [4,0]],           // hidden→output
];

// Triadic hyperedges: (srcA, srcB) → dst
// Two branch lines converge at a midpoint, then one stem line goes to dst.
const TRIADIC_01 = [               // input → hidden
  { srcA: 0, srcB: 2, dst: 0 },
  { srcA: 1, srcB: 3, dst: 2 },
  { srcA: 0, srcB: 3, dst: 4 },
];
const TRIADIC_12 = [               // hidden → output
  { srcA: 0, srcB: 2, dst: 0 },
  { srcA: 1, srcB: 3, dst: 1 },
];

const NS          = 'http://www.w3.org/2000/svg';
const svg         = document.getElementById('network2');
const GREEN       = '#2ecc71';
const LINK_COLOR  = '#111';
const NODE_FILL   = '#fff';
const NODE_STROKE = '#111';
const TRI_COLOR   = '#555';

function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function activeColor(s) {
  return `rgb(${Math.round(255+(46-255)*s)},${Math.round(255+(204-255)*s)},${Math.round(255+(113-255)*s)})`;
}

const defs = document.createElementNS(NS, 'defs');
defs.innerHTML = `
  <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="2.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
svg.appendChild(defs);

const catBase = svgEl('image', {
  href: 'cat.png', x: CAT.x, y: CAT.y, width: CAT.w, height: CAT.h,
  preserveAspectRatio: 'xMidYMid slice',
});
svg.appendChild(catBase);

// ── Regular links ──────────────────────────────────────────────────────────
const nodeEls     = layers.map(() => []);
const glowLinks   = [[], []];

function makeRegularLink(x1, y1, x2, y2, srcIdx, bucket) {
  const base = svgEl('line', { x1, y1, x2, y2 });
  base.style.stroke = LINK_COLOR; base.style.strokeWidth = 1.5;
  svg.appendChild(base);

  const glow = svgEl('line', { x1, y1, x2, y2 });
  glow.style.stroke = GREEN; glow.style.strokeWidth = 3;
  glow.style.strokeOpacity = 0; glow.style.filter = 'url(#glow2)';
  glow._srcIdx = srcIdx;
  svg.appendChild(glow);
  glowLinks[bucket].push(glow);
}

for (const [si, di] of REGULAR_LINKS[0])
  makeRegularLink(layers[0].x, layers[0].nodes[si], layers[1].x, layers[1].nodes[di], si, 0);
for (const [si, di] of REGULAR_LINKS[1])
  makeRegularLink(layers[1].x, layers[1].nodes[si], layers[2].x, layers[2].nodes[di], si, 1);

// ── Triadic Y-shape paths ──────────────────────────────────────────────────
// Each entry is [branchA_glow, branchB_glow, stem_glow]
const glowTriadic01 = [];
const glowTriadic12 = [];

function makeTriadicGroup(triList, layerSrc, layerDst, glowBucket) {
  for (const tri of triList) {
    const srcX  = layers[layerSrc].x;
    const dstX  = layers[layerDst].x;
    const srcAy = layers[layerSrc].nodes[tri.srcA];
    const srcBy = layers[layerSrc].nodes[tri.srcB];
    const dstY  = layers[layerDst].nodes[tri.dst];
    const meetX = (srcX + dstX) / 2;
    const meetY = (srcAy + srcBy) / 2;

    // Cubic Bézier control offsets — curves leave/arrive horizontally
    const bOff = (meetX - srcX) * 0.5;
    const sOff = (dstX - meetX) * 0.5;

    // Branches curve from each source toward the meeting point
    const dA    = `M ${srcX} ${srcAy} C ${srcX+bOff} ${srcAy} ${meetX-bOff} ${meetY} ${meetX} ${meetY}`;
    const dB    = `M ${srcX} ${srcBy} C ${srcX+bOff} ${srcBy} ${meetX-bOff} ${meetY} ${meetX} ${meetY}`;
    // Stem curves from the meeting point to the destination neuron
    const dStem = `M ${meetX} ${meetY} C ${meetX+sOff} ${meetY} ${dstX-sOff} ${dstY} ${dstX} ${dstY}`;

    // Base paths (solid, always visible)
    for (const d of [dA, dB, dStem]) {
      const b = svgEl('path', { d, fill: 'none' });
      b.style.stroke = TRI_COLOR; b.style.strokeWidth = 1.5;
      svg.appendChild(b);
    }

    // Glow paths (animated, initially invisible)
    const makeGlow = d => {
      const g = svgEl('path', { d, fill: 'none' });
      g.style.stroke = GREEN; g.style.strokeWidth = 3;
      g.style.strokeOpacity = 0; g.style.filter = 'url(#glow2)';
      svg.appendChild(g);
      return g;
    };
    glowBucket.push([makeGlow(dA), makeGlow(dB), makeGlow(dStem)]);
  }
}

makeTriadicGroup(TRIADIC_01, 0, 1, glowTriadic01);
makeTriadicGroup(TRIADIC_12, 1, 2, glowTriadic12);

// ── Nodes ──────────────────────────────────────────────────────────────────
for (let i = 0; i < layers.length; i++) {
  for (const y of layers[i].nodes) {
    const c = svgEl('circle', { cx: layers[i].x, cy: y, r: RADIUS });
    c.style.fill = NODE_FILL; c.style.stroke = NODE_STROKE; c.style.strokeWidth = 2;
    svg.appendChild(c);
    nodeEls[i].push(c);

    if (i === 1) {
      const cx = layers[i].x;
      const p = svgEl('path', {
        d: `M ${cx-12} ${y+7} L ${cx} ${y+7} L ${cx+12} ${y-7}`,
        fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 1.8,
      });
      p.style.stroke = '#e74c3c';
      p.style.strokeDasharray = '3 2';
      svg.appendChild(p);
    }
  }
}

// ── Grid & quadrant images ─────────────────────────────────────────────────
const gridH = svgEl('line', { x1: CAT.x, y1: CAT.y+CAT.h/2, x2: CAT.x+CAT.w, y2: CAT.y+CAT.h/2 });
const gridV = svgEl('line', { x1: CAT.x+CAT.w/2, y1: CAT.y, x2: CAT.x+CAT.w/2, y2: CAT.y+CAT.h });
for (const g of [gridH, gridV]) {
  g.style.stroke = '#222'; g.style.strokeWidth = 1.5; g.style.opacity = 0;
  svg.appendChild(g);
}

const quadImgs = QUADS.map(q => {
  const img = svgEl('image', {
    href: 'cat.png', x: CAT.x, y: CAT.y, width: CAT.w, height: CAT.h,
    preserveAspectRatio: 'xMidYMid slice',
  });
  img.style.clipPath = q.clip; img.style.opacity = 0;
  svg.appendChild(img);
  return img;
});

// ── Output labels ──────────────────────────────────────────────────────────
[
  { y: layers[2].nodes[0], pre: "it's a ", bold: "dog", post: "!" },
  { y: layers[2].nodes[1], pre: "it's a ", bold: "cat", post: "!" },
].forEach(lb => {
  const t = svgEl('text', {
    x: layers[2].x + RADIUS + 10, y: lb.y,
    'font-size': 16, 'font-family': 'sans-serif',
    'dominant-baseline': 'middle', 'text-anchor': 'start',
  });
  t.style.fill = '#333';
  const s1 = document.createElementNS(NS, 'tspan'); s1.textContent = lb.pre;
  const s2 = document.createElementNS(NS, 'tspan'); s2.setAttribute('font-weight','bold'); s2.textContent = lb.bold;
  const s3 = document.createElementNS(NS, 'tspan'); s3.textContent = lb.post;
  t.appendChild(s1); t.appendChild(s2); t.appendChild(s3);
  svg.appendChild(t);
});

// ── Equation ───────────────────────────────────────────────────────────────
// Line 1: h_k definition
katex.render(
  String.raw`\htmlId{eq2-hk}{h_k} \;=\; \htmlId{eq2-sigma}{\sigma}\!\left(\sum_j\,\htmlId{eq2-W1}{W_{kj}^{(1)}}\htmlId{eq2-x}{x_j} \;+\; \sum_{i,j}\,\htmlId{eq2-Wt}{\tilde{W}_{kij}^{(1)}}\htmlId{eq2-xx}{x_i x_j}\right)`,
  document.getElementById('equation2-hk'),
  { trust: true, output: 'html' }
);
// Line 2: y_l using h_k
katex.render(
  String.raw`\htmlId{eq2-y}{y_l} \;=\; \sum_k\,\htmlId{eq2-W2}{W_{lk}^{(2)}}\htmlId{eq2-hk2}{h_k} \;+\; \sum_{k,m}\,\htmlId{eq2-Wt2}{\tilde{W}_{lkm}^{(2)}}\htmlId{eq2-hh}{h_k h_m}`,
  document.getElementById('equation2-yl'),
  { trust: true, output: 'html' }
);
const EQ2 = {};
['eq2-hk','eq2-sigma','eq2-W1','eq2-x','eq2-Wt','eq2-xx',
 'eq2-y','eq2-W2','eq2-hk2','eq2-Wt2','eq2-hh'].forEach(id => {
  EQ2[id] = document.getElementById(id);
  EQ2[id].style.transition = 'color 250ms, text-shadow 250ms';
});
// σ is always red; on its turn it gets a green halo instead of turning green
EQ2['eq2-sigma'].style.color = '#e74c3c';
function setSigmaGlow(on) {
  EQ2['eq2-sigma'].style.textShadow = on ? '0 0 6px #2ecc71, 0 0 14px #2ecc71' : '';
}
function setEq(ids, color) { for (const id of ids) EQ2[id].style.color = color; }
function resetEq() {
  setEq(['eq2-hk','eq2-W1','eq2-x','eq2-Wt','eq2-xx',
         'eq2-y','eq2-W2','eq2-hk2','eq2-Wt2','eq2-hh'], '');
  setSigmaGlow(false);
  // restore red after reset clears it
  EQ2['eq2-sigma'].style.color = '#e74c3c';
}

// ── Animation helpers ──────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function lineLength(line) {
  const dx = +line.getAttribute('x2') - +line.getAttribute('x1');
  const dy = +line.getAttribute('y2') - +line.getAttribute('y1');
  return Math.sqrt(dx*dx + dy*dy);
}
function activateLayer(idx) {
  nodeEls[idx].forEach((n,i) => { n.style.fill = activeColor(ACTIVATIONS[idx][i]); });
}
function resetLayer(idx) { for (const n of nodeEls[idx]) n.style.fill = NODE_FILL; }

const PULSE_LEN = 28;

function pulse(el, len, strength, duration) {
  el.style.transition = 'none';
  el.style.strokeOpacity = strength;
  el.style.strokeDasharray = `${PULSE_LEN} ${len + PULSE_LEN}`;
  el.style.strokeDashoffset = PULSE_LEN;
  el.getBoundingClientRect();
  el.style.transition = `stroke-dashoffset ${duration}ms linear`;
  el.style.strokeDashoffset = -len;
}
function clearPulse(el) {
  el.style.transition = 'none';
  el.style.strokeOpacity = 0;
  el.style.strokeDasharray = '';
  el.style.strokeDashoffset = 0;
}

function activateLinks(lines, layerIdx, duration) {
  for (const line of lines)
    pulse(line, lineLength(line), ACTIVATIONS[layerIdx][line._srcIdx], duration);
}
function resetLinks(lines) { for (const line of lines) clearPulse(line); }

// Triadic animation: branches pulse first, then stem — 2-phase within LINK_TIME
function activateTriadicGroup(triads, timerStore, duration) {
  const branchTime = duration * 0.45;
  const stemTime   = duration * 0.55;
  for (const [pA, pB] of triads) {
    pulse(pA, pA.getTotalLength(), 0.75, branchTime);
    pulse(pB, pB.getTotalLength(), 0.75, branchTime);
  }
  timerStore.push(setTimeout(() => {
    for (const [pA, pB, pStem] of triads) {
      clearPulse(pA); clearPulse(pB);
      pulse(pStem, pStem.getTotalLength(), 0.75, stemTime);
    }
  }, branchTime));
}
function resetTriadicGroup(triads, timerStore) {
  for (const id of timerStore) clearTimeout(id);
  timerStore.length = 0;
  for (const [pA, pB, pStem] of triads) { clearPulse(pA); clearPulse(pB); clearPulse(pStem); }
}

// ── Main animation loop ────────────────────────────────────────────────────
const SPEED = 0.5;

async function runAnimation() {
  const t = ms => ms / SPEED;
  const CAT_HOLD    = t(800);
  const GRID_TIME   = t(500);
  const SWAP_TIME   = t(200);
  const FLIGHT_TIME = t(800);
  const NODE_TIME   = t(450);
  const LINK_TIME   = t(700);
  const HOLD_TIME   = t(500);
  const PAUSE       = t(150);

  while (true) {
    catBase.style.transition = 'none'; catBase.style.opacity = 1;
    for (const g of [gridH, gridV]) { g.style.transition = 'none'; g.style.opacity = 0; }
    for (const q of quadImgs) { q.style.transition = 'none'; q.style.transform = 'none'; q.style.transformOrigin = ''; q.style.opacity = 0; }
    resetEq();
    await sleep(CAT_HOLD);

    for (const g of [gridH, gridV]) { g.style.transition = `opacity ${GRID_TIME}ms`; g.style.opacity = 1; }
    await sleep(GRID_TIME);

    catBase.style.transition = `opacity ${SWAP_TIME}ms`; catBase.style.opacity = 0;
    for (const q of quadImgs) { q.style.transition = 'none'; q.style.opacity = 1; }
    await sleep(SWAP_TIME);

    for (const g of [gridH, gridV]) { g.style.transition = 'none'; g.style.opacity = 0; }
    QUADS.forEach((q, i) => {
      quadImgs[i].style.transformOrigin = `${q.ox}px ${q.oy}px`;
      quadImgs[i].style.transition = `transform ${FLIGHT_TIME}ms cubic-bezier(0.4,0,0.2,1)`;
      quadImgs[i].style.transform = `translate(${q.dx}px,${q.dy}px) scale(${QUAD_SCALE})`;
    });
    await sleep(FLIGHT_TIME);

    // Input activates
    for (const q of quadImgs) { q.style.transition = 'opacity 200ms'; q.style.opacity = 0; }
    activateLayer(0);
    setEq(['eq2-x', 'eq2-xx'], GREEN);
    await sleep(NODE_TIME);

    // Input → Hidden: regular links + triadic branches → stem
    setEq(['eq2-x', 'eq2-xx'], '');
    setEq(['eq2-W1', 'eq2-Wt'], GREEN);
    const t01 = [];
    activateLinks(glowLinks[0], 0, LINK_TIME);
    activateTriadicGroup(glowTriadic01, t01, LINK_TIME);
    resetLayer(0);
    await sleep(LINK_TIME);
    resetLinks(glowLinks[0]);
    resetTriadicGroup(glowTriadic01, t01);
    await sleep(PAUSE);
    setEq(['eq2-W1', 'eq2-Wt'], '');
    setSigmaGlow(true); setEq(['eq2-hk', 'eq2-hk2', 'eq2-hh'], GREEN);
    activateLayer(1);
    await sleep(NODE_TIME);

    // Hidden → Output: regular links + triadic branches → stem
    setSigmaGlow(false); setEq(['eq2-hk', 'eq2-hk2', 'eq2-hh'], '');
    setEq(['eq2-W2', 'eq2-Wt2'], GREEN);
    const t12 = [];
    activateLinks(glowLinks[1], 1, LINK_TIME);
    activateTriadicGroup(glowTriadic12, t12, LINK_TIME);
    resetLayer(1);
    await sleep(LINK_TIME);
    resetLinks(glowLinks[1]);
    resetTriadicGroup(glowTriadic12, t12);
    await sleep(PAUSE);
    setEq(['eq2-W2', 'eq2-Wt2'], '');
    setEq(['eq2-y'], GREEN);
    activateLayer(2);
    await sleep(NODE_TIME);

    await sleep(HOLD_TIME);
    resetLayer(nodeEls.length - 1);
    setEq(['eq2-y'], '');
    await sleep(PAUSE);
  }
}

runAnimation();

})();
