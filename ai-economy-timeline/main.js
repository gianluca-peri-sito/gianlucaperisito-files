const $ = (id) => document.getElementById(id);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parseDate = (d) => { const [m, y] = d.split("/"); return { month: MONTHS[m - 1], year: y }; };
const esc = (s) => s.replace(/<[^>]+>/g, "").replace(/"/g, "&quot;");

// Thumbnail: a local image if given, otherwise a drawn card. Clickable when there is a link.
function thumbCard(t) {
  if (t.kind === "paper") return `<div class="thumb paper">
      <div class="p-title">${t.title}</div><div class="p-auth">${t.authors}</div>
      <div class="p-lines">${"<i></i>".repeat(7)}</div><div class="p-venue">${t.venue}</div></div>`;
  if (t.kind === "product") return `<div class="thumb product">
      <div class="p-bar"><span></span><span></span><span></span><b>${t.name}</b></div>
      ${t.code ? `<pre>${t.lines.join("\n")}</pre>`
               : `<div class="msg user">${t.lines[0]}</div><div class="msg bot">${t.lines[1]}</div>`}</div>`;
  if (t.kind === "org") return `<div class="thumb org"><span class="mono">${t.mono}</span><span class="cap">${t.name}</span></div>`;
  return `<div class="thumb milestone"><span class="big">${t.big}</span><span class="cap">${t.caption}</span></div>`;
}

function thumbnail(e) {
  const inner = e.img ? `<img class="thumb" src="${e.img}" alt="">` : thumbCard(e.thumb);
  return e.link
    ? `<a class="thumb-link" href="${e.link}" aria-label="Open source for: ${esc(e.title)}">${inner}<span class="go">Open ↗</span></a>`
    : `<div class="thumb-link nolink">${inner}<span class="go">Link to add</span></div>`;
}

// Marker for results that let AI be applied in the economy as a working agent (`work: true` in data.js)
const BOLT = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.4.8 2.8 9.3h4L5.9 15.2l7.3-9H8.9z"/></svg>`;
// A drawn chat with a reasoning model (`mock` in data.js): the question, the model's thinking, then its answer.
// It is an illustration, not a screenshot, and the caption says so.
const mockChat = (m) => `<figure class="mock">
    <div class="mock-chat">
      <p class="mock-user">${m.prompt}</p>
      <div class="mock-think"><span>Thinking</span><ol>${m.thinking.map((t) => `<li>${t}</li>`).join("")}</ol></div>
      <p class="mock-answer">${m.answer}</p>
    </div>
    <figcaption>${m.caption}</figcaption>
  </figure>`;
// Who made the point happen (`by` in data.js): one coloured tag per company or body, colours from MAKERS
const byTags = (e) => (e.by || []).map((n) => `<span class="by-tag" style="--c:${MAKERS[n]}">${n}</span>`).join("");
const workTag = `<span class="work-tag" title="A result that lets AI be applied in the economy as a working agent">${BOLT}Puts AI to work</span>`;

// A large picture under the text (screenshot, chart), shown whole
const shot = (f) => `
  <a class="shot${f.tall ? " tall" : ""}" href="${f.link}"><img src="${f.img}" alt="${esc(f.caption)}"><span>${f.caption}</span></a>`;

const text = (p) => `
  <h2>${p.title}</h2>
  ${p.body ? `<p>${p.body}</p>` : ""}
  ${p.list ? `<div class="quotes"><h3>${p.list.title}</h3><ul>${p.list.items.map((x) => Array.isArray(x)
      ? `<li class="qa"><span class="q-in">${x[0]}</span><span class="q-out">${x[1]}</span></li>` : `<li>${x}</li>`).join("")}</ul>
    ${p.list.note ? `<p class="q-note">${p.list.note}</p>` : ""}</div>` : ""}
  ${p.sources ? `<p class="srcs"><span>Sources</span>${p.sources}</p>` : ""}`;

// Render the timeline, grouped by year. Every month from the first event to the last is on the rail: a month with
// events shows them as cards hanging off nodes, a month without events is a little dot, so the
// distance between two points shows the time that passed. Events and ticks are the "stops" the page scrolls through.
const ym = (e) => { const [m, y] = e.date.split("/"); return `${y}-${m}`; };        // "2023-09"
const years = [];
{
  const byMonth = {};
  EVENTS.forEach((e, i) => (byMonth[ym(e)] ||= []).push(i));
  const [y0, m0] = ym(EVENTS[0]).split("-").map(Number), [y1, m1] = ym(EVENTS.at(-1)).split("-").map(Number);
  for (let y = y0; y <= y1; y++) {
    const stops = [];
    for (let m = y === y0 ? m0 : 1; m <= (y === y1 ? m1 : 12); m++) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      if (byMonth[key]) byMonth[key].forEach((i) => stops.push({ i })); else stops.push({ key, month: MONTHS[m - 1] });
    }
    years.push({ year: y, stops });
  }
}

$("timeline").innerHTML = years.map((y) => `
  <section class="year" id="y${y.year}">
    <div class="year-num">${y.year}</div>
    <div class="events">${y.stops.map((s) => {
      if (s.key) return `<div class="tick" data-key="${s.key}" title="${s.month} ${y.year}"></div>`;
      const i = s.i, e = EVENTS[i];
      const anyWork = e.work || (e.split || []).some((p) => p.work);
      const meta = `<div class="meta"><span class="month">${parseDate(e.date).month}</span>${byTags(e)}${e.work ? workTag : ""}</div>`;
      let inner;
      if (e.split) {
        // One node on the rail that forks into two results side by side; pictures on top so they line up
        inner = `<div class="branches">${e.split.map((p) => `
          <div class="branch">${thumbnail(p)}<div class="text">${p.work && !e.work ? workTag : ""}${text(p)}</div></div>`).join("")}
        </div>`;
      } else if (e.mock) {
        inner = `<div class="text">${text(e).replace(/(<p class="srcs")/, `${mockChat(e.mock)}$1`)}</div>`;
      } else if (e.figure) {
        inner = `<div class="text">${text(e).replace(/(<p class="srcs")/, `${shot(e.figure)}$1`)}</div>`;
      } else {
        inner = `<div class="main"><div class="text">${text(e)}</div>${thumbnail(e)}</div>`;
      }
      return `
      <article class="event${e.split ? " split" : ""}${anyWork ? " work" : ""}" data-i="${i}" data-key="${ym(e)}">
        <div class="card">${meta}${inner}</div>
      </article>`;
    }).join("")}</div>
  </section>`).join("");

// Mini timeline in the strip at the bottom: the whole timeline at once, laid out by date, one dot per event.
// Dots of the same month stack upwards. It fills in like the rail, and a click on a dot jumps to that event.
const MINI_Y0 = 2017, MINI_Y1 = 2026, MINI_MONTHS = (MINI_Y1 - MINI_Y0 + 1) * 12;
const miniPosKey = (key) => { const [yr, mo] = key.split("-").map(Number); return ((yr - MINI_Y0) * 12 + mo - 0.5) / MINI_MONTHS * 100; };
const miniPos = (e) => miniPosKey(ym(e));
{
  const rows = {};
  $("mini").firstElementChild.innerHTML = `<i class="mini-fill"></i>` +
    Array.from({ length: MINI_Y1 - MINI_Y0 + 1 }, (_, k) => `<span class="mini-year" style="left:${k * 1200 / MINI_MONTHS}%">${MINI_Y0 + k}</span>`).join("") +
    EVENTS.map((e, i) => {
      const row = rows[e.date] = (rows[e.date] ?? -1) + 1;
      const work = e.work || (e.split || []).some((p) => p.work), { month, year } = parseDate(e.date);
      return `<button type="button" class="mini-dot${work ? " work" : ""}" data-i="${i}" style="left:${miniPos(e).toFixed(2)}%;--row:${row}"
        data-when="${month} ${year}" data-title="${esc(e.split ? e.split.map((p) => p.title).join(" · ") : e.title)}"
        aria-label="${month} ${year}: ${esc((e.split ? e.split[0] : e).title)}"></button>`;
    }).join("");
  $("mini").addEventListener("click", (ev) => {
    const b = ev.target.closest(".mini-dot");
    if (b) document.querySelector(`.event[data-i="${b.dataset.i}"]`).scrollIntoView({ block: "center", behavior: "smooth" });
  });
  // Hovering (or focusing) a dot shows its date and title at once, in a label above it kept inside the window
  const tip = $("mini-tip");
  const showTip = (b) => {
    tip.innerHTML = `<b>${b.dataset.when}</b>${b.dataset.title}`;
    tip.hidden = false;
    const r = b.getBoundingClientRect(), host = $("mini").getBoundingClientRect(), w = tip.offsetWidth;
    const x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    tip.style.left = `${x - host.left}px`;
    tip.style.bottom = `${host.bottom - r.top + 10}px`;
  };
  $("mini").addEventListener("mouseover", (ev) => { const b = ev.target.closest(".mini-dot"); if (b) showTip(b); else tip.hidden = true; });
  $("mini").addEventListener("mouseleave", () => { tip.hidden = true; });
  $("mini").addEventListener("focusin", (ev) => { const b = ev.target.closest(".mini-dot"); if (b) showTip(b); });
  $("mini").addEventListener("focusout", () => { tip.hidden = true; });
}

document.querySelectorAll(".author").forEach((el) => { el.textContent = AUTHOR; });

// "About the author" pane: a large panel in the middle of the screen. The header is in the University of Florence's
// blue, with the university's logo.
const R_ICONS = [
  `<path d="M3 17l5-5 4 3 8-9"/><path d="M15 6h5v5"/>`,                                                   // market
  `<path d="M4 20V11M9 20V4M14 20v-7M19 20V8"/>`,                                                          // spectrum
  `<path class="f" d="M12 5 4.5 18.5h15z"/><circle class="d" cx="12" cy="5" r="2.2"/><circle class="d" cx="4.5" cy="18.5" r="2.2"/><circle class="d" cx="19.5" cy="18.5" r="2.2"/>`,  // hyperedge
  `<path d="M4 18c4 0 3-6 7-6s3-6 9-6" stroke-dasharray="2.5 3"/><circle class="d" cx="4" cy="18" r="2"/><circle class="d" cx="20" cy="6" r="2.6"/>`,  // walker
];
const R_COLORS = ["--k3", "--k4", "--k2", "--k1"];
$("about-body").innerHTML = `
  <header class="about-hero">
    <div class="about-id">
      <p class="eyebrow">About the author</p>
      <h2 id="about-name">${AUTHOR}</h2>
      <p class="about-role">${ABOUT.role}</p>
    </div>
    <img class="about-uni" src="img/unifi-logo.svg" alt="Università degli Studi di Firenze">
  </header>
  <div class="about-cols">
    <div class="about-side">
      <dl class="facts">${ABOUT.facts.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl>
      <ul class="about-links">${ABOUT.links.map(([t, url]) => `<li><a href="${url}">${t} ↗</a></li>`).join("")}</ul>
      <p class="about-mail"><span>${ABOUT.email}</span></p>
    </div>
    <div class="about-main">
      <h3>Research</h3>
      <ul class="themes">${ABOUT.research.map(([t, d], i) => `
        <li style="--c:var(${R_COLORS[i % 4]})"><svg viewBox="0 0 24 24" aria-hidden="true">${R_ICONS[i % 4]}</svg><strong>${t}</strong><span>${d}</span></li>`).join("")}</ul>
      <h3>Publications</h3>
      <ul class="pubs">${ABOUT.publications.map(([t, meta, url]) => { const [yr, venue] = meta.split(" · "); return `<li><b>${yr}</b><a href="${url}">${t}</a><span>${venue}</span></li>`; }).join("")}</ul>
    </div>
  </div>`;
const about = $("about");
document.querySelectorAll("[data-about]").forEach((b) => b.addEventListener("click", () => about.showModal()));
$("about-close").addEventListener("click", () => about.close());
about.addEventListener("click", (ev) => { if (ev.target === about) about.close(); });   // click outside the panel

// Search: type a few words, get the matching points, jump to one. Every word must appear somewhere in the point
// (title, texts, sources, date, flags). "/" focuses the box, arrows move, Enter jumps, Esc closes.
{
  const norm = (s) => s.replace(/<[^>]+>/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const FULL = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const index = EVENTS.flatMap((e, i) => (e.split || [e]).map((p) => {
    const { month, year } = parseDate(e.date), work = e.work || p.work;
    return {
      i, title: p.title, when: `${month} ${year}`, work, t: norm(p.title),
      all: norm([p.title, p.body, p.sources, p.list && p.list.items.flat().join(" "), p.figure && p.figure.caption, p.mock && [p.mock.prompt, p.mock.answer, ...p.mock.thinking].join(" "),
        month, FULL[e.date.split("/")[0] - 1], year, (e.by || []).join(" "),
        work ? "puts ai to work" : ""].filter(Boolean).join(" ")),
    };
  }));
  const q = $("q"), box = $("results");
  let hits = [], sel = 0;
  const close = () => { box.hidden = true; q.setAttribute("aria-expanded", "false"); };
  const jump = (h) => {
    if (!h) return;
    const el = document.querySelector(`.event[data-i="${h.i}"]`);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.classList.remove("found"); void el.offsetWidth; el.classList.add("found");   // restart the flash
    close(); q.blur();
  };
  const paint = () => {
    box.innerHTML = hits.length
      ? hits.map((h, k) => `<li role="option" data-k="${k}" aria-selected="${k === sel}"><span class="when">${h.when}</span><span class="what-title">${h.title}</span>${
          h.work ? `<i class="f-work" title="Puts AI to work"></i>` : ""}</li>`).join("")
      : `<li class="none">No point matches</li>`;
    box.hidden = false; q.setAttribute("aria-expanded", "true");
    box.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  };
  const run = () => {
    const words = norm(q.value).split(/\s+/).filter(Boolean);
    if (!words.length) return close();
    hits = index.filter((x) => words.every((w) => x.all.includes(w)));
    // points whose title matches come first; otherwise in order of time
    const inTitle = (x) => words.every((w) => x.t.includes(w));
    hits.sort((a, b) => inTitle(b) - inTitle(a) || a.i - b.i);
    sel = 0; paint();
  };
  q.addEventListener("input", run);
  q.addEventListener("focus", run);
  q.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { close(); q.blur(); return; }
    if (box.hidden || !hits.length) return;
    if (ev.key === "ArrowDown") { sel = (sel + 1) % hits.length; paint(); ev.preventDefault(); }
    if (ev.key === "ArrowUp") { sel = (sel - 1 + hits.length) % hits.length; paint(); ev.preventDefault(); }
    if (ev.key === "Enter") { jump(hits[sel]); ev.preventDefault(); }
  });
  box.addEventListener("mousedown", (ev) => { const li = ev.target.closest("[data-k]"); if (li) { ev.preventDefault(); jump(hits[+li.dataset.k]); } });
  document.addEventListener("mousedown", (ev) => { if (!$("search").contains(ev.target)) close(); });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && !$("about").open && !$("tx").open) { ev.preventDefault(); q.focus(); q.select(); }
  });
}

// Every external link opens in a new tab
document.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });

// Light / dark toggle. Defaults to the system setting; an explicit choice is remembered.
const root = document.documentElement;
const systemDark = matchMedia("(prefers-color-scheme: dark)");
const theme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
function syncToggle() {
  const dark = theme() === "dark";
  $("theme").setAttribute("aria-pressed", dark);
  $("theme").querySelector("span").textContent = dark ? "Dark" : "Light";
}
$("theme").addEventListener("click", () => {
  root.dataset.theme = theme() === "dark" ? "light" : "dark";
  try { localStorage.setItem("aiTimeline.theme", root.dataset.theme); } catch {}
  syncToggle();
});
systemDark.addEventListener("change", syncToggle);
syncToggle();

// The strip at the bottom (the mini timeline) can be hidden. The choice is remembered. Saved settings start with
// "aiTimeline." because, once online, every page on the same site shares one browser storage.
const dock = $("dock"), paneToggle = $("pane-toggle");
function setCollapsed(collapsed) {
  dock.classList.toggle("collapsed", collapsed);
  $("mini").inert = collapsed;
  paneToggle.setAttribute("aria-expanded", !collapsed);
  paneToggle.querySelector(".pt-text").textContent = collapsed ? "Show timeline" : "Hide timeline";
}
paneToggle.addEventListener("click", () => {
  const collapsed = !dock.classList.contains("collapsed");
  setCollapsed(collapsed);
  try { localStorage.setItem("aiTimeline.paneCollapsed", collapsed ? "1" : "0"); } catch {}
});
try { setCollapsed(localStorage.getItem("aiTimeline.paneCollapsed") === "1"); } catch { setCollapsed(false); }

// The strip can be resized: drag the grip on its top edge up or down (arrow keys when it is focused, double-click
// resets). Everything in the mini timeline is sized in em, so its height follows --mini-scale smoothly and the edge
// stays under the pointer. The size is remembered.
const mini = $("mini"), grip = $("pane-grip");
let miniScale = 1;
function setMiniScale(v, save) {
  miniScale = Math.max(0.7, Math.min(2.5, v));
  mini.style.setProperty("--mini-scale", miniScale.toFixed(3));
  if (save) { try { localStorage.setItem("aiTimeline.miniScale", miniScale.toFixed(3)); } catch {} }
}
grip.addEventListener("pointerdown", (ev) => {
  ev.preventDefault();
  try { grip.setPointerCapture(ev.pointerId); } catch {}
  dock.classList.add("resizing"); document.body.classList.add("pane-resizing");
  const startY = ev.clientY, startH = mini.offsetHeight, startScale = miniScale;
  let frame = 0, target = startScale;
  const move = (e) => {
    target = startScale * (startH + startY - e.clientY) / startH;   // the height grows with the scale
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; setMiniScale(target); });
  };
  const up = () => {
    grip.removeEventListener("pointermove", move);
    cancelAnimationFrame(frame);
    setMiniScale(target, true);
    dock.classList.remove("resizing"); document.body.classList.remove("pane-resizing");
    update();
  };
  grip.addEventListener("pointermove", move);
  grip.addEventListener("pointerup", up, { once: true });
  grip.addEventListener("pointercancel", up, { once: true });
});
grip.addEventListener("dblclick", () => { setMiniScale(1, true); update(); });
grip.addEventListener("keydown", (e) => {
  const to = { ArrowUp: miniScale + 0.1, ArrowDown: miniScale - 0.1, Home: 1 }[e.key];
  if (to !== undefined) { setMiniScale(to, true); update(); e.preventDefault(); }
});
try { setMiniScale(parseFloat(localStorage.getItem("aiTimeline.miniScale")) || 1); } catch { setMiniScale(1); }

// The stops of the rail, in order: events and the ticks of the months without events. The active stop is the last
// one whose top has scrolled above the middle of the free part of the window, i.e. the part the strip at the bottom
// does not cover (the whole window when the strip is hidden). The mini timeline fills in up to that stop's month.
const items = [...document.querySelectorAll(".event, .tick")];
let current = -1;
const miniDots = [...document.querySelectorAll(".mini-dot")], miniFill = document.querySelector(".mini-fill");

// Fill the rail from the top down to the marker of the stop in view
const railFill = document.createElement("div");
railFill.className = "rail-fill";
$("timeline").prepend(railFill);
function fillRail(idx) {
  const el = items[idx], top = el.getBoundingClientRect().top - $("timeline").getBoundingClientRect().top;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  // centre of the marker: 1.8rem down an event (see .event::before), the middle of a tick
  railFill.style.height = `${Math.max(0, top + (el.classList.contains("tick") ? el.offsetHeight / 2 : 1.8 * rem))}px`;
}

const freeHeight = () => window.innerHeight - (dock.classList.contains("collapsed") ? 0 : dock.offsetHeight);
function update() {
  if (dock.classList.contains("resizing")) return;   // while the strip is being dragged the page stays as it is
  const line = freeHeight() / 2;
  // jumps (search, mini timeline, links) centre their target in the free part too
  root.style.scrollPaddingBottom = `${window.innerHeight - freeHeight()}px`;
  let idx = 0;
  items.forEach((el, i) => { if (el.getBoundingClientRect().top < line) idx = i; });
  fillRail(idx);
  if (idx === current) return;
  current = idx;
  items.forEach((el, i) => { el.classList.toggle("active", i === idx); el.classList.toggle("past", i < idx); });
  const ev = items[idx].dataset.i === undefined ? -1 : +items[idx].dataset.i, key = items[idx].dataset.key;
  miniDots.forEach((el, i) => { el.classList.toggle("active", i === ev); el.classList.toggle("past", ev < 0 ? ym(EVENTS[i]) < key : i < ev); });
  miniFill.style.width = `${miniPosKey(key)}%`;
  document.querySelectorAll(".year").forEach((y) => {
    y.classList.toggle("has-active", !!y.querySelector(".active"));
    y.classList.toggle("past", !y.querySelector(".active") && !!y.querySelector(".past"));
  });
}

window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update);
// The strip being hidden or shown, or changing size, moves the middle of the free part
new ResizeObserver(() => requestAnimationFrame(update)).observe(dock);
new MutationObserver(update).observe(dock, { attributes: true, attributeFilter: ["class"] });
// A link ending in #y2023 opens at that year; a hash that names nothing is ignored
try { if (location.hash) $(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); } catch {}
update();
