// Valori aproximative la 100 g (sau 100 ml), după valori tipice USDA FoodData Central.
// Ordinea câmpurilor: vezi NUTRIENTS.
export const NUTRIENTS = [
  { k: "kcal", label: "Calorii", unit: "kcal", macro: true },
  { k: "p", label: "Proteine", unit: "g", macro: true },
  { k: "c", label: "Carbohidrați", unit: "g", macro: true },
  { k: "f", label: "Grăsimi", unit: "g", macro: true },
  { k: "fib", label: "Fibre", unit: "g" },
  { k: "sug", label: "Zaharuri", unit: "g", limit: true },
  { k: "na", label: "Sodiu", unit: "mg", limit: true },
  { k: "kal", label: "Potasiu", unit: "mg" },
  { k: "ca", label: "Calciu", unit: "mg" },
  { k: "fe", label: "Fier", unit: "mg" },
  { k: "mg", label: "Magneziu", unit: "mg" },
  { k: "zn", label: "Zinc", unit: "mg" },
  { k: "vc", label: "Vitamina C", unit: "mg" },
  { k: "va", label: "Vitamina A", unit: "µg" },
  { k: "vd", label: "Vitamina D", unit: "µg" },
  { k: "b12", label: "Vitamina B12", unit: "µg" },
  { k: "fol", label: "Folat", unit: "µg" },
];
export const KEYS = NUTRIENTS.map((n) => n.k);

// [nume, sinonime, gramaj per bucată (0 = nu se aplică), ...valori în ordinea KEYS]
const RAW = [
  ["piept de pui gătit", "pui, piept pui, chicken", 0, 165, 31, 0, 3.6, 0, 0, 74, 256, 15, 1.0, 29, 1.0, 0, 6, 0.1, 0.3, 4],
  ["piept de pui crud", "pui crud", 0, 120, 22.5, 0, 2.6, 0, 0, 45, 334, 5, 0.4, 28, 0.7, 0, 9, 0.1, 0.2, 4],
  ["pulpă de pui gătită", "pulpe pui, copan", 0, 209, 26, 0, 10.9, 0, 0, 88, 240, 12, 1.3, 23, 2.4, 0, 18, 0.1, 0.3, 7],
  ["piept de curcan gătit", "curcan", 0, 147, 30, 0, 2, 0, 0, 99, 293, 10, 0.7, 32, 1.6, 0, 0, 0.1, 0.4, 6],
  ["carne tocată de vită", "vita tocata, carne vita, beef", 0, 215, 18.6, 0, 15, 0, 0, 66, 270, 18, 2.0, 18, 4.6, 0, 0, 0.1, 2.1, 6],
  ["friptură de vită", "vita, steak, vită gătită", 0, 250, 26, 0, 15, 0, 0, 72, 318, 18, 2.6, 21, 6.3, 0, 0, 0.1, 2.6, 7],
  ["cotlet de porc gătit", "porc, carne porc, ceafă", 0, 242, 27, 0, 14, 0, 0, 62, 423, 19, 0.9, 28, 2.4, 0.6, 2, 0.5, 0.7, 0],
  ["ficat de pui", "ficat", 0, 167, 24.5, 0.9, 6.5, 0, 0, 76, 263, 11, 11.6, 25, 4, 27.9, 3981, 0, 16.9, 578],
  ["somon", "salmon", 0, 208, 20, 0, 13, 0, 0, 59, 363, 9, 0.3, 27, 0.4, 0, 58, 11, 3.2, 26],
  ["ton în apă", "ton, ton conserva", 0, 116, 25.5, 0, 0.8, 0, 0, 247, 237, 11, 1.0, 27, 0.8, 0, 17, 1.7, 2.5, 4],
  ["cod", "peste alb, merluciu", 0, 82, 18, 0, 0.7, 0, 0, 54, 413, 16, 0.4, 32, 0.5, 1, 12, 0.9, 0.9, 7],
  ["sardine în ulei", "sardine", 0, 208, 24.6, 0, 11.5, 0, 0, 307, 397, 382, 2.9, 39, 1.3, 0, 32, 4.8, 8.9, 10],
  ["creveți", "creveti, shrimp", 0, 99, 24, 0.2, 0.3, 0, 0, 111, 259, 70, 0.5, 39, 1.6, 0, 0, 0, 1.5, 0],
  ["șuncă", "sunca, piept afumat, ham", 0, 145, 21, 1.5, 5.5, 0, 1, 1200, 290, 8, 0.8, 20, 2, 0, 0, 0.6, 0.5, 3],
  ["salam", "salam uscat", 0, 336, 22, 1.5, 26, 0, 1, 1600, 340, 10, 1.5, 20, 3, 0, 0, 0.5, 1.4, 2],
  ["cârnați", "carnati, mici, crenvursti", 0, 290, 15, 2, 25, 0, 1, 800, 250, 15, 1.2, 15, 2.5, 0, 0, 0.5, 1, 4],
  ["bacon", "costita afumata, bacon", 0, 541, 37, 1.4, 42, 0, 0, 1717, 565, 11, 1.4, 34, 3.5, 0, 11, 0.3, 1.2, 1],
  ["ou", "oua, ouă, egg", 50, 143, 12.6, 0.7, 9.5, 0, 0.4, 142, 138, 56, 1.8, 12, 1.3, 0, 160, 2.0, 0.9, 47],
  ["albuș", "albus, albusuri", 33, 52, 10.9, 0.7, 0.2, 0, 0.7, 166, 163, 7, 0.1, 11, 0, 0, 0, 0, 0.1, 4],
  ["lapte 1.5%", "lapte", 0, 46, 3.4, 5, 1.5, 0, 5, 44, 150, 120, 0.03, 11, 0.4, 0, 28, 0.1, 0.45, 5],
  ["iaurt grecesc 2%", "iaurt grecesc, greek", 0, 73, 9.9, 3.9, 2, 0, 3.6, 34, 141, 115, 0.1, 11, 0.5, 0, 10, 0, 0.75, 7],
  ["iaurt natural 3.5%", "iaurt", 0, 61, 3.5, 4.7, 3.3, 0, 4.7, 46, 155, 121, 0.05, 12, 0.6, 0.5, 27, 0.1, 0.4, 7],
  ["brânză de vaci", "branza vaci, cottage", 0, 98, 11, 3.4, 4.3, 0, 2.7, 40, 104, 83, 0.1, 8, 0.4, 0, 37, 0.1, 0.4, 12],
  ["telemea", "branza, feta, telemea vaca", 0, 264, 14, 4, 21, 0, 4, 1116, 62, 493, 0.65, 19, 2.9, 0, 125, 0.4, 1.7, 32],
  ["cașcaval", "cascaval, branza galbena", 0, 350, 25, 1.5, 27, 0, 0.5, 620, 90, 700, 0.3, 28, 3.5, 0, 250, 0.5, 1.5, 10],
  ["mozzarella", "mozarela", 0, 280, 28, 3, 17, 0, 1, 627, 76, 505, 0.4, 20, 2.9, 0, 170, 0.4, 2.3, 7],
  ["smântână 20%", "smantana", 0, 204, 2.5, 3.5, 20, 0, 3, 40, 140, 100, 0.1, 10, 0.3, 0.5, 180, 0.2, 0.3, 9],
  ["unt", "butter", 0, 717, 0.9, 0.1, 81, 0, 0.1, 11, 24, 24, 0, 2, 0.1, 0, 684, 1.5, 0.2, 3],
  ["ulei de măsline", "ulei masline, olive", 0, 884, 0, 0, 100, 0, 0, 2, 1, 1, 0.6, 0, 0, 0, 0, 0, 0, 0],
  ["ulei de floarea-soarelui", "ulei", 0, 884, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["proteină whey", "whey, praf proteic, proteina", 0, 400, 80, 8, 6, 0, 5, 200, 500, 400, 1, 100, 2, 0, 0, 0, 1, 0],
  ["tofu", "", 0, 76, 8, 1.9, 4.8, 0.3, 0.6, 7, 121, 350, 5.4, 30, 0.8, 0.1, 5, 0, 0, 15],
  ["orez alb fiert", "orez, orez fiert", 0, 130, 2.7, 28, 0.3, 0.4, 0.1, 1, 35, 10, 0.2, 12, 0.5, 0, 0, 0, 0, 3],
  ["orez brun fiert", "orez brun, orez integral", 0, 123, 2.7, 25.6, 1, 1.6, 0.2, 4, 86, 3, 0.6, 39, 0.7, 0, 0, 0, 0, 4],
  ["orez crud", "orez nefiert", 0, 360, 6.6, 79, 0.6, 1.3, 0.1, 5, 86, 9, 0.8, 25, 1.1, 0, 0, 0, 0, 8],
  ["paste fierte", "paste, spaghete, penne, macaroane", 0, 158, 5.8, 31, 0.9, 1.8, 0.6, 1, 44, 7, 0.5, 18, 0.5, 0, 0, 0, 0, 7],
  ["paste crude", "paste nefierte", 0, 371, 13, 75, 1.5, 3.2, 2.7, 6, 223, 21, 1.3, 53, 1.4, 0, 0, 0, 0, 18],
  ["quinoa fiartă", "quinoa", 0, 120, 4.4, 21.3, 1.9, 2.8, 0.9, 7, 172, 17, 1.5, 64, 1.1, 0, 1, 0, 0, 42],
  ["hrișcă fiartă", "hrisca", 0, 92, 3.4, 20, 0.6, 2.7, 0.9, 4, 88, 7, 0.8, 51, 0.6, 0, 0, 0, 0, 14],
  ["fulgi de ovăz", "ovaz, oats, fulgi ovaz", 0, 379, 13, 68, 6.5, 10, 1, 6, 362, 52, 4.3, 138, 3.6, 0, 0, 0, 0, 32],
  ["granola", "musli, muesli", 0, 471, 10, 64, 20, 7, 24, 25, 400, 60, 3, 100, 2.5, 1, 0, 0, 0, 30],
  ["corn flakes", "cereale, fulgi porumb", 0, 357, 7.5, 84, 0.4, 3.3, 9, 729, 168, 5, 1.4, 12, 0.2, 0, 0, 0, 0, 10],
  ["pâine albă", "paine, paine alba", 30, 266, 8.9, 49, 3.3, 2.7, 5, 490, 115, 40, 1.2, 25, 0.7, 0, 0, 0, 0, 30],
  ["pâine integrală", "paine integrala, paine neagra", 30, 252, 12.5, 43, 3.5, 6, 4.4, 450, 250, 100, 2.5, 75, 1.8, 0, 0, 0, 0, 40],
  ["lipie", "tortilla, wrap", 60, 312, 8.5, 52, 8, 3.5, 2.5, 600, 130, 120, 2, 25, 0.7, 0, 0, 0, 0, 40],
  ["mămăligă", "mamaliga, polenta", 0, 70, 1.6, 15, 0.4, 1, 0.2, 1, 30, 2, 0.4, 8, 0.2, 0, 5, 0, 0, 4],
  ["cartofi fierți", "cartofi, cartof", 0, 87, 1.9, 20, 0.1, 1.8, 0.9, 4, 379, 5, 0.3, 22, 0.3, 13, 0, 0, 0, 10],
  ["cartofi copți", "cartofi la cuptor", 0, 93, 2.5, 21, 0.1, 2.2, 1.2, 10, 535, 15, 1.1, 28, 0.4, 9.6, 1, 0, 0, 28],
  ["cartofi prăjiți", "cartofi prajiti, fries", 0, 312, 3.4, 41, 15, 3.8, 0.3, 210, 579, 18, 0.8, 35, 0.5, 4.7, 0, 0, 0, 30],
  ["cartof dulce copt", "cartof dulce, batat", 0, 90, 2, 20.7, 0.15, 3.3, 6.5, 36, 475, 38, 0.7, 27, 0.3, 19.6, 961, 0, 0, 6],
  ["fasole boabe fiartă", "fasole", 0, 127, 8.7, 22.8, 0.5, 6.4, 0.3, 1, 403, 35, 2.2, 45, 0.9, 1.2, 0, 0, 0, 130],
  ["linte fiartă", "linte", 0, 116, 9, 20, 0.4, 7.9, 1.8, 2, 369, 19, 3.3, 36, 1.3, 1.5, 0, 0, 0, 181],
  ["năut fiert", "naut, chickpeas", 0, 164, 8.9, 27.4, 2.6, 7.6, 4.8, 7, 291, 49, 2.9, 48, 1.5, 1.3, 1, 0, 0, 172],
  ["hummus", "humus", 0, 166, 7.9, 14.3, 9.6, 6, 0.3, 379, 228, 38, 2.4, 71, 1.8, 0, 1, 0, 0, 83],
  ["broccoli", "brocoli", 0, 34, 2.8, 6.6, 0.4, 2.6, 1.7, 33, 316, 47, 0.7, 21, 0.4, 89, 31, 0, 0, 63],
  ["spanac", "", 0, 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, 558, 99, 2.7, 79, 0.5, 28, 469, 0, 0, 194],
  ["roșii", "rosii, rosie, tomate", 120, 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, 237, 10, 0.3, 11, 0.2, 14, 42, 0, 0, 15],
  ["castraveți", "castravete, castraveti", 200, 15, 0.7, 3.6, 0.1, 0.5, 1.7, 2, 147, 16, 0.3, 13, 0.2, 2.8, 5, 0, 0, 7],
  ["ardei gras", "ardei, gogosar", 150, 31, 1, 6, 0.3, 2.1, 4.2, 4, 211, 7, 0.4, 12, 0.3, 128, 157, 0, 0, 46],
  ["morcovi", "morcov", 70, 41, 0.9, 9.6, 0.2, 2.8, 4.7, 69, 320, 33, 0.3, 12, 0.2, 5.9, 835, 0, 0, 19],
  ["ceapă", "ceapa", 110, 40, 1.1, 9.3, 0.1, 1.7, 4.2, 4, 146, 23, 0.2, 10, 0.2, 7.4, 0, 0, 0, 19],
  ["salată verde", "salata, lattuce, iceberg", 0, 15, 1.4, 2.9, 0.2, 1.3, 0.8, 28, 194, 36, 0.9, 13, 0.2, 9.2, 370, 0, 0, 38],
  ["varză", "varza", 0, 25, 1.3, 5.8, 0.1, 2.5, 3.2, 18, 170, 40, 0.5, 12, 0.2, 36.6, 5, 0, 0, 43],
  ["dovlecel", "dovlecei, zucchini", 0, 17, 1.2, 3.1, 0.3, 1, 2.5, 8, 261, 16, 0.4, 18, 0.3, 17.9, 10, 0, 0, 24],
  ["vinete", "vanata", 0, 25, 1, 5.9, 0.2, 3, 3.5, 2, 229, 9, 0.2, 14, 0.2, 2.2, 1, 0, 0, 22],
  ["ciuperci", "champignon, ciuperca", 0, 22, 3.1, 3.3, 0.3, 1, 2, 5, 318, 3, 0.5, 9, 0.5, 2.1, 0, 0.2, 0.04, 17],
  ["conopidă", "conopida", 0, 25, 1.9, 5, 0.3, 2, 1.9, 30, 299, 22, 0.4, 15, 0.3, 48, 0, 0, 0, 57],
  ["mazăre", "mazare", 0, 81, 5.4, 14.5, 0.4, 5.7, 5.7, 5, 244, 25, 1.5, 33, 1.2, 40, 38, 0, 0, 65],
  ["porumb dulce", "porumb", 0, 86, 3.3, 19, 1.4, 2, 6.3, 15, 270, 2, 0.5, 37, 0.5, 6.8, 9, 0, 0, 42],
  ["avocado", "", 150, 160, 2, 8.5, 14.7, 6.7, 0.7, 7, 485, 12, 0.6, 29, 0.6, 10, 7, 0, 0, 81],
  ["măsline", "masline", 4, 115, 0.8, 6, 10.7, 3.2, 0, 735, 8, 88, 3.3, 4, 0.2, 0.9, 20, 0, 0, 0],
  ["zacuscă", "zacusca", 0, 100, 1.5, 8, 7, 2.5, 5, 500, 250, 20, 0.6, 15, 0.2, 10, 100, 0, 0, 15],
  ["măr", "mar, mere", 180, 52, 0.3, 13.8, 0.2, 2.4, 10.4, 1, 107, 6, 0.1, 5, 0, 4.6, 3, 0, 0, 3],
  ["banană", "banana, banane", 120, 89, 1.1, 22.8, 0.3, 2.6, 12.2, 1, 358, 5, 0.3, 27, 0.2, 8.7, 3, 0, 0, 20],
  ["portocală", "portocala, portocale", 150, 47, 0.9, 11.8, 0.1, 2.4, 9.4, 0, 181, 40, 0.1, 10, 0.1, 53, 11, 0, 0, 30],
  ["pară", "para, pere", 180, 57, 0.4, 15.2, 0.1, 3.1, 9.8, 1, 116, 9, 0.2, 7, 0.1, 4.3, 1, 0, 0, 7],
  ["kiwi", "", 75, 61, 1.1, 14.7, 0.5, 3, 9, 3, 312, 34, 0.3, 17, 0.1, 92.7, 4, 0, 0, 25],
  ["căpșuni", "capsuni", 0, 32, 0.7, 7.7, 0.3, 2, 4.9, 1, 153, 16, 0.4, 13, 0.1, 58.8, 1, 0, 0, 24],
  ["afine", "blueberries", 0, 57, 0.7, 14.5, 0.3, 2.4, 10, 1, 77, 6, 0.3, 6, 0.2, 9.7, 3, 0, 0, 6],
  ["struguri", "strugure", 0, 69, 0.7, 18, 0.2, 0.9, 15.5, 2, 191, 10, 0.4, 7, 0.1, 3.2, 3, 0, 0, 2],
  ["pepene roșu", "pepene, harbuz", 0, 30, 0.6, 7.6, 0.2, 0.4, 6.2, 1, 112, 7, 0.2, 10, 0.1, 8.1, 28, 0, 0, 3],
  ["migdale", "migdala", 1.2, 579, 21, 21.6, 49.9, 12.5, 4.4, 1, 733, 269, 3.7, 270, 3.1, 0, 0, 0, 0, 44],
  ["nuci", "miez nuca, nuca", 0, 654, 15.2, 13.7, 65.2, 6.7, 2.6, 2, 441, 98, 2.9, 158, 3.1, 1.3, 1, 0, 0, 98],
  ["unt de arahide", "arahide, peanut butter", 0, 588, 25, 20, 50, 6, 9, 17, 649, 43, 1.9, 168, 2.9, 0, 0, 0, 0, 87],
  ["semințe de chia", "chia", 0, 486, 16.5, 42, 30.7, 34.4, 0, 16, 407, 631, 7.7, 335, 4.6, 1.6, 0, 0, 0, 49],
  ["miere", "", 0, 304, 0.3, 82.4, 0, 0.2, 82.1, 4, 52, 6, 0.4, 2, 0.2, 0.5, 0, 0, 0, 2],
  ["zahăr", "zahar", 0, 387, 0, 100, 0, 0, 100, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  ["ciocolată neagră 70%", "ciocolata, ciocolata neagra", 0, 598, 7.8, 45.9, 42.6, 10.9, 24, 20, 715, 73, 11.9, 228, 3.3, 0, 2, 0, 0.3, 0],
  ["maioneză", "maioneza", 0, 680, 1, 0.6, 75, 0, 0.6, 635, 20, 8, 0.2, 1, 0.1, 0, 20, 0.2, 0.1, 5],
  ["ketchup", "", 0, 101, 1, 27, 0.1, 0.3, 21, 907, 281, 15, 0.4, 13, 0.2, 4.1, 24, 0, 0, 9],
  ["pizza", "pizza margherita", 0, 266, 11, 33, 10, 2.3, 3.6, 598, 172, 188, 1.5, 24, 1.3, 0.5, 60, 0.2, 0.4, 30],
  ["suc de portocale", "suc portocale, fresh", 0, 45, 0.7, 10.4, 0.2, 0.2, 8.4, 1, 200, 11, 0.2, 11, 0.1, 50, 10, 0, 0, 30],
  ["cafea", "cafea neagra, espresso", 0, 1, 0.1, 0, 0, 0, 0, 2, 49, 2, 0, 3, 0, 0, 0, 0, 0, 2],
  ["cola", "coca-cola, suc acidulat", 0, 42, 0, 10.6, 0, 0, 10.6, 4, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  ["bere", "", 0, 43, 0.5, 3.6, 0, 0, 0, 4, 27, 4, 0, 6, 0, 0, 0, 0, 0, 6],
  ["vin roșu", "vin", 0, 85, 0.1, 2.6, 0, 0, 0.6, 4, 127, 8, 0.5, 12, 0.1, 0, 0, 0, 0, 1],
];

export const FOODS = RAW.map(([name, aliases, unit, ...vals]) => ({
  name,
  aliases: aliases ? aliases.split(",").map((s) => s.trim()).filter(Boolean) : [],
  unit,
  per100: Object.fromEntries(KEYS.map((k, i) => [k, vals[i]])),
}));

export const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9% .-]/g, " ").replace(/\s+/g, " ").trim();

// Caută alimentul cel mai potrivit pentru un text. Întoarce null dacă nu e o potrivire credibilă.
export function findFood(query) {
  const q = norm(query);
  if (!q) return null;
  const qWords = q.split(" ");
  let best = null;
  let bestScore = 0;
  for (const food of FOODS) {
    for (const cand of [food.name, ...food.aliases].map(norm)) {
      let score;
      if (cand === q) score = 100;
      else {
        const cWords = cand.split(" ");
        const hits = cWords.filter((w) => qWords.some((qw) => qw === w || (w.length > 3 && qw.startsWith(w.slice(0, -1))) || (qw.length > 3 && w.startsWith(qw.slice(0, -1))))).length;
        if (!hits) continue;
        score = (hits / cWords.length) * 60 + (hits / qWords.length) * 30;
      }
      if (score > bestScore) { bestScore = score; best = food; }
    }
  }
  return bestScore >= 45 ? best : null;
}

// "200g piept de pui, 2 ouă, 150 ml lapte" -> [{qty, unit, text}]
export function parseLines(input) {
  return input
    .split(/[\n,;]+| și | si /)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      let m = s.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grame|ml|l|buc|bucăți|bucati)?\.?\s+(?:de\s+)?(.+)$/i);
      if (!m) {
        const t = s.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grame|ml|l|buc|bucăți|bucati)?$/i);
        if (t) m = [s, t[2], t[3], t[1]];
      }
      if (!m) return { qty: null, unit: null, text: s };
      return { qty: parseFloat(m[1].replace(",", ".")), unit: (m[2] || "").toLowerCase(), text: m[3].trim() };
    });
}

export function gramsFor(line, food) {
  const { qty, unit } = line;
  if (qty == null) return food?.unit || 100;
  if (unit === "kg" || unit === "l") return qty * 1000;
  if (unit.startsWith("g") || unit === "ml") return qty;
  // fără unitate sau "buc": număr mic + aliment cu gramaj pe bucată = bucăți
  if ((unit.startsWith("buc") || (!unit && qty <= 20)) && food?.unit) return qty * food.unit;
  return qty;
}

export function scale(per100, grams) {
  const f = grams / 100;
  return Object.fromEntries(KEYS.map((k) => [k, (per100[k] || 0) * f]));
}
