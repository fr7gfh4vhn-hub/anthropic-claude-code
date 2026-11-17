// Analiză cu Claude: poze ale farfuriei sau text liber -> alimente, gramaje și valori nutriționale.
//
// Pentru poze, acuratețea vine din patru lucruri:
//  1. mai multe unghiuri (de sus + din lateral) ca să se vadă și înălțimea porției;
//  2. un reper de scară (diametrul farfuriei, tacâm, card bancar 8,56 cm);
//  3. estimare explicită: dimensiuni -> volum (ml) -> densitate -> grame, nu „din ochi”;
//  4. mai multe estimări independente ale gramajului, din care se ia mediana.
import { KEYS, FOODS } from "./foods.js";

const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.2.0/+esm";
let sdkPromise;
const loadSdk = () => (sdkPromise ??= import(SDK_URL).then((m) => m.default || m.Anthropic));

const per100Schema = {
  type: "object",
  properties: Object.fromEntries(KEYS.map((k) => [k, { type: "number" }])),
  required: KEYS,
  additionalProperties: false,
};

// Câmpurile de raționament stau înaintea gramajului, ca modelul să le completeze întâi.
const portionFields = {
  visible_cues: { type: "string", description: "Ce se vede: formă, grosime, câtă suprafață din farfurie ocupă, înălțime din poza laterală" },
  dimensions_cm: { type: "string", description: "Dimensiuni estimate în cm, ex. „12 × 7 × 2,5”" },
  volume_ml: { type: "number" },
  density_g_per_ml: { type: "number" },
  grams: { type: "number", description: "Gramajul final = volum × densitate, ajustat dacă e cazul" },
};

const IDENTIFY_SCHEMA = {
  type: "object",
  properties: {
    scale_reference: { type: "string", description: "Ce reper de scară ai folosit și ce dimensiune i-ai atribuit" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Numele alimentului în română, cu metoda de preparare" },
          db_match: { type: "string", description: "Numele exact din lista de referință, sau șir gol" },
          confidence: { type: "string", enum: ["mare", "medie", "mică"] },
          ...portionFields,
          per100: per100Schema,
        },
        required: ["name", "db_match", "confidence", ...Object.keys(portionFields), "per100"],
        additionalProperties: false,
      },
    },
    notes: { type: "string", description: "Scurte observații pentru utilizator, în română: ce ai presupus și ce ar merita verificat" },
  },
  required: ["scale_reference", "items", "notes"],
  additionalProperties: false,
};

const ESTIMATE_SCHEMA = {
  type: "object",
  properties: {
    scale_reference: { type: "string" },
    estimates: {
      type: "array",
      items: {
        type: "object",
        properties: { index: { type: "integer" }, ...portionFields },
        required: ["index", ...Object.keys(portionFields)],
        additionalProperties: false,
      },
    },
  },
  required: ["scale_reference", "estimates"],
  additionalProperties: false,
};

const TEXT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          grams: { type: "number" },
          db_match: { type: "string" },
          confidence: { type: "string", enum: ["mare", "medie", "mică"] },
          per100: per100Schema,
        },
        required: ["name", "grams", "db_match", "confidence", "per100"],
        additionalProperties: false,
      },
    },
    notes: { type: "string" },
  },
  required: ["items", "notes"],
  additionalProperties: false,
};

const SYSTEM = `Ești un nutriționist care estimează compoziția meselor. Răspunzi doar în română.
Valorile per100 sunt la 100 g din alimentul așa cum e servit (gătit, nu crud): kcal, p (proteine g), c (carbohidrați g),
f (grăsimi g), fib (fibre g), sug (zaharuri g), na (sodiu mg), kal (potasiu mg), ca (calciu mg), fe (fier mg), mg (magneziu mg),
zn (zinc mg), vc (vitamina C mg), va (vitamina A µg RAE), vd (vitamina D µg), b12 (vitamina B12 µg), fol (folat µg).
Folosește valori tipice din USDA FoodData Central. Dacă alimentul corespunde unuia din lista de referință, pune numele exact
în db_match; altfel db_match = "". Lista de referință: ${FOODS.map((f) => f.name).join("; ")}.`;

const PORTION_METHOD = (plateCm) => `Metoda de estimare a gramajului, pentru fiecare aliment:
1. Stabilește scara. Reper implicit: farfuria are ${plateCm} cm diametru. Dacă apare un reper mai sigur, folosește-l
   (card bancar 8,56 × 5,4 cm; furculiță ~19 cm; lingură ~17 cm; cuțit ~22 cm; doză 330 ml ~11,5 cm înălțime; mână adultă ~18 cm).
2. Măsoară alimentul raportat la reper: lungime, lățime și înălțime/grosime. Folosește poza din lateral pentru înălțime, dacă există.
   Fără poză laterală, presupune grosimi tipice (friptură 1,5–2,5 cm, grămadă de orez/piure 2–4 cm la centru, mai subțire la margini).
3. Calculează volumul în ml ținând cont de formă (grămezile sunt aproximativ calote/conuri, nu cuburi; scade golurile dintre bucăți la salate, paste, cartofi prăjiți).
4. Înmulțește cu densitatea tipică a alimentului gătit (de ex. orez fiert ~0,8 g/ml presat ușor, paste fierte ~0,6, piure ~1,05,
   carne gătită ~1,05, salată verde ~0,1–0,2, legume crude tăiate ~0,5–0,6, sosuri ~1,0, cartofi prăjiți ~0,45).
5. Grăsimea de gătit nu se vede: dacă alimentul e prăjit, sotat sau are luciu de ulei, adaugă uleiul ca element separat (de obicei 5–15 g).
Ambalajele cu etichetă lizibilă au prioritate: folosește gramajul scris pe ele.`;

async function client(apiKey) {
  if (!apiKey) throw new Error("Adaugă cheia API Anthropic în Setări ca să folosești analiza AI.");
  const Anthropic = await loadSdk();
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

async function ask(c, model, effort, schema, content) {
  const params = {
    model,
    max_tokens: 32000,
    system: SYSTEM,
    output_config: { effort, format: { type: "json_schema", schema } },
    messages: [{ role: "user", content }],
  };
  // Dacă modelul refuză din motive de siguranță, API-ul reîncearcă automat pe un model de rezervă.
  const response = model.startsWith("claude-haiku")
    ? await c.messages.create(params)
    : await c.beta.messages.create({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" });
  if (response.stop_reason === "refusal") throw new Error("Modelul a refuzat cererea. Încearcă altă poză sau descriere.");
  if (response.stop_reason === "max_tokens") throw new Error("Răspunsul a fost tăiat. Încearcă din nou.");
  const block = response.content.find((b) => b.type === "text");
  if (!block) throw new Error("Răspuns gol de la model.");
  return JSON.parse(block.text);
}

const imageBlocks = (images) =>
  images.flatMap((img, i) => [
    { type: "text", text: images.length > 1 ? `Poza ${i + 1}${i === 0 ? " (de sus)" : " (alt unghi)"}:` : "Poza:" },
    { type: "image", source: { type: "base64", media_type: img.mediaType, data: img.b64 } },
  ]);

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Analizează pozele unei mese.
 * samples = câte estimări independente de gramaj se fac (1 = rapid, 3 = precis).
 * Întoarce { items: [{ name, db_match, confidence, per100, grams, spread }], notes, scale_reference }.
 */
export async function analyzePhotos({ apiKey, model, images, hint, plateCm = 26, samples = 3, onProgress = () => {} }) {
  const c = await client(apiKey);
  const userInfo = hint ? `\nInformații de la utilizator (au prioritate față de ce se vede): ${hint}` : "";

  onProgress("Identific alimentele…");
  const first = await ask(c, model, "high", IDENTIFY_SCHEMA, [
    ...imageBlocks(images),
    { type: "text", text: `Identifică fiecare aliment distinct din poze (același aliment din unghiuri diferite se numără o singură dată) și estimează-i gramajul.\n\n${PORTION_METHOD(plateCm)}${userInfo}\nDacă nu e mâncare în poze, întoarce items gol și explică în notes.` },
  ]);
  const items = first.items;
  if (!items.length || samples <= 1) return { ...first, items: items.map((it) => ({ ...it, spread: 0 })) };

  // Estimări suplimentare, independente, pentru aceeași listă de alimente.
  onProgress(`Verific gramajele (${samples - 1} estimări independente)…`);
  const list = items.map((it, i) => `${i}. ${it.name}`).join("\n");
  const extra = await Promise.allSettled(
    Array.from({ length: samples - 1 }, () =>
      ask(c, model, "high", ESTIMATE_SCHEMA, [
        ...imageBlocks(images),
        { type: "text", text: `Alimentele din poze au fost deja identificate:\n${list}\n\nEstimează independent gramajul fiecăruia (folosește indexul de mai sus).\n\n${PORTION_METHOD(plateCm)}${userInfo}` },
      ]),
    ),
  );

  const byIndex = items.map((it) => [it.grams]);
  for (const r of extra) {
    if (r.status !== "fulfilled") continue;
    for (const e of r.value.estimates) if (byIndex[e.index] && e.grams > 0) byIndex[e.index].push(e.grams);
  }
  return {
    ...first,
    items: items.map((it, i) => {
      const g = byIndex[i];
      const m = median(g);
      return { ...it, grams: m, samples: g, spread: g.length > 1 ? (Math.max(...g) - Math.min(...g)) / m : 0 };
    }),
  };
}

/** Text liber (produse negăsite în baza locală) -> alimente cu valori. */
export async function analyzeText({ apiKey, model, text }) {
  const c = await client(apiKey);
  return ask(c, model, "medium", TEXT_SCHEMA, [
    { type: "text", text: `Calculează alimentele și gramajele din textul de mai jos. Dacă un gramaj lipsește, estimează o porție obișnuită.\n\n${text}` },
  ]);
}

// Micșorează poza (latura mare max 1568 px) și o transformă în JPEG base64.
export function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1568 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(url);
      resolve({ dataUrl, b64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Nu am putut citi imaginea.")); };
    img.src = url;
  });
}
