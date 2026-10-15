/* Vypíše, co ještě chybí namluvit: pro každého mluvčího repliky bez nahrávky.
   Spuštění v kořeni kurzu:   node vypsat-chybejici-hlasy.js
   Vznikne audio/hlasy-k-doplneni.md. Po přidání nahrávek skript spusťte znovu. */
const fs = require("fs"), path = require("path");
const { VIDEA } = new Function(fs.readFileSync(path.join(__dirname, "content.js"), "utf8") + "\nreturn { VIDEA };")();
const JMENO = { L: "Honza", O: "Ozvěna", J: "Paní Jana", T: "Pan Tomáš", CH: "Chatbot (hlas)" };
const POZN = {
  CH: "Žena (chatbot říká „ráda“, „poznala“, „kamarádka“). Přátelský, ochotný až příliš, ne robotický. Soubor se jmenuje KÓD-hlas.mp3; ťukání klávesnice hraje pod ním samo.",
  T: "Starší muž, stejný hlas jako u 2.3-T1.", J: "Starší žena, stejný hlas jako u 2.1-J1.",
};
const chybi = {};
for (const [id, v] of Object.entries(VIDEA)) for (const r of v.repliky) {
  if (!r.kod || r.kdo === "TIT") continue;
  const soubor = r.kdo === "CH" ? `${r.kod}-hlas.mp3` : `${r.kod}.mp3`;
  if (fs.existsSync(path.join(__dirname, "audio", soubor))) continue;
  (chybi[r.kdo] = chybi[r.kdo] || []).push({ id, soubor, text: r.text, nazev: v.nazev });
}
const celkem = Object.values(chybi).reduce((a, x) => a + x.length, 0);
const r = ["# Co ještě chybí namluvit", "",
  "Soubory ukládejte do složky `audio/` přesně pod uvedeným názvem (MP3). Kurz si je najde sám; co chybí, běží jako text.",
  "Seznam se skládá podle skutečného obsahu složky, po přidání nahrávek ho obnovíte příkazem `node vypsat-chybejici-hlasy.js`.", "",
  `**Celkem chybí: ${celkem}**`, ""];
if (!celkem) r.push("Všechno je namluvené.");
for (const k of ["T", "J", "CH", "L", "O"]) if (chybi[k]) {
  r.push(`## ${JMENO[k]} (${chybi[k].length})`, ""); if (POZN[k]) r.push(POZN[k], "");
  let video = null;
  for (const x of chybi[k]) { if (x.id !== video) { video = x.id; r.push(`### Video ${x.id} · ${x.nazev}`, ""); } r.push(`**\`audio/${x.soubor}\`**`, "", x.text, ""); }
}
fs.writeFileSync(path.join(__dirname, "audio", "hlasy-k-doplneni.md"), r.join("\n") + "\n", "utf8");
console.log(`audio/hlasy-k-doplneni.md: chybí ${celkem}`, Object.entries(chybi).map(([k, a]) => `${JMENO[k]} ${a.length}`).join(", "));
