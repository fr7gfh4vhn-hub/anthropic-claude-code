# Farfuria

Aplicație web (PWA, se poate instala pe telefon) care calculează macro și micronutrienți.

- **Gramaje** – scrii `200 g piept de pui gătit, 150 g orez fiert, 2 ouă` și primești calorii, proteine, carbohidrați, grăsimi plus 13 micronutrienți (fibre, zaharuri, sodiu, potasiu, calciu, fier, magneziu, zinc, vitaminele C, A, D, B12, folat). Calculul se face local, din baza de ~100 de alimente din `foods.js` (valori tipice USDA). Produsele negăsite pot fi completate cu AI.
- **Poză farfurie** – Claude identifică singur alimentele și gramajele din 1–3 poze. Rezultatul e editabil înainte de salvare. Pentru precizie:
  - poză de sus + poză din lateral (înălțimea porțiilor) și un reper de mărime (furculiță, card bancar, diametrul farfuriei din Setări);
  - gramajul se calculează explicit: dimensiuni → volum → densitate → grame, cu uleiul de gătit adăugat separat;
  - 3 (sau 5) estimări independente ale gramajului, din care se ia mediana; alimentele cu estimări foarte diferite sunt marcate „verifică gramajul”;
  - **calibrare personală**: când cântărești și bifezi „am cântărit”, aplicația învață factorul de corecție pe aliment (sau general) și îl aplică la pozele următoare (`calib.js`);
  - **acuratețea reală** (pe masă, pe aliment, % în ±20%) apare în Setări, calculată din cântăririle tale.
- **Obiective** – din sex, vârstă, greutate, înălțime, activitate și obiectiv (slăbire / menținere / masă) se calculează caloriile (Mifflin-St Jeor) și macro; se pot seta și manual. Micronutrienții au ținte după dozele zilnice recomandate.

Jurnalul și profilul stau în `localStorage` pe dispozitiv (cu export/import JSON).

## Rulare

Fișiere statice, fără build:

```bash
cd nutri && python3 -m http.server 8000
# deschide http://localhost:8000
```

Pentru analiza foto: Setări → cheie API Anthropic (de la console.anthropic.com). Cheia e păstrată doar în browser și e trimisă direct la API-ul Anthropic, deci aplicația e gândită pentru uz personal. Pentru o aplicație publică, apelul trebuie mutat pe un server.

Estimările din poză sunt aproximative (gramajul se ghicește vizual); pentru precizie, cântărește și folosește modul Gramaje.
