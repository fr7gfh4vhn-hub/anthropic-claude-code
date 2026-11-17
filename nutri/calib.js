// Calibrare personală și măsurarea acurateței estimărilor foto.
//
// De fiecare dată când bifezi „am cântărit” la un aliment estimat din poză, se salvează
// { key, raw (estimarea AI brută), shown (ce ți s-a afișat), real (gramajul cântărit), kcal100 }.
// Din aceste înregistrări:
//  - se calculează un factor de corecție (mediana real/raw) pe aliment, sau global dacă nu sunt destule date;
//  - se măsoară acuratețea reală, ca să știi dacă ajunge la 80%.
import { norm } from "./foods.js";

const MIN_PER_FOOD = 2;
const MIN_GLOBAL = 5;
const MAX_RECORDS = 500;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const calibKey = (item) => norm(item.db_match || item.name);

export function correctionFactor(records, key) {
  const own = records.filter((r) => r.key === key && r.raw > 0);
  if (own.length >= MIN_PER_FOOD) return { factor: clamp(median(own.map((r) => r.real / r.raw)), 0.5, 2), basis: "aliment", n: own.length };
  const all = records.filter((r) => r.raw > 0);
  if (all.length >= MIN_GLOBAL) return { factor: clamp(median(all.map((r) => r.real / r.raw)), 0.6, 1.6), basis: "general", n: all.length };
  return { factor: 1, basis: null, n: 0 };
}

export function addRecords(records, newOnes) {
  return [...records, ...newOnes].slice(-MAX_RECORDS);
}

// Acuratețe = 1 − eroarea relativă (pe calorii). Se raportează atât pe aliment cât și pe masă.
export function accuracyStats(records) {
  if (!records.length) return null;
  const itemAcc = records.map((r) => Math.max(0, 1 - Math.abs(r.shown - r.real) / r.real));
  const within20 = records.filter((r) => Math.abs(r.shown - r.real) / r.real <= 0.2).length / records.length;

  // Pe masă: erorile alimentelor se compensează parțial, deci contează totalul de calorii.
  const meals = new Map();
  for (const r of records) {
    const m = meals.get(r.meal) || { est: 0, real: 0 };
    m.est += (r.shown * r.kcal100) / 100;
    m.real += (r.real * r.kcal100) / 100;
    meals.set(r.meal, m);
  }
  const mealAcc = [...meals.values()].filter((m) => m.real > 0).map((m) => Math.max(0, 1 - Math.abs(m.est - m.real) / m.real));

  // Ultimele 20 de alimente, ca să vezi dacă calibrarea ajută.
  const recent = itemAcc.slice(-20);
  return {
    n: records.length,
    meals: mealAcc.length,
    itemAccuracy: itemAcc.reduce((a, b) => a + b, 0) / itemAcc.length,
    mealAccuracy: mealAcc.length ? mealAcc.reduce((a, b) => a + b, 0) / mealAcc.length : null,
    recentAccuracy: recent.reduce((a, b) => a + b, 0) / recent.length,
    within20,
  };
}
