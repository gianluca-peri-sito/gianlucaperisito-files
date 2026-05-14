;(function () {

const RADIUS = 24;

// Cat centered vertically in the SVG, smaller than before
const CAT = { x: 8, y: 70, w: 160, h: 160 };

// Each quadrant shrinks to ~30% so pieces clearly fit inside neurons
const QUAD_SCALE = 0.30;

const layers = [
  { x: 245, nodes: [60, 120, 180, 240],       label: 'Input'  },
  { x: 415, nodes: [36, 93, 150, 207, 264],   label: 'Hidden' },
  { x: 555, nodes: [113, 188],                label: 'Output' },
];

// Per-node activation strengths (0 = white, 1 = full green).
// Output: first neuron dim (not cat class), second bright (cat class).
const ACTIVATIONS = [
  [0.85, 0.55, 0.90, 0.70],
  [0.35, 0.80, 0.50, 0.75, 0.40],
  [0.10, 0.90],
];

// Quadrant definitions: clip, translation (quadrant center → neuron center), and
// transform-origin (quadrant center in SVG coords) so scale shrinks toward that point.
// Quadrant centers with CAT={x:8,y:70,w:160,h:160}: TL=(48,110), TR=(128,110), BL=(48,190), BR=(128,190)
const QUADS = [
  { clip: 'inset(0% 50% 50% 0%)', dx: 197, dy: -50, ox:  48, oy: 110 },  // TL → neuron 0 (y=60)
  { clip: 'inset(0% 0% 50% 50%)', dx: 117, dy:  10, ox: 128, oy: 110 },  // TR → neuron 1 (y=120)
  { clip: 'inset(50% 50% 0% 0%)', dx: 197, dy: -10, ox:  48, oy: 190 },  // BL → neuron 2 (y=180)
  { clip: 'inset(50% 0% 0% 50%)', dx: 117, dy:  50, ox: 128, oy: 190 },  // BR → neuron 3 (y=240)
];

const NS          = 'http://www.w3.org/2000/svg';
const svg         = document.getElementById('network');
const LINK_COLOR  = '#111';
const NODE_FILL   = '#fff';
const NODE_STROKE = '#111';

function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

// Interpolate between white and #2ecc71 based on activation strength
function activeColor(strength) {
  const r = Math.round(255 + (46  - 255) * strength);
  const g = Math.round(255 + (204 - 255) * strength);
  const b = Math.round(255 + (113 - 255) * strength);
  return `rgb(${r}, ${g}, ${b})`;
}

// Glow filter for the advancing connection line
const defs = document.createElementNS(NS, 'defs');
defs.innerHTML = `
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="2.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
`;
svg.appendChild(defs);

// --- Cat base image (behind everything) ---
const catBase = svgEl('image', {
  href: 'cat.png', x: CAT.x, y: CAT.y, width: CAT.w, height: CAT.h,
  preserveAspectRatio: 'xMidYMid slice',
});
svg.appendChild(catBase);

// --- Network links ---
const nodeEls     = layers.map(() => []);
const glowLinkEls = [];

for (let i = 0; i < layers.length - 1; i++) {
  glowLinkEls[i] = [];
  let srcIdx = 0;
  for (const y1 of layers[i].nodes) {
    for (const y2 of layers[i + 1].nodes) {
      const coords = { x1: layers[i].x, y1, x2: layers[i + 1].x, y2 };

      const base = svgEl('line', coords);
      base.style.stroke = LINK_COLOR;
      base.style.strokeWidth = 1.5;
      svg.appendChild(base);

      const glow = svgEl('line', coords);
      glow.style.stroke = '#2ecc71';
      glow.style.strokeWidth = 3;
      glow.style.strokeOpacity = 0;
      glow.style.filter = 'url(#glow)';
      glow._srcIdx = srcIdx; // source neuron index for per-connection opacity
      svg.appendChild(glow);

      glowLinkEls[i].push(glow);
    }
    srcIdx++;
  }
}

// --- Network nodes ---
for (let i = 0; i < layers.length; i++) {
  for (const y of layers[i].nodes) {
    const circle = svgEl('circle', { cx: layers[i].x, cy: y, r: RADIUS });
    circle.style.fill = NODE_FILL;
    circle.style.stroke = NODE_STROKE;
    circle.style.strokeWidth = 2;
    svg.appendChild(circle);
    nodeEls[i].push(circle);

    if (i === 1) {
      const cx = layers[i].x;
      const path = svgEl('path', {
        d: `M ${cx - 12} ${y + 7} L ${cx} ${y + 7} L ${cx + 12} ${y - 7}`,
        fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 1.8,
      });
      path.style.stroke = '#444';
      svg.appendChild(path);
    }
  }

}

// --- Grid lines (drawn after nodes, sit on top of cat area) ---
const gridH = svgEl('line', { x1: CAT.x, y1: CAT.y + CAT.h / 2, x2: CAT.x + CAT.w, y2: CAT.y + CAT.h / 2 });
const gridV = svgEl('line', { x1: CAT.x + CAT.w / 2, y1: CAT.y, x2: CAT.x + CAT.w / 2, y2: CAT.y + CAT.h });
for (const g of [gridH, gridV]) {
  g.style.stroke = '#222';
  g.style.strokeWidth = 1.5;
  g.style.opacity = 0;
  svg.appendChild(g);
}

// --- Quadrant images (drawn last, fly on top of the network) ---
const quadImgs = QUADS.map(q => {
  const img = svgEl('image', {
    href: 'cat.png', x: CAT.x, y: CAT.y, width: CAT.w, height: CAT.h,
    preserveAspectRatio: 'xMidYMid slice',
  });
  img.style.clipPath = q.clip;
  img.style.opacity = 0;
  svg.appendChild(img);
  return img;
});

// --- Output labels ---
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
  const s1 = document.createElementNS(NS, 'tspan');
  s1.textContent = lb.pre;
  const s2 = document.createElementNS(NS, 'tspan');
  s2.setAttribute('font-weight', 'bold');
  s2.textContent = lb.bold;
  const s3 = document.createElementNS(NS, 'tspan');
  s3.textContent = lb.post;
  t.appendChild(s1); t.appendChild(s2); t.appendChild(s3);
  svg.appendChild(t);
});

// --- Forward-pass equation ---
katex.render(
  String.raw`\htmlId{eq-y}{y_l} \;=\; \sum_k\,\htmlId{eq-W2}{W_{lk}^{(2)}}\,\htmlId{eq-sigma}{\sigma}\!\left(\sum_j\,\htmlId{eq-W1}{W_{kj}^{(1)}}\htmlId{eq-x}{x_j}\right)`,
  document.getElementById('equation'),
  { trust: true, output: 'html' }
);
const EQ = {};
['eq-y', 'eq-W2', 'eq-sigma', 'eq-W1', 'eq-x'].forEach(id => {
  EQ[id] = document.getElementById(id);
  EQ[id].style.transition = 'color 250ms';
});
function setEqColor(ids, color) {
  for (const id of ids) EQ[id].style.color = color;
}
function resetEq() {
  setEqColor(['eq-y', 'eq-W2', 'eq-sigma', 'eq-W1', 'eq-x'], '');
}

// --- Animation helpers ---
const sleep = ms => new Promise(r => setTimeout(r, ms));

function lineLength(line) {
  const dx = line.getAttribute('x2') - line.getAttribute('x1');
  const dy = line.getAttribute('y2') - line.getAttribute('y1');
  return Math.sqrt(dx * dx + dy * dy);
}

// Activate a layer's nodes with per-node activation strength colours
function activateLayer(layerIdx) {
  nodeEls[layerIdx].forEach((node, i) => {
    node.style.fill = activeColor(ACTIVATIONS[layerIdx][i]);
  });
}

function resetLayer(layerIdx) {
  for (const node of nodeEls[layerIdx]) node.style.fill = NODE_FILL;
}

const PULSE_LEN = 28; // length of the travelling green pulse in pixels

// Animate glow lines as a short pulse travelling from source to destination
function activateLinks(lines, layerIdx, duration) {
  for (const line of lines) {
    const strength = ACTIVATIONS[layerIdx][line._srcIdx];
    const len = lineLength(line);
    // dasharray: short pulse + gap large enough that only one pulse is ever visible
    line.style.transition = 'none';
    line.style.strokeOpacity = strength;
    line.style.strokeDasharray = `${PULSE_LEN} ${len + PULSE_LEN}`;
    line.style.strokeDashoffset = PULSE_LEN;   // pulse starts just before the line
    line.getBoundingClientRect();
    line.style.transition = `stroke-dashoffset ${duration}ms linear`;
    line.style.strokeDashoffset = -len;         // pulse exits off the far end
  }
}

function resetLinks(lines) {
  for (const line of lines) {
    line.style.transition = 'none';
    line.style.strokeOpacity = 0;
    line.style.strokeDasharray = '';
    line.style.strokeDashoffset = 0;
  }
}

// --- Tune this to change overall animation speed (2 = twice as fast, 0.5 = half speed) ---
const SPEED = 0.5;

// --- Main animation loop ---
async function runAnimation() {
  const t = ms => ms / SPEED; // scale all durations by speed

  const CAT_HOLD    = t(800);
  const GRID_TIME   = t(500);
  const SWAP_TIME   = t(200);
  const FLIGHT_TIME = t(800);
  const NODE_TIME   = t(450);
  const LINK_TIME   = t(700);
  const HOLD_TIME   = t(500);
  const PAUSE       = t(150);

  while (true) {
    // Reset: full cat visible, quadrants and grid hidden, equation uncoloured
    catBase.style.transition = 'none';
    catBase.style.opacity = 1;
    for (const g of [gridH, gridV]) { g.style.transition = 'none'; g.style.opacity = 0; }
    for (const q of quadImgs) { q.style.transition = 'none'; q.style.transform = 'none'; q.style.transformOrigin = ''; q.style.opacity = 0; }
    resetEq();
    await sleep(CAT_HOLD);

    // Grid appears over cat
    for (const g of [gridH, gridV]) { g.style.transition = `opacity ${GRID_TIME}ms`; g.style.opacity = 1; }
    await sleep(GRID_TIME);

    // Swap base image for the four quadrant images
    catBase.style.transition = `opacity ${SWAP_TIME}ms`;
    catBase.style.opacity = 0;
    for (const q of quadImgs) { q.style.transition = 'none'; q.style.opacity = 1; }
    await sleep(SWAP_TIME);

    // Fly quadrants to neurons — grid disappears instantly as they start moving
    for (const g of [gridH, gridV]) { g.style.transition = 'none'; g.style.opacity = 0; }
    QUADS.forEach((q, i) => {
      quadImgs[i].style.transformOrigin = `${q.ox}px ${q.oy}px`;
      quadImgs[i].style.transition = `transform ${FLIGHT_TIME}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      quadImgs[i].style.transform = `translate(${q.dx}px, ${q.dy}px) scale(${QUAD_SCALE})`;
    });
    await sleep(FLIGHT_TIME);

    // Quadrants absorbed: fade them out, light up input neurons + eq-x
    for (const q of quadImgs) { q.style.transition = 'opacity 200ms'; q.style.opacity = 0; }
    activateLayer(0);
    setEqColor(['eq-x'], '#2ecc71');
    await sleep(NODE_TIME);

    // Forward pass — eq terms light in sequence: x → W1 → σ → W2 → y
    const eqClearOnLink = [['eq-x'],     ['eq-sigma']];
    const eqSetOnLink   = [['eq-W1'],    ['eq-W2']   ];
    const eqClearOnNode = [['eq-W1'],    ['eq-W2']   ];
    const eqSetOnNode   = [['eq-sigma'], ['eq-y']    ];
    for (let i = 0; i < glowLinkEls.length; i++) {
      setEqColor(eqClearOnLink[i], '');
      setEqColor(eqSetOnLink[i], '#2ecc71');
      activateLinks(glowLinkEls[i], i, LINK_TIME);
      resetLayer(i);
      await sleep(LINK_TIME);
      resetLinks(glowLinkEls[i]);
      await sleep(PAUSE);
      setEqColor(eqClearOnNode[i], '');
      setEqColor(eqSetOnNode[i], '#2ecc71');
      activateLayer(i + 1);
      await sleep(NODE_TIME);
    }

    await sleep(HOLD_TIME);
    resetLayer(nodeEls.length - 1);
    setEqColor(['eq-y'], '');
    await sleep(PAUSE);
  }
}

runAnimation();

})();
