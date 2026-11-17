// Calculul obiectivelor zilnice din profil (Mifflin-St Jeor + doze zilnice recomandate pentru adulți).

export const ACTIVITY = [
  { v: 1.2, label: "Sedentar (birou, fără sport)" },
  { v: 1.375, label: "Ușor activ (sport 1–3 zile/săpt.)" },
  { v: 1.55, label: "Moderat activ (sport 3–5 zile/săpt.)" },
  { v: 1.725, label: "Foarte activ (sport 6–7 zile/săpt.)" },
  { v: 1.9, label: "Extrem de activ (muncă fizică + sport)" },
];

export const GOALS = {
  lose: { label: "Slăbire", kcalAdj: -500, proteinPerKg: 2.0 },
  maintain: { label: "Menținere", kcalAdj: 0, proteinPerKg: 1.6 },
  gain: { label: "Creștere masă musculară", kcalAdj: 300, proteinPerKg: 1.8 },
};

export const DEFAULT_PROFILE = {
  sex: "m", age: 30, weight: 75, height: 178, activity: 1.375, goal: "maintain",
  custom: false, kcal: 2200, p: 140, c: 240, f: 70,
};

export function computeTargets(pr) {
  const bmr = 10 * pr.weight + 6.25 * pr.height - 5 * pr.age + (pr.sex === "m" ? 5 : -161);
  const tdee = bmr * pr.activity;
  const g = GOALS[pr.goal] || GOALS.maintain;
  let kcal, p, c, f;
  if (pr.custom) {
    ({ kcal, p, c, f } = pr);
  } else {
    kcal = Math.max(1200, Math.round((tdee + g.kcalAdj) / 10) * 10);
    p = Math.round(pr.weight * g.proteinPerKg);
    f = Math.round((kcal * 0.27) / 9);
    c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
  }
  const m = pr.sex === "m";
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal, p, c, f,
    fib: m ? 38 : 25,
    sug: Math.round((kcal * 0.1) / 4), // limită: max 10% din calorii
    na: 2300, // limită
    kal: m ? 3400 : 2600,
    ca: pr.age > 50 && !m ? 1200 : 1000,
    fe: m || pr.age > 50 ? 8 : 18,
    mg: m ? 420 : 320,
    zn: m ? 11 : 8,
    vc: m ? 90 : 75,
    va: m ? 900 : 700,
    vd: pr.age > 70 ? 20 : 15,
    b12: 2.4,
    fol: 400,
  };
}
