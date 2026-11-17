# Farfuria

Aplicație web (PWA, se poate instala pe telefon) care calculează macro și micronutrienți.

- **Gramaje** – scrii `200 g piept de pui gătit, 150 g orez fiert, 2 ouă` și primești calorii, proteine, carbohidrați, grăsimi plus 13 micronutrienți (fibre, zaharuri, sodiu, potasiu, calciu, fier, magneziu, zinc, vitaminele C, A, D, B12, folat). Calculul se face local, din baza de ~100 de alimente din `foods.js` (valori tipice USDA). Produsele negăsite pot fi completate cu AI.
- **Poză farfurie** – Claude identifică alimentele din poză, estimează gramajele și valorile. Rezultatul e editabil (gramaje, înlocuire cu aliment din bază) înainte de salvare.
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
