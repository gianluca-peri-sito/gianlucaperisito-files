// "Inside a Transformer": the pane opened by the word "Transformer" in the page's lede. An animated diagram of a
// GPT-style (decoder-only) Transformer, read from the bottom up, explained one block at a time for non-experts.
// The diagram follows the sketch the user gave on 2026-10-13. The scenes are illustrations: their colours, bar lengths
// and the continuation of the sentence are invented, and they carry no numbers.
{
  const $ = (id) => document.getElementById(id);
  const PAPER = "https://arxiv.org/abs/1706.03762", GPT3 = "https://arxiv.org/abs/2005.14165";
  const WORDS = ["the", "cat", "sat", "on", "the"];
  const cx = (i) => 75 + 82 * i, SX = cx(4);           // column of each token; the stream rises above the last one

  // Each step lights some parts of the diagram (data-part). Step 0 is the overview: everything on, with a short text.
  // Steps 1 to 7 have no text at all (the user's choice): the right side shows an animated drawing of the step (SCENES).
  const STEPS = [
    { key: "all", name: "The whole machine", title: "A machine that guesses the next word",
      text: `<p>A Transformer does one thing. It reads a piece of text and guesses what comes next.</p>
        <p>Read the drawing <b>from the bottom up</b>: words go in at the bottom, the guess comes out at the top. Press <b>Play</b>, or click any block.</p>
        <p class="tx-fine">The drawing shows the form used by the GPT models (a "decoder-only" Transformer). The original design, in
          <a href="${PAPER}">Attention Is All You Need</a> (2017), had two such towers: one to read a sentence, one to write its translation.</p>` },
    { key: "tokens", name: "Tokens" }, { key: "embed", name: "Embedding" }, { key: "attn", name: "Attention" }, { key: "mlp", name: "MLPs" },
    { key: "stream", name: "The stream" }, { key: "out", name: "The guess" }, { key: "loop", name: "Again" },
  ];
  // Which parts of the drawing are lit at each step
  const LIT = {
    tokens: ["tokens"], embed: ["tokens", "to-embed", "embed"], attn: ["attn", "plus1"], mlp: ["mlp", "plus2"],
    stream: ["stream", "plus1", "plus2", "block"], out: ["vectors", "to-out", "out"], loop: ["out", "loop", "tokens"],
  };

  // Drawing helpers (SVG, viewBox 560 × 596)
  const head = (x, y, dir) => {            // arrowhead pointing up, right or down, with its tip at (x, y)
    const p = { up: [[-5, 9], [5, 9]], right: [[-9, -5], [-9, 5]], left: [[9, -5], [9, 5]] }[dir];
    return `<polygon class="head" points="${x},${y} ${p.map(([a, b]) => `${x + a},${y + b}`).join(" ")}"/>`;
  };
  const wire = (d, hx, hy, dir) => `<path class="wire" d="${d}"/>${head(hx, hy, dir)}`;
  const box = (x, y, w, h, title, sub) => `<rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>` +
    (sub ? `<text class="t-title" x="${x + w / 2}" y="${y + h / 2 - 3}">${title}</text><text class="t-sub" x="${x + w / 2}" y="${y + h / 2 + 16}">${sub}</text>`
         : `<text class="t-plain" x="${x + w / 2}" y="${y + h / 2 + 6}">${title}</text>`);
  const plus = (y) => `<circle class="plus" cx="${SX}" cy="${y}" r="12"/><path class="plus-x" d="M${SX - 6} ${y}H${SX + 6}M${SX} ${y - 6}V${y + 6}"/>`;
  const g = (part, step, inner) => `<g data-part="${part}" data-step="${step}">${inner}</g>`;

  const svg = `<svg class="tx-svg" viewBox="0 0 560 596" role="img" aria-label="Diagram of a Transformer, read from the bottom up">
    ${g("block", 5, `<rect class="dashed" x="24" y="140" width="512" height="312" rx="12"/><text class="t-l" x="470" y="170">× L</text>`)}
    ${g("stream", 5, `<path class="stream" d="M${SX} 468V124"/><polygon class="stream-head" points="${SX},118 ${SX - 7},130 ${SX + 7},130"/>`)}
    ${g("attn", 3, wire(`M${SX} 422H185V398`, 185, 393, "up") + wire(`M185 336V312H${SX - 20}`, SX - 13, 312, "right") + box(40, 336, 290, 56, "Causal self-attention", "mixes across tokens"))}
    ${g("plus1", 5, plus(312))}
    ${g("mlp", 4, wire(`M${SX} 282H185V258`, 185, 253, "up") + wire(`M185 196V172H${SX - 20}`, SX - 13, 172, "right") + box(40, 196, 290, 56, "MLPs", "act on each token"))}
    ${g("plus2", 5, plus(172))}
    ${g("vectors", 6, `<text class="t-sub" x="40" y="80" style="text-anchor:start">one vector per token</text>` +
      WORDS.map((_, i) => `<rect class="vec${i === 4 ? " last" : ""}" x="${cx(i) - 13}" y="90" width="26" height="26" rx="5"/>`).join(""))}
    ${g("to-out", 6, wire(`M${SX} 90V68`, SX, 62, "up"))}
    ${g("out", 6, box(40, 14, 480, 46, `Linear classifier → next token: <tspan class="guess">?</tspan>`))}
    ${g("embed", 2, box(40, 468, 480, 44, "Embedding + position"))}
    ${g("to-embed", 2, WORDS.map((_, i) => wire(`M${cx(i)} 542V520`, cx(i), 514, "up")).join(""))}
    ${g("tokens", 1, WORDS.map((w, i) => `<rect class="tok" x="${cx(i) - 35}" y="542" width="70" height="38" rx="8"/><text class="t-plain" x="${cx(i)}" y="567">${w}</text>`).join(""))}
    ${g("loop", 7, `<path class="wire" d="M520 37H548V561H526"/>${head(521, 561, "left")}
      <rect class="tok new" x="450" y="542" width="70" height="38" rx="8"/><text class="t-plain t-new" x="485" y="567">mat</text>`)}
  </svg>`;

  // Scenes: one wordless animated drawing per step (viewBox 440 × 320). Everything is drawn in its final state and
  // enters with a delay (--d, in seconds), so the scene plays like a short film, once.
  const COL = ["var(--muted)", "var(--work)", "var(--k2)", "var(--k4)", "var(--accent)"];   // one colour per token
  const d = (t) => `--d:${t.toFixed(2)}s`;
  const tk = (x, y, w, label, cls = "", style = "", h = 36) =>
    `<g class="s-tok ${cls}" style="${style}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/><text x="${x + w / 2}" y="${y + h / 2 + 5.5}">${label}</text></g>`;
  const cell = (x, y, w, h, color, op, cls, style) => `<rect class="s-cell ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" style="fill:${color};fill-opacity:${op};${style}"/>`;
  const SHADE = [[.9, .35, .6, .2, .75, .45], [.3, .85, .5, .95, .25, .6], [.6, .2, .9, .4, .7, .3], [.45, .7, .25, .8, .35, .9], [.8, .5, .3, .65, .95, .2]];
  const SCENES = {
    // 1. The sentence is one strip; cuts fall between the words, the pieces move apart, and an empty slot waits
    tokens: () => {
      const X = (i) => 14 + i * 70;
      return WORDS.map((w, i) => tk(X(i), 140, 64, w, "slide late", `--dx:${42 - 6 * i}px;${d(1.5)}`, 44)).join("") +
        `<rect class="s-whole out" x="56" y="140" width="320" height="44" rx="9" style="${d(1.3)}"/>` +
        [1, 2, 3, 4].map((i) => `<path class="s-cut pop out2" d="M${56 + 64 * i} 118V206" style="${d(.3 + .2 * i)}"/>`).join("") +
        tk(X(5), 140, 64, "?", "ask pop", d(2.8), 44);
    },
    // 2. Left: the embedding matrix, one row of numbers (a vector) per token of the vocabulary. For each token of the
    // sentence, in order, its row is picked and copied out; then the vector of its position (right: the position
    // matrix, one vector per position) is added. Everything flows from left to right. Tokens are named once only.
    embed: () => {
      const VOCAB = ["the", "cat", "sat", "on", "mat", "dog", "…"], VC = [COL[4], COL[1], COL[2], COL[3], COL[0], COL[0], COL[0]];
      const yv = (r) => 44 + r * 34, ys = (i) => 44 + i * 56, row = (x, y, color, sh, w, cls = "", style = "") =>
        sh.slice(0, 5).map((o, k) => cell(x + k * (w + 1), y, w, 18, color, o, cls, style)).join("");
      return `<rect class="s-mat" x="6" y="${yv(0) - 8}" width="118" height="${34 * 7 + 2}" rx="8"/><rect class="s-mat pos" x="366" y="${ys(0) - 8}" width="70" height="${56 * 4 + 34}" rx="8"/>` +
        VOCAB.map((w, r) => tk(12, yv(r), 40, w, "tiny", "", 18) + row(58, yv(r), VC[r], SHADE[r % 5], 11)).join("") +
        WORDS.map((w, i) => { const r = VOCAB.indexOf(w), t = .4 + i * .8, y = ys(i);
          return `<circle class="s-pos" cx="380" cy="${y + 9}" r="9"/><text class="s-num sm" x="380" y="${y + 13.5}">${i + 1}</text>` + row(394, y, "var(--year)", SHADE[(i + 2) % 5], 7) +
            `<rect class="s-sel pop out3" x="9" y="${yv(r) - 3}" width="112" height="24" rx="6" style="stroke:${VC[r]};${d(t)};--o:${(t + .8).toFixed(2)}s"/>
             <path class="s-line draw" pathLength="1" d="M124 ${yv(r) + 9}C144 ${yv(r) + 9} 136 ${y + 9} 156 ${y + 9}" style="stroke:${VC[r]};stroke-width:2.2;${d(t + .1)}"/>` +
            row(160, y, VC[r], SHADE[r % 5], 13, "pop", d(t + .35)) +
            `<path class="s-plus pop" d="M240 ${y + 9}h12M246 ${y + 3}v12" style="${d(t + .5)}"/>` +
            row(264, y, "var(--year)", SHADE[(i + 2) % 5], 11, "pop", d(t + .7)) +
            `<path class="s-line draw" pathLength="1" d="M330 ${y + 9}H366" style="stroke:var(--year);stroke-width:2.2;${d(t + .55)}"/>
             <rect class="s-frame fade" x="155" y="${y - 5}" width="174" height="28" rx="7" style="${d(4.6)}"/>`; }).join("");
    },
    // 3. Every token reaches back to itself and to every token before it, never forward. Bottom: the arcs, token by
    // token. Top: the same thing as a grid, one row per token that looks, one column per token looked at; the upper
    // half (the future) stays crossed out. Stronger colour and thicker arc = it takes more from that token.
    attn: () => {
      const X = (i) => 60 + i * 80, t = (j) => .4 + j, gx = (i) => 176 + i * 25, gy = (j) => 12 + j * 25;
      const WT = [[1], [.45, .9], [.3, .85, .6], [.2, .5, .9, .55], [.2, .7, .95, .6, .4]];
      return WORDS.map((w, i) => tk(X(i) - 30, 276, 60, w, "hue", `--c:${COL[i]}`, 32) + tk(124, gy(i), 44, w, "tiny hue", `--c:${COL[i]}`, 21)).join("") +
        WT.map((ws, j) => ws.map((wt, i) => cell(gx(i), gy(j), 22, 21, COL[i], .25 + .75 * wt, "pop", d(t(j) + .12 * i)) +
          (i < j ? `<path class="s-arc draw" pathLength="1" d="M${X(j) - 8} 274Q${(X(i) + X(j)) / 2} ${274 - 50 - 38 * (j - i)} ${X(i) + 8} 274" style="stroke:${COL[i]};stroke-width:${(1.5 + 4.5 * wt).toFixed(1)};${d(t(j) + .12 * i)}"/>` : "")).join("") +
          [1, 2, 3, 4].filter((i) => i > j).map((i) => `<g class="s-fut fade" style="${d(5.2)}"><rect x="${gx(i)}" y="${gy(j)}" width="22" height="21" rx="3"/><path d="M${gx(i) + 7} ${gy(j) + 6.5}l8 8m0 -8l-8 8"/></g>`).join("")).join("");
    },
    // 4. Token by token: each token's vector goes up through its own copy of the same small network and comes out
    // changed. The columns never touch (the dashed walls): here no information passes between tokens.
    mlp: () => WORDS.map((w, i) => { const x = 50 + i * 85, L = [[186, [x - 12, x + 12]], [157, [x - 19, x, x + 19]], [128, [x - 12, x + 12]]];
      const links = (a, b, t) => a[1].flatMap((xa) => b[1].map((xb) => `<path class="s-link" d="M${xa} ${a[0]}L${xb} ${b[0]}" style="${d(t)}"/>`)).join("");
      return (i ? `<path class="s-wall" d="M${x - 42.5} 16V314"/>` : "") + tk(x - 30, 288, 60, w, "small", "", 28) +
        SHADE[i].slice(0, 4).map((o, k) => cell(x - 14, 226 + k * 14, 28, 12, COL[i], o, "", "")).join("") +
        `<path class="s-line draw go" pathLength="1" d="M${x} 222V206" style="${d(.2)}"/><rect class="s-net" x="${x - 32}" y="110" width="64" height="94" rx="11"/>` +
        links(L[0], L[1], .7) + links(L[1], L[2], 1.3) +
        L.map(([y, xs], l) => xs.map((nx) => `<circle class="s-node" cx="${nx}" cy="${y}" r="7" style="${d(.5 + l * .6)}"/>`).join("")).join("") +
        `<path class="s-line draw go" pathLength="1" d="M${x} 108V92" style="${d(2.2)}"/>` +
        SHADE[(i + 2) % 5].slice(0, 4).map((o, k) => cell(x - 14, 30 + k * 14, 28, 12, COL[(i + 2) % 5], o, "pop", d(2.5 + .1 * (3 - k)))).join(""); }).join(""),
    // 5. Layers stacked one above the other; each adds its part to the line that runs up, and the vector fills in
    stream: () => {
      const Y = (k) => 258 - k * 40;
      return `<path class="s-stream" d="M286 304V34"/><polygon class="s-stream-head" points="286,24 278,38 294,38"/>` +
        [0, 1, 2, 3, 4, 5].map((k) => `<g class="s-layer" style="${d(.5 + k * .6)}"><rect x="50" y="${Y(k)}" width="180" height="30" rx="7"/>
            <rect class="in" x="62" y="${Y(k) + 8}" width="92" height="14" rx="4"/><rect class="in" x="162" y="${Y(k) + 8}" width="56" height="14" rx="4"/></g>
          <path class="s-line draw" pathLength="1" d="M230 ${Y(k) + 15}H272" style="${d(.7 + k * .6)}"/>
          <g class="s-add" style="${d(.9 + k * .6)}"><circle cx="286" cy="${Y(k) + 15}" r="11"/><path d="M280 ${Y(k) + 15}h12M286 ${Y(k) + 9}v12"/></g>` +
          `<g class="pop" style="${d(1.1 + k * .6)}"><rect class="s-slot" x="330" y="${Y(k)}" width="86" height="30" rx="6"/>` +
            WORDS.map((_, i) => cell(337 + i * 15, Y(k) + 6, 12, 18, COL[i], SHADE[(i + k) % 5][k], "", "")).join("") + `</g>`).join("") +
        `<text class="s-big" x="26" y="182">× L</text>
         <circle class="s-dot" r="6" style="fill:var(--accent)"><animateMotion dur="3.6s" repeatCount="indefinite" path="M286 304V34"/></circle>`;
    },
    // 6. The last vector is turned into odds for the candidate tokens (longer bar = more likely); one is picked
    out: () => {
      const C = [["mat", 150], ["floor", 39], ["sofa", 25], ["roof", 12], ["…", 30]], Y = (r) => 42 + r * 50, ty = (i) => 50 + i * 50;
      return WORDS.map((w, i) => `<g${i < 4 ? ` class="s-rest"` : ""}>${tk(8, ty(i), 46, w, i === 4 ? "tiny win" : "tiny", "", 24)}` +
          SHADE[i].slice(0, 4).map((o, k) => cell(60 + k * 13, ty(i) + 3, 11, 18, COL[i], o, "", "")).join("") + `</g>`).join("") +
        `<rect class="s-pick fade" x="3" y="${ty(4) - 6}" width="114" height="36" rx="9" style="stroke:var(--accent);${d(.3)}"/>` +
        C.map(([w, len], r) => `<path class="s-line draw" pathLength="1" d="M118 ${ty(4) + 12}C150 ${ty(4) + 12} 146 ${Y(r) + 17} 176 ${Y(r) + 17}" style="${d(.9 + .15 * r)}"/>` +
          tk(180, Y(r), 62, w, r ? "" : "win", "", 34) + `<rect class="s-bar grow${r ? "" : " win"}" x="252" y="${Y(r) + 6}" width="${len}" height="22" rx="11" style="${d(1.7 + .2 * r)}"/>`).join("") +
        `<rect class="s-pick pop" x="172" y="${Y(0) - 7}" width="240" height="48" rx="12" style="${d(3.6)}"/>`;
    },
    // 7. The picked token joins the text and the machine runs again: the sentence grows one token at a time
    loop: () => {
      const X = (i) => 12 + i * 53, NEW = ["mat", "and", "slept"];
      return `<g class="s-spin"><path d="M196 62a26 26 0 1 1 10 20"/><polygon points="196,62 186,74 204,76"/></g>` +
        WORDS.map((w, i) => tk(X(i), 150, 47, w, "small")).join("") +
        NEW.map((w, j) => tk(X(5 + j), 150, 47, "?", "ask small pop out3", `${d(.4 + 1.6 * j)};--o:${(1.4 + 1.6 * j).toFixed(2)}s`) +
          tk(X(5 + j), 150, 47, w, "new small pop", d(1.5 + 1.6 * j))).join("") +
        `<path class="s-line flow" d="M220 108V136"/>`;
    },
  };
  const scene = (key) => `<svg class="tx-scene" viewBox="0 0 440 320" role="img" aria-label="Animated drawing of this step">${SCENES[key]()}</svg>`;

  $("tx-body").innerHTML = `
    <header class="about-hero tx-hero">
      <div class="about-id">
        <h2 id="tx-title">Inside a Transformer</h2>
        <p class="about-tag">The machine inside every model on this timeline, one block at a time.</p>
      </div>
    </header>
    <div class="tx-cols">
      <div class="tx-stage">${svg}</div>
      <div class="tx-talk">
        <ol class="tx-steps">${STEPS.map((s, i) => `<li><button type="button" data-go="${i}">${i ? i + ". " : ""}${s.name}</button></li>`).join("")}</ol>
        <div id="tx-text" class="tx-text" aria-live="polite"></div>
        <div class="tx-nav">
          <button type="button" id="tx-prev">← Back</button>
          <button type="button" id="tx-play" class="go">▶ Play</button>
          <button type="button" id="tx-next">Next →</button>
        </div>
      </div>
    </div>`;

  const dlg = $("tx"), stage = dlg.querySelector(".tx-svg"), parts = [...stage.querySelectorAll("[data-part]")];
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let step = 0, timer = 0;

  function show(i) {
    step = Math.max(0, Math.min(STEPS.length - 1, i));
    const s = STEPS[step], lit = LIT[s.key];
    stage.classList.toggle("stepped", !!lit);
    parts.forEach((p) => p.classList.toggle("on", !lit || lit.includes(p.dataset.part)));
    stage.dataset.step = s.key;
    stage.querySelector(".guess").textContent = step >= 6 ? "mat" : "?";
    dlg.querySelectorAll("[data-go]").forEach((b) => b.setAttribute("aria-current", +b.dataset.go === step ? "step" : "false"));
    const text = $("tx-text");
    if (s.text) {
      text.innerHTML = `<h3>${s.title}</h3>${s.text}`;
      text.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });
    } else text.innerHTML = scene(s.key);
    text.classList.remove("in"); void text.offsetWidth; text.classList.add("in");   // restart the entrance
    $("tx-prev").disabled = step === 0;
    $("tx-next").disabled = step === STEPS.length - 1;
    if (timer) queue();
  }
  // How long the current step needs while playing: until its last one-shot animation ends, plus a pause. The text
  // step gets a fixed reading time. (Looping decorations, like flowing wires, are endless and do not count.)
  function stepTime() {
    if (STEPS[step].text) return 6000;
    let end = 0;
    for (const a of ($("tx-text").getAnimations ? $("tx-text").getAnimations({ subtree: true }) : [])) {
      const t = a.effect.getComputedTiming().endTime;
      if (Number.isFinite(t)) end = Math.max(end, t);
    }
    return (end || 4500) + 1300;
  }
  function queue() {
    clearTimeout(timer);
    timer = setTimeout(() => { if (step === STEPS.length - 1) play(false); else show(step + 1); }, stepTime());
  }
  function play(on) {
    clearTimeout(timer); timer = 0;
    if (on) queue();
    $("tx-play").textContent = on ? "❚❚ Pause" : "▶ Play";
    $("tx-play").setAttribute("aria-pressed", on);
  }
  const manual = (i) => { play(false); show(i); };

  $("tx-prev").addEventListener("click", () => manual(step - 1));
  $("tx-next").addEventListener("click", () => manual(step + 1));
  $("tx-play").addEventListener("click", () => { if (timer) play(false); else { show(step === STEPS.length - 1 ? 0 : step + 1); play(true); } });
  dlg.addEventListener("click", (ev) => {
    const go = ev.target.closest("[data-go]"), part = ev.target.closest("[data-part]");
    if (go) manual(+go.dataset.go);
    else if (part) manual(+part.dataset.step);
    else if (ev.target === dlg) dlg.close();          // click outside the panel
  });
  dlg.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") { manual(step + 1); ev.preventDefault(); }
    if (ev.key === "ArrowLeft") { manual(step - 1); ev.preventDefault(); }
  });
  dlg.addEventListener("close", () => play(false));
  $("tx-close").addEventListener("click", () => dlg.close());
  document.querySelectorAll("[data-tx]").forEach((b) => b.addEventListener("click", () => { show(0); dlg.showModal(); if (still.matches) play(false); }));
  show(0);
}
