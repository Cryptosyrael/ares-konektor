/* Vypíše scénář pro namluvení: ke každé zvukové stopě její soubor a text,
   který se má načíst. Spouští se v kořeni kurzu:

       node vypsat-scenar.js

   Vznikne zvuk/scenar.md. Po úpravě textů v obsah.js skript spusťte znovu. */
const fs = require('fs');
const path = require('path');

const koren = __dirname;
// obsah.js je prostý JS bez závislostí, stačí ho spustit a vybrat si z něj proměnné
const { MODULY, UKAZKY, ZASADY, SIGNALY, KOMU_ZAVOLAT, zvukSouboru } = new Function(
  fs.readFileSync(path.join(koren, 'obsah.js'), 'utf8') +
  '\nreturn { MODULY, UKAZKY, ZASADY, SIGNALY, KOMU_ZAVOLAT, zvukSouboru };')();

const bezZnacek = t => String(t).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const radky = [
  '# Scénář pro namluvení',
  '',
  'Vygeneroval `vypsat-scenar.js` z `obsah.js`. Po úpravě textů skript spusťte znovu.',
  '',
  'Soubory ukládejte do složky `zvuk/` přesně pod uvedeným názvem. Co chybí,',
  'kurz prostě nenabídne — nahrávat se dá po částech.',
  '',
  `Celkem stop: ${MODULY.reduce((a, m) => a + m.kroky.filter(k => k.id || k.typ === 'ukazka').length, 0)}`,
  ''
];

for (const modul of MODULY) {
  radky.push(`## Modul ${modul.c}: ${modul.nazev}`, '');
  for (const krok of modul.kroky) {
    if (krok.typ === 'ukazka') {
      const u = UKAZKY[krok.id];
      radky.push(`### ${zvukSouboru('ukazka-' + u.id)}`, '',
        `**${u.nazev}** · ukázka trvá ${Math.floor(u.delka / 60)}:${String(u.delka % 60).padStart(2, '0')}`, '',
        'Text odpovídá titulkům. Čas v závorce říká, kdy věta v ukázce zazní —',
        'stopa se k ukázce přidržuje, takže stačí držet pořadí a zhruba i tempo.', '');
      for (const t of u.titulky) {
        const mm = Math.floor(t.t / 60), ss = String(t.t % 60).padStart(2, '0');
        radky.push(`- *(${mm}:${ss})* ${bezZnacek(t.text)}`);
      }
      radky.push('');
    } else if (krok.id) {
      radky.push(`### ${zvukSouboru(krok.id)}`, '', `**${krok.nazev}**`, '');
      if (krok.uvod) radky.push(bezZnacek(krok.uvod), '');
      if (krok.body) { krok.body.forEach(b => radky.push(`- ${bezZnacek(b)}`)); radky.push(''); }
      if (krok.typ === 'zasady') {
        ZASADY.forEach(z => radky.push(`- Zásada ${z.c}, ${z.nazev}. ${bezZnacek(z.text)}`));
        radky.push('');
      }
      if (krok.typ === 'kontakty') {
        KOMU_ZAVOLAT.forEach(x => radky.push(`- ${x.kdo}. ${bezZnacek(x.co)} Jak začít: ${bezZnacek(x.jak)}`));
        radky.push('');
      }
      if (krok.typ === 'signaly') {
        SIGNALY.forEach(x => radky.push(`- ${bezZnacek(x)}`));
        radky.push('');
      }
    }
  }
}

fs.writeFileSync(path.join(koren, 'zvuk', 'scenar.md'), radky.join('\n') + '\n', 'utf8');
console.log('Hotovo: zvuk/scenar.md');
