// Analiză cu Claude: poza farfuriei sau text liber -> alimente, gramaje și valori nutriționale.
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

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Numele alimentului în română, cu metoda de preparare" },
          grams: { type: "number", description: "Cantitatea estimată în grame (sau ml pentru lichide)" },
          db_match: { type: "string", description: "Numele exact din lista de referință, sau șir gol" },
          confidence: { type: "string", enum: ["mare", "medie", "mică"] },
          per100: per100Schema,
        },
        required: ["name", "grams", "db_match", "confidence", "per100"],
        additionalProperties: false,
      },
    },
    notes: { type: "string", description: "Scurte observații pentru utilizator, în română" },
  },
  required: ["items", "notes"],
  additionalProperties: false,
};

const SYSTEM = `Ești un nutriționist care estimează compoziția meselor. Răspunzi doar în română.
Pentru fiecare aliment distinct dai: numele (cu metoda de preparare), gramajul estimat și valorile la 100 g.
Câmpurile per100: kcal, p (proteine g), c (carbohidrați g), f (grăsimi g), fib (fibre g), sug (zaharuri g),
na (sodiu mg), kal (potasiu mg), ca (calciu mg), fe (fier mg), mg (magneziu mg), zn (zinc mg), vc (vitamina C mg),
va (vitamina A µg RAE), vd (vitamina D µg), b12 (vitamina B12 µg), fol (folat µg). Folosește valori tipice din USDA FoodData Central.
Dacă alimentul corespunde unuia din lista de referință, pune numele exact în db_match; altfel db_match = "".
Lista de referință: ${FOODS.map((f) => f.name).join("; ")}.`;

const PHOTO_PROMPT = `Analizează poza farfuriei. Identifică fiecare aliment vizibil și estimează gramajul
folosind indicii de scară: diametrul farfuriei (de obicei 24–27 cm), tacâmuri, mâini, ambalaje.
Ține cont de metoda de gătire și de grăsimea probabil folosită (ulei, unt, sosuri) ca element separat dacă e cazul.
În notes spune ce ai presupus și ce ar trebui verificat (de ex. cantitatea de ulei). Dacă nu e mâncare în poză, întoarce items gol și explică în notes.`;

export async function analyze({ apiKey, model, imageB64, mediaType, text, hint }) {
  if (!apiKey) throw new Error("Adaugă cheia API Anthropic în Setări ca să folosești analiza AI.");
  const Anthropic = await loadSdk();
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const content = [];
  if (imageB64) {
    content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: imageB64 } });
    content.push({ type: "text", text: PHOTO_PROMPT + (hint ? `\nInformații de la utilizator: ${hint}` : "") });
  } else {
    content.push({ type: "text", text: `Calculează alimentele și gramajele din textul de mai jos. Dacă un gramaj lipsește, estimează o porție obișnuită.\n\n${text}` });
  }

  const params = {
    model,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content }],
  };
  // Dacă modelul refuză din motive de siguranță, API-ul reîncearcă automat pe un model de rezervă.
  const withFallback = !model.startsWith("claude-haiku");
  const response = withFallback
    ? await client.beta.messages.create({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
    : await client.messages.create(params);

  if (response.stop_reason === "refusal") throw new Error("Modelul a refuzat cererea. Încearcă altă poză sau descriere.");
  if (response.stop_reason === "max_tokens") throw new Error("Răspunsul a fost tăiat. Încearcă din nou cu mai puține alimente.");
  const block = response.content.find((b) => b.type === "text");
  if (!block) throw new Error("Răspuns gol de la model.");
  return JSON.parse(block.text);
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
