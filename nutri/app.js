import { NUTRIENTS, KEYS, FOODS, findFood, parseLines, gramsFor, scale } from "./foods.js";
import { ACTIVITY, GOALS, DEFAULT_PROFILE, computeTargets } from "./goals.js";
import { analyze, prepareImage } from "./ai.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (v) => (Math.abs(v) < 10 ? (Math.round(v * 10) / 10).toLocaleString("ro-RO") : Math.round(v).toLocaleString("ro-RO"));
const MEALS = { breakfast: "Mic dejun", lunch: "Prânz", dinner: "Cină", snack: "Gustări" };
const MACRO_COLORS = { p: "var(--p)", c: "var(--c)", f: "var(--f)" };

// ---------- stocare locală ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("farfuria." + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("farfuria." + key, JSON.stringify(value)); } catch { /* stocare indisponibilă */ }
  },
};

let profile = { ...DEFAULT_PROFILE, ...store.get("profile", {}) };
let log = store.get("log", {});
let settings = { apiKey: "", model: "claude-opus-5-5", aiFallback: true, ...store.get("settings", {}) };
let day = isoDate(new Date());
let draft = [];
let photo = null;
const PHOTO_PLACEHOLDER = document.getElementById("photoPreview").innerHTML;

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function sumEntries(entries) {
  const t = Object.fromEntries(KEYS.map((k) => [k, 0]));
  for (const e of entries) { const s = scale(e.per100, e.grams); for (const k of KEYS) t[k] += s[k]; }
  return t;
}

// ---------- navigare ----------
function showTab(name) {
  for (const s of document.querySelectorAll("main > section")) s.hidden = s.id !== "tab-" + name;
  for (const b of document.querySelectorAll("nav.tabs button")) {
    if (b.dataset.tab === name) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  }
  document.querySelector(".datenav").style.visibility = name === "today" || name === "add" ? "visible" : "hidden";
  window.scrollTo(0, 0);
}
document.querySelectorAll("nav.tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

function shiftDay(delta) {
  const d = new Date(day + "T12:00:00");
  d.setDate(d.getDate() + delta);
  day = isoDate(d);
  renderToday();
}
$("prevDay").onclick = () => shiftDay(-1);
$("nextDay").onclick = () => shiftDay(1);

// ---------- jurnal ----------
function bar(label, value, target, color, isLimit) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const over = isLimit && value > target;
  const unit = NUTRIENTS.find((n) => n.label === label)?.unit || "g";
  return `<div class="macro"><div class="row"><span>${esc(label)}</span><span><b>${fmt(value)}</b> / ${fmt(target)} ${unit}${isLimit ? " max" : ""}</span></div>
    <div class="bar${over ? " over" : ""}"><i style="width:${pct}%;${color ? "background:" + color : ""}"></i></div></div>`;
}

function renderToday() {
  const today = isoDate(new Date());
  const yest = isoDate(new Date(Date.now() - 864e5));
  $("dateLabel").textContent = day === today ? "Azi" : day === yest ? "Ieri" : new Date(day + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

  const entries = log[day] || [];
  const tot = sumEntries(entries);
  const tg = computeTargets(profile);

  $("kcalEaten").textContent = fmt(tot.kcal);
  $("kcalTarget").textContent = `din ${fmt(tg.kcal)} kcal`;
  const C = 326.7;
  $("ringArc").style.strokeDashoffset = C * (1 - Math.min(1, tot.kcal / tg.kcal));
  $("ringArc").style.stroke = tot.kcal > tg.kcal * 1.05 ? "var(--warn)" : "var(--accent)";
  const left = tg.kcal - tot.kcal;
  $("kcalLeft").textContent = left >= 0 ? `Mai ai ${fmt(left)} kcal până la obiectiv (${GOALS[profile.goal].label.toLowerCase()}).` : `Ai depășit obiectivul cu ${fmt(-left)} kcal.`;

  $("macroBars").innerHTML = ["p", "c", "f"].map((k) => bar(NUTRIENTS.find((n) => n.k === k).label, tot[k], tg[k], MACRO_COLORS[k])).join("");
  $("microBars").innerHTML = NUTRIENTS.filter((n) => !n.macro).map((n) => bar(n.label, tot[n.k], tg[n.k], null, n.limit)).join("");

  $("meals").innerHTML = Object.entries(MEALS).map(([key, label]) => {
    const list = entries.filter((e) => e.meal === key);
    const mt = sumEntries(list);
    return `<div class="meal"><div class="meal-head"><span>${label}</span><span class="muted small">${list.length ? fmt(mt.kcal) + " kcal" : ""}</span></div>
      ${list.length ? list.map((e) => {
        const s = scale(e.per100, e.grams);
        return `<div class="entry"><div class="name">${esc(e.name)}<small>${fmt(e.grams)} g · ${fmt(s.kcal)} kcal · P ${fmt(s.p)} · C ${fmt(s.c)} · G ${fmt(s.f)}</small></div>
          <button class="icon-btn" data-del="${e.id}" aria-label="Șterge ${esc(e.name)}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`;
      }).join("") : `<div class="empty">Nimic adăugat.</div>`}</div>`;
  }).join("");
}
$("meals").addEventListener("click", (ev) => {
  const id = ev.target.closest("[data-del]")?.dataset.del;
  if (!id) return;
  log[day] = (log[day] || []).filter((e) => e.id !== id);
  store.set("log", log);
  renderToday();
});

// ---------- adăugare ----------
$("foodList").innerHTML = FOODS.map((f) => `<option value="${esc(f.name)}">`).join("");

function setMode(photoMode) {
  $("modeText").setAttribute("aria-pressed", !photoMode);
  $("modePhoto").setAttribute("aria-pressed", photoMode);
  $("paneText").hidden = photoMode;
  $("panePhoto").hidden = !photoMode;
}
$("modeText").onclick = () => setMode(false);
$("modePhoto").onclick = () => setMode(true);

function status(html) { $("addStatus").innerHTML = html; }
const busy = (text) => status(`<p class="small muted" style="margin:12px 0 0"><span class="spinner"></span> ${esc(text)}</p>`);
const fail = (err) => status(`<div class="err">${esc(err.message || err)}</div>`);

function guessMeal() {
  const h = new Date().getHours();
  return h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 21 ? "dinner" : "snack";
}

function aiItemsToDraft(items, src) {
  return items.map((it) => {
    const food = FOODS.find((f) => f.name === it.db_match);
    return { id: uid(), name: it.name, grams: Math.round(it.grams), per100: food ? food.per100 : it.per100, src, confidence: it.confidence, found: true };
  });
}

$("calcText").onclick = async () => {
  const lines = parseLines($("foodText").value);
  if (!lines.length) return fail("Scrie cel puțin un produs, de ex. „150 g orez fiert”.");
  status("");
  const items = [];
  const missing = [];
  for (const line of lines) {
    const food = findFood(line.text);
    if (food) items.push({ id: uid(), name: food.name, grams: Math.round(gramsFor(line, food)), per100: food.per100, src: "bază", found: true, query: line.text });
    else missing.push(line);
  }
  let notes = "";
  if (missing.length && settings.aiFallback && settings.apiKey) {
    busy(`Caut cu AI: ${missing.map((m) => m.text).join(", ")}…`);
    try {
      const res = await analyze({ apiKey: settings.apiKey, model: settings.model, text: missing.map((m) => (m.qty != null ? `${m.qty} ${m.unit || ""} ${m.text}` : m.text)).join("\n") });
      items.push(...aiItemsToDraft(res.items, "AI"));
      notes = res.notes;
      status("");
    } catch (e) { fail(e); missing.forEach((m) => items.push(unknownItem(m))); }
  } else {
    missing.forEach((m) => items.push(unknownItem(m)));
  }
  showDraft(items, notes);
};

function unknownItem(line) {
  return { id: uid(), name: line.text, grams: Math.round(gramsFor(line, null)), per100: Object.fromEntries(KEYS.map((k) => [k, 0])), src: "negăsit", found: false };
}

$("photoInput").onchange = async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    photo = await prepareImage(file);
    $("photoPreview").innerHTML = `<img src="${photo.dataUrl}" alt="Poza farfuriei"><div class="small muted" style="margin-top:8px">Atinge pentru altă poză</div>`;
    $("analyzePhoto").disabled = false;
    status("");
  } catch (e) { fail(e); }
};

$("analyzePhoto").onclick = async () => {
  if (!photo) return;
  $("analyzePhoto").disabled = true;
  busy("Analizez farfuria… (poate dura câteva secunde)");
  try {
    const res = await analyze({ apiKey: settings.apiKey, model: settings.model, imageB64: photo.b64, mediaType: photo.mediaType, hint: $("photoHint").value.trim() });
    status("");
    if (!res.items.length) return fail(res.notes || "Nu am găsit mâncare în poză.");
    showDraft(aiItemsToDraft(res.items, "foto"), res.notes);
  } catch (e) {
    fail(e);
  } finally {
    $("analyzePhoto").disabled = false;
  }
};

function showDraft(items, notes) {
  draft = items;
  $("draftCard").hidden = false;
  $("draftMeal").value = guessMeal();
  $("draftNotes").innerHTML = notes ? `<div class="note">${esc(notes)}</div>` : "";
  renderDraft();
  $("draftCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDraft() {
  $("draftItems").innerHTML = draft.map((it) => {
    const s = scale(it.per100, it.grams);
    const pill = it.found
      ? `<span class="pill">${esc(it.src)}${it.confidence ? " · încredere " + esc(it.confidence) : ""}</span>`
      : `<span class="pill warn">negăsit – alege din bază</span>`;
    return `<div class="draft-item" data-id="${it.id}">
      <div class="row" style="justify-content:space-between; margin-bottom:8px"><b class="grow">${esc(it.name)}</b>${pill}
        <button class="icon-btn" data-act="rm" aria-label="Elimină"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="row">
        <input type="number" min="0" step="1" value="${it.grams}" data-act="grams" aria-label="Grame" inputmode="decimal"><span class="muted small">g</span>
        <input type="text" class="grow" list="foodList" placeholder="Schimbă alimentul din bază…" data-act="swap" aria-label="Aliment din bază">
      </div>
      <div class="small muted" style="margin-top:6px">${fmt(s.kcal)} kcal · P ${fmt(s.p)} g · C ${fmt(s.c)} g · G ${fmt(s.f)} g</div>
    </div>`;
  }).join("");
  renderDraftTotals();
}

function renderDraftTotals() {
  const t = sumEntries(draft);
  $("draftTotals").innerHTML = [["kcal", "kcal"], ["p", "proteine"], ["c", "carbo"], ["f", "grăsimi"]]
    .map(([k, l]) => `<div><b>${fmt(t[k])}</b><span>${l}${k === "kcal" ? "" : " (g)"}</span></div>`).join("");
  $("draftMicro").innerHTML = NUTRIENTS.filter((n) => !n.macro).map((n) => `<span>${n.label}</span><span>${fmt(t[n.k])} ${n.unit}</span>`).join("");
  $("saveDraft").disabled = !draft.length;
}

$("draftItems").addEventListener("input", (ev) => {
  const el = ev.target;
  const it = draft.find((d) => d.id === el.closest(".draft-item")?.dataset.id);
  if (!it) return;
  if (el.dataset.act === "grams") {
    it.grams = Math.max(0, parseFloat(el.value) || 0);
    const s = scale(it.per100, it.grams);
    el.closest(".draft-item").querySelector(".small.muted:last-child").textContent = `${fmt(s.kcal)} kcal · P ${fmt(s.p)} g · C ${fmt(s.c)} g · G ${fmt(s.f)} g`;
    renderDraftTotals();
  } else if (el.dataset.act === "swap") {
    const food = FOODS.find((f) => f.name === el.value);
    if (food) Object.assign(it, { name: food.name, per100: food.per100, src: "bază", found: true, confidence: null }), renderDraft();
  }
});
$("draftItems").addEventListener("click", (ev) => {
  if (ev.target.closest("[data-act=rm]")) {
    const id = ev.target.closest(".draft-item").dataset.id;
    draft = draft.filter((d) => d.id !== id);
    renderDraft();
  }
});

$("saveDraft").onclick = () => {
  const missing = draft.filter((d) => !d.found);
  if (missing.length && !confirm(`${missing.length} produs(e) nu au valori nutriționale și vor conta ca 0. Continui?`)) return;
  const meal = $("draftMeal").value;
  log[day] = [...(log[day] || []), ...draft.filter((d) => d.grams > 0).map((d) => ({ id: uid(), meal, name: d.name, grams: d.grams, per100: d.per100, src: d.src }))];
  store.set("log", log);
  draft = [];
  $("draftCard").hidden = true;
  $("foodText").value = "";
  photo = null;
  $("photoInput").value = "";
  $("photoPreview").innerHTML = PHOTO_PLACEHOLDER;
  $("analyzePhoto").disabled = true;
  status("");
  renderToday();
  showTab("today");
};

// ---------- obiective ----------
$("pActivity").innerHTML = ACTIVITY.map((a) => `<option value="${a.v}">${a.label}</option>`).join("");
$("pGoal").innerHTML = Object.entries(GOALS).map(([k, g]) => `<option value="${k}">${g.label}</option>`).join("");

function renderGoals() {
  $("pSex").value = profile.sex; $("pAge").value = profile.age; $("pWeight").value = profile.weight; $("pHeight").value = profile.height;
  $("pActivity").value = profile.activity; $("pGoal").value = profile.goal; $("pCustom").checked = profile.custom;
  const tg = computeTargets(profile);
  for (const [id, k] of [["tKcal", "kcal"], ["tP", "p"], ["tC", "c"], ["tF", "f"]]) { $(id).value = tg[k]; $(id).disabled = !profile.custom; }
  const g = GOALS[profile.goal];
  $("goalExplain").textContent = profile.custom
    ? `Ținte setate manual. Pentru referință: metabolism bazal ${tg.bmr} kcal, consum zilnic estimat ${tg.tdee} kcal.`
    : `Metabolism bazal ${tg.bmr} kcal × activitate = ${tg.tdee} kcal/zi. ${g.kcalAdj ? (g.kcalAdj > 0 ? "+" : "") + g.kcalAdj + " kcal pentru " + g.label.toLowerCase() + ". " : ""}Proteine ${g.proteinPerKg} g/kg, grăsimi ~27% din calorii, restul carbohidrați.`;
}
function readGoals() {
  const num = (id, d) => { const v = parseFloat($(id).value); return Number.isFinite(v) && v > 0 ? v : d; };
  const wasCustom = profile.custom;
  profile = {
    ...profile,
    sex: $("pSex").value, age: num("pAge", profile.age), weight: num("pWeight", profile.weight), height: num("pHeight", profile.height),
    activity: parseFloat($("pActivity").value), goal: $("pGoal").value, custom: $("pCustom").checked,
  };
  if (profile.custom && wasCustom) Object.assign(profile, { kcal: num("tKcal", profile.kcal), p: num("tP", profile.p), c: num("tC", profile.c), f: num("tF", profile.f) });
  else if (profile.custom) { const t = computeTargets({ ...profile, custom: false }); Object.assign(profile, { kcal: t.kcal, p: t.p, c: t.c, f: t.f }); }
  store.set("profile", profile);
  renderGoals();
  renderToday();
}
document.querySelectorAll("#tab-goals input, #tab-goals select").forEach((el) => el.addEventListener("change", readGoals));

// ---------- setări ----------
$("apiKey").value = settings.apiKey;
$("model").value = settings.model;
$("aiFallback").checked = settings.aiFallback;
const saveSettings = () => {
  settings = { apiKey: $("apiKey").value.trim(), model: $("model").value, aiFallback: $("aiFallback").checked };
  store.set("settings", settings);
};
["apiKey", "model", "aiFallback"].forEach((id) => $(id).addEventListener("change", saveSettings));

$("exportData").onclick = () => {
  const blob = new Blob([JSON.stringify({ profile, log }, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `farfuria-${isoDate(new Date())}.json` });
  a.click();
  URL.revokeObjectURL(a.href);
};
$("importData").onchange = async (ev) => {
  try {
    const data = JSON.parse(await ev.target.files[0].text());
    if (data.profile) profile = { ...DEFAULT_PROFILE, ...data.profile };
    if (data.log) log = data.log;
    store.set("profile", profile); store.set("log", log);
    renderGoals(); renderToday();
    alert("Date importate.");
  } catch { alert("Fișierul nu este valid."); }
};
$("clearData").onclick = () => {
  if (!confirm("Ștergi jurnalul și profilul de pe acest dispozitiv?")) return;
  log = {}; profile = { ...DEFAULT_PROFILE };
  store.set("log", log); store.set("profile", profile);
  renderGoals(); renderToday();
};

// ---------- pornire ----------
renderGoals();
renderToday();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
