# Stroj, který naslouchá – online kurz

Informační online kurz o umělé inteligenci jako posluchači, rádci a společníkovi.
Čtyři moduly, šest animovaných videí (vypravěč Honza a Ozvěna), závěrečný test.

Kurz je obyčejná webová stránka. Nepotřebuje žádný server ani databázi,
stačí ji nahrát kamkoli na web (například zdarma na GitHub Pages).

## Co je v které složce

| Soubor / složka | K čemu slouží |
|---|---|
| `index.html` | hlavní stránka, kostra aplikace |
| `styles.css` | vzhled (barvy, písmo, animace) |
| `app.js` | logika: obrazovky, přehrávač videí, test, uložení postupu |
| `content.js` | **veškerý text kurzu**: moduly, repliky videí, otázky, zásady, kontakty |
| `characters.js` | kreslené postavy Honza a Ozvěna (SVG) |
| `audio/` | zvuky: `1.1-O1.mp3` = video 1.1, Ozvěna, 1. replika; `2.1-L1.mp3` = Honza; `2.1-CH1.mp3` = ťukání chatbota |

## Jak něco upravit

- **Text kurzu nebo repliku ve videu** – otevřete `content.js` v Poznámkovém bloku
  (nebo lépe ve VS Code) a přepište text v uvozovkách. Nic jiného neměňte.
- **Místa k doplnění** jsou v hranatých závorkách: `[NÁZEV ŽADATELE]`,
  `[JMÉNO GARANTA]`, `[PRACOVNÍ DOBA]`, `[TELEFON]`, `[LOGO]`.
  Vyhledejte je (Ctrl+F) v `content.js`, `app.js` a `index.html`.
- **Hranice úspěšnosti testu** – v `content.js` řádek `hraniceTestu: 7`.
- **Nové nahrávky** (paní Jana, pan Tomáš) – uložte je jako MP3 do složky `audio/`
  pod kódem repliky: `2.1-J1.mp3`, `2.1-J2.mp3`, `2.1-J3.mp3`, `2.2-J1.mp3`, `2.3-T1.mp3`.
  Aplikace je najde sama. Dokud soubor chybí, zpráva se jen vypíše na obrazovce.
- **Vzhled postav** – `characters.js` je generovaný soubor; ruční úpravy jsou možné,
  ale snazší je poslat požadavek na změnu (např. jiný účes) a soubor nechat přegenerovat.

## Jak kurz vyzkoušet na vlastním počítači

Poklepejte na `index.html`. Otevře se v prohlížeči a většina věcí funguje.
Zvuky se ale některé prohlížeče zdráhají přehrát přímo z disku. Spolehlivé je
spustit kurz z GitHub Pages (níže) nebo z malého místního serveru:
ve složce kurzu spusťte `python -m http.server` a otevřete `http://localhost:8000`.

## Nahrání na GitHub a zveřejnění zdarma (GitHub Pages)

Postup je bez instalace čehokoli, jen v prohlížeči. Zabere asi 10 minut.

1. **Účet.** Přihlaste se na https://github.com (nebo si založte účet).
2. **Nový repozitář.** Vpravo nahoře klepněte na **+** → **New repository**.
   - Repository name: `stroj-ktery-naslouchá` nebo jednodušeji `kurz-ai`
   - Public (veřejný) – jinak GitHub Pages zdarma nefunguje
   - Nezaškrtávejte „Add a README“ (README už máte).
   - Klepněte na **Create repository**.
3. **Nahrání souborů.** Na stránce nového repozitáře klepněte na odkaz
   **uploading an existing file**.
   - V Průzkumníku otevřete složku `Dokumenty\kurz-AI`, označte **všechno**
     (Ctrl+A) a přetáhněte to do okna prohlížeče. Složka `audio` se nahraje i s obsahem.
   - Dole napište do pole „Commit changes“ třeba `První verze kurzu`
     a klepněte na **Commit changes**. Nahrání trvá chvíli (zvuky mají asi 5 MB).
4. **Zapnutí webu.** V repozitáři klepněte na **Settings** → vlevo **Pages**.
   - Pod „Build and deployment“ zvolte Source: **Deploy from a branch**,
     Branch: **main**, složka **/ (root)** → **Save**.
   - Za minutu či dvě se nahoře objeví adresa ve tvaru
     `https://VASE-JMENO.github.io/kurz-ai/`. Na ní kurz běží.
5. **Každá další změna.** Otevřete v repozitáři soubor (např. `content.js`),
   klepněte na tužku ✏️, upravte, dole **Commit changes**. Web se sám obnoví.
   Nebo nahrajte nové soubory přes **Add file → Upload files**; stejně pojmenované
   se přepíší.

### Chcete to raději z počítače (Git)?

Pokud máte nainstalovaný Git (https://git-scm.com), funguje v příkazovém řádku
ve složce `Dokumenty\kurz-AI`:

```
git init
git add .
git commit -m "První verze kurzu"
git branch -M main
git remote add origin https://github.com/VASE-JMENO/kurz-ai.git
git push -u origin main
```

Při prvním `push` se GitHub zeptá na přihlášení v okně prohlížeče.

## Co je před zveřejněním ještě potřeba

- doplnit texty v hranatých závorkách (žadatel, garant, pracovní doba, logo),
- ověřit telefonní čísla a pracovní dobu Linky seniorů,
- nechat odborného garanta schválit scénáře, zvláště video 3.1 a znění testu,
- ověřit, že číslo 800 123 456 ve videu 2.2 nepatří skutečné službě,
- nahrát hlas paní Jany (4 repliky) a pana Tomáše (1 replika).

## Přístupnost

Velikost písma (tři stupně), předčítání stránky hlasem prohlížeče, titulky a přepis
u každého videa, vypnutí pohybu, ovládání klávesnicí, kontakty na pomoc na každé
obrazovce. Postup kurzem se ukládá jen v prohlížeči účastníka, nikam se neodesílá.
