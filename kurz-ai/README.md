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
| `audio/` | nahrávky replik: `1.1-O1.mp3` = video 1.1, Ozvěna, 1. replika; `2.1-L1.mp3` = Honza; `2.1-CH1.mp3` = ťukání chatbota |
| `audio/smycka-10s.mp3` | náhradní ťukání chatbota, hraje jen když chybí soubor `*-CH*.mp3` |
| `audio/smycka-pomalu-10s.mp3` | ťukání pod psaním člověka (paní Jana, pan Tomáš) |
| `audio/zdroj/` | původní nahrávka klávesnice, ze které jsou smyčky vyrobené |
| `audio/vadne-honza/` | vadné dodané soubory „Honzy“ — viz tamní `CTI-ME.md` |
| `audio/honza-k-namluveni.md` | seznam Honzových replik a názvů souborů |
| `audio/hlasy-k-doplneni.md` | co ještě chybí namluvit (hlas chatbota, 2 repliky Tomáše), vzniká skriptem |
| `audio/zdroj/` | původní nahrávka klávesnice a `jak-vznikly-nahravky.md` |
| `obrazky/` | logo Elpidy ve vektoru, zdrojová PDF ve `zdroj/` |
| `scorm.js` | propojení s LMS; mimo LMS se nic neděje |
| `vypsat-chybejici-hlasy.js` | obnoví seznam chybějících nahrávek |
| `zabalit-scorm.py` | vytvoří SCORM balíček do `dist/` |
| `test-lms.html` | zkušební LMS pro ověření bez Moodlu |

## Logo

Logo Elpidy je v `obrazky/` ve vektoru, takže je ostré v každé velikosti i při tisku.
V hlavičce a na závěrečné kartě videa je barevná verze, při tisku se sama přepne
na černobílou. Znak slouží jako ikona záložky.

| soubor | kde se používá |
|---|---|
| `elpida-logo.svg` | hlavička a závěrečná karta videa |
| `elpida-logo-cb.svg` | černobílá verze pro tisk |
| `elpida-znak.svg` | ikona záložky |
| `elpida-znak.png` | záloha ikony pro starší prohlížeče |
| `zdroj/*.pdf` | vektorové originály, ze kterých SVG vzniklo |

## Nasazení do LMS (SCORM)

Kurz umí mluvit s LMS přes SCORM — **1.2 i 2004 3rd Edition**, správnou verzi si
najde sám. Mimo LMS se nic nemění a kurz běží jako obyčejná stránka.

Hotové balíčky vzniknou do složky `dist/`:

```
python3 zabalit-scorm.py           # SCORM 1.2 (nejširší podpora)
python3 zabalit-scorm.py --2004    # SCORM 2004
```

Skript si seznam souborů i hranici úspěšnosti bere z kurzu, nahrávky ze složky
`audio/` přibalí sám. **Po každé úpravě balíček vytvořte znovu**, jinak v LMS
zůstane stará verze.

### Co kurz do LMS hlásí

| údaj | kdy |
|---|---|
| splněno / nesplněno | po testu, podle hranice `hraniceTestu` (teď 7 z 10 = 70 %) |
| bodové skóre v procentech | po testu |
| dokončeno | když jsou shlédnutá všechna videa a je za sebou test |
| rozdělaný postup | průběžně, aby šlo pokračovat i na jiném počítači |
| kde účastník skončil | průběžně (modul, video nebo test) |
| strávený čas | při zavření kurzu |

`test-lms.html` je zkušební LMS: otevřete ho v prohlížeči a vpravo uvidíte živě,
co kurz hlásí. Adresou `test-lms.html?v=2004` přepnete na SCORM 2004.
Do balíčku se nepřidává.

## Jak něco upravit

- **Text kurzu nebo repliku ve videu** – otevřete `content.js` v Poznámkovém bloku
  (nebo lépe ve VS Code) a přepište text v uvozovkách. Nic jiného neměňte.
- **Místa k doplnění** jsou v hranatých závorkách: `[NÁZEV ŽADATELE]`,
  `[JMÉNO GARANTA]`, `[PRACOVNÍ DOBA]`, `[TELEFON]`, `[LOGO]`.
  Vyhledejte je (Ctrl+F) v `content.js`, `app.js` a `index.html`.
- **Hranice úspěšnosti testu** – v `content.js` řádek `hraniceTestu: 7`.
- **Hlasy: namluveno je Honza (21 replik), paní Jana (4), pan Tomáš (1) a Ozvěna.** Chybí hlas chatbota
  (8 odpovědí) a dvě nové repliky pana Tomáše (`2.3-T2`, `2.3-T3`). Co přesně a pod jakým názvem
  uložit, je v `audio/hlasy-k-doplneni.md`; seznam se obnoví příkazem `node vypsat-chybejici-hlasy.js`.
  Nahrávky Honzy, Jany a Tomáše vznikly z exportu po odstavcích, viz `audio/zdroj/jak-vznikly-nahravky.md`.
  Dodané soubory `*-L*.mp3` byly vadné a jsou odstavené v `audio/vadne-honza/`.
- **Nové nahrávky** – uložte je jako MP3 do složky `audio/` pod kódem repliky (například
  `2.1-J1.mp3`). Aplikace je najde sama; co chybí, se jen zobrazí jako text.
- **Ťukání chatbota** jsou soubory `KÓD-CH*.mp3` (například `2.1-CH1.mp3`). Původní dodané soubory
  byly syntetické: stovky stejných ostrých cvaknutí s jasným pásmem kolem 3,5 kHz, což zní
  strojově až agresivně (původní jsou uschované v `audio/zdroj/chatbot-puvodni/`). Nové vznikly
  z reálné nahrávky klávesnice (`audio/zdroj/klavesnice.mp3`): skládají se z jejích frází
  v náhodném pořadí s mírně měněným tempem, takže se zvuk neopakuje. Mají přesně stejné délky
  jako původní, protože podle nich se načasuje psaní. Hlasitost je o polovinu nižší než původně
  (−31,8 LUFS, hlasy mají −18), špičky omezeny na −12 dB, vysoké tóny mírně zjemněny. Ztlumení je
  zapečené přímo v souborech, protože iPad hlasitost nastavenou v kódu ignoruje.
- **Hlas chatbota** je volitelný soubor `KÓD-hlas.mp3` (například `2.1-CH1-hlas.mp3`). Když existuje,
  chatbot odpověď přečte, psaní se řídí délkou hlasu a pod ním ťuká klávesnice. Bez něj chatbot jen ťuká.
- **Ťukání člověka** (paní Jana, pan Tomáš) zní jako smyčka `smycka-pomalu-10s.mp3` pod jejich hlasem.
  Smyčky jsou bezešvé, vyrobené z téže nahrávky klávesnice a také o polovinu tišší než dříve.
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


## Známá omezení

- **Telefon:** animované plátno videí je na šířce kolem 390 px stísněné a rozhovor v chatu se tam zobrazí jen zčásti.
  Na tabletu a počítači je to v pořádku. Kurz je proto vhodnější pro větší obrazovky.
