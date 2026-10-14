# Stroj, který naslouchá — online kurz

Funkční prototyp informačního online kurzu podle grantového návrhu
*Stroj, který naslouchá — umělá inteligence jako posluchač, rádce a společník*.

Kurz je statická webová stránka: žádný server, žádná databáze, žádné knihovny.
Stačí otevřít `index.html` v prohlížeči nebo nahrát složku `kurz/` na libovolný webhosting.

## Co je hotové

| | |
|---|---|
| **4 moduly** | Kdo mi odpovídá? · Když AI zmate · Komu zavolat · Závěr a test (15 kroků, asi 45 minut) |
| **6 ukázek** | přehrávané rozhovory s chatbotem, ve kterých AI záměrně chybuje |
| **Závěrečný test** | 10 otázek ve třech podobách, s komentářem průvodkyně, lze opakovat |
| **Průvodkyně Ozvěna** | kreslená postava ve čtyřech náladách (vítá, přemýšlí, zvážní, upozorní) |
| **Varovné signály** | zaškrtávací seznam s odkazem na pomoc podle toho, co účastník označí |
| **Kontakty** | linky pomoci na každé obrazovce, odkazy na Elbot a Centrum Elpida |
| **SCORM** | hotový balíček pro Moodle a Elbot, hlásí splnění, skóre i rozdělaný postup |
| **Namluvený výklad** | připravené místo i přehrávání, stopy stačí nakopírovat do `zvuk/` |

## Ukázky místo videí

Návrh počítá s natočenými videi. Dokud nevzniknou, jsou ukázky přehrávané přímo
v prohlížeči: rozhovor se odvíjí v čase, v klíčové chvíli se **sám zastaví** a položí otázku
(„Čeho jste si všimli?“). Oproti videu to má tři výhody — jde upravit v textu, dá se číst
nahlas a funguje i na pomalém připojení.

Ovládání ukázky: přehrát/zastavit · převíjení (myší i šipkami) · titulky **CC** ·
rychlost 1× / 0,75× / 0,5× · **Přepis** celého rozhovoru jako text.

## Namluvený výklad (zvuk)

Kurz umí přehrávat namluvený výklad. Je **nepovinný**: co není nahrané, se prostě
nenabídne, a kurz běží dál jen s textem a syntetickým čtením nahlas.

**Soubory patří do složky `zvuk/`.** Formát MP3, název přesně podle kroku:

| stopa | kde se přehraje |
|---|---|
| `zvuk/m1-uvitani.mp3` | Modul 1 — Dobrý den, jsem Ozvěna |
| `zvuk/m1-co-je-ai.mp3` | Modul 1 — Co je konverzační AI |
| `zvuk/ukazka-1-1.mp3` | ukázka 1.1 Odkud se berou slova |
| `zvuk/m1-dve-strany.mp3` | Modul 1 — Dvě strany téhož rozhovoru |
| `zvuk/m2-uvod.mp3` | Modul 2 — Tři způsoby, jak vás AI zavede |
| `zvuk/ukazka-2-1.mp3` | ukázka 2.1 Přitakávač |
| `zvuk/ukazka-2-2.mp3` | ukázka 2.2 Sebejistý omyl |
| `zvuk/ukazka-2-3.mp3` | ukázka 2.3 Falešný přítel |
| `zvuk/m2-shrnuti.mp3` | Modul 2 — Co si z modulu odnést |
| `zvuk/ukazka-3-1.mp3` | ukázka 3.1 Když AI nestačí |
| `zvuk/m3-signaly.mp3` | Modul 3 — Varovné signály |
| `zvuk/ukazka-3-2.mp3` | ukázka 3.2 První krok |
| `zvuk/m3-kontakty.mp3` | Modul 3 — Kdo co nabízí |
| `zvuk/m4-zasady.mp3` | Modul 4 — Čtyři zásady |

Nahrávat se dá po částech, pořadí nerozhoduje. Do SCORM balíčku se stopy
přibalí samy — po přidání zvuku jen znovu spusťte `zabalit-scorm.py`.

**Co se má namluvit,** je v `zvuk/scenar.md`: ke každé stopě text i časy.
Soubor vzniká z `obsah.js`, takže se po úpravě textů obnovuje:

```
node vypsat-scenar.js
```

### Jak se stopy chovají

- **U textových obrazovek** přibude tlačítko *Poslechnout výklad* s délkou stopy.
- **U ukázek** běží výklad spolu s ukázkou: zastaví se s ní, převíjí se s ní
  i zpomaluje. V ovládání přibude tlačítko, kterým jde výklad vypnout.
- Při odchodu na jinou obrazovku se zvuk sám zastaví a dva hlasy se nepřekrývají
  — spuštění stopy umlčí syntetické čtení nahlas.

Dokud stopa chybí, kurz se po ní jednou podívá a v konzoli prohlížeče zůstane
404. Na chod to nemá vliv, účastník nic nepozná a po nahrání stopy to zmizí.

Aby šel zvuk u ukázek převíjet, musí server odpovídat na `Range` požadavky.
Běžné hostingy i Moodle to umí; nejjednodušší `python3 -m http.server` ne —
tam se ukázka převine, ale zvuk zůstane stát.

## Přístupnost

- tři velikosti písma (A / A / A), volba se pamatuje
- **Přečíst nahlas** přes hlasový výstup prohlížeče (česky)
- **Vypnout animace**; kurz navíc respektuje systémové nastavení `prefers-reduced-motion`
- ovládání z klávesnice včetně časové osy, viditelné zaměření, přeskočení na obsah
- vysoký kontrast, velké plochy tlačítek, žádný text v obrázcích
- titulky i přepis u každé ukázky

## Soubory

```
kurz/
├── index.html         kostra stránky, hlavička a patička s linkami
├── styl.css           vzhled
├── obsah.js           VEŠKERÝ TEXT: moduly, ukázky, otázky testu, kontakty
├── ozvena.js          postava Ozvěna v SVG
├── prehravac.js       přehrávač ukázek
├── kurz.js            logika kurzu, test, ukládání postupu
├── scorm.js           propojení s LMS (mimo LMS se nic neděje)
├── obrazky/           logo Elpidy, zdrojová PDF ve zdroj/
├── zvuk/              namluvený výklad + scenar.md s texty ke čtení
├── vypsat-scenar.js   obnoví zvuk/scenar.md podle obsah.js
├── zabalit-scorm.py   vytvoří SCORM balíček
├── test-lms.html      zkušební LMS pro ověření bez Moodlu
└── dist/              hotové SCORM balíčky k nahrání
```

**Texty se upravují jen v `obsah.js`.** Je to jediný soubor, do kterého musí
sáhnout odborný garant nebo editor; kód zůstává beze změny.

## Co ještě určí zadavatel

V `obsah.js` nahoře v objektu `KONFIG`:

- `hraniceUspechu` — kolik správných odpovědí znamená splněno (teď 8 z 10)
- `telefon`, `pracovniDoba` — kontakt na vlastní linku
- `odkazy` — kam účastníka odkázat dál

Dál zbývá: podoba potvrzení o absolvování a finální ilustrace Ozvěny
(`ozvena.js` je pracovní návrh podle grantového materiálu).

Logo Elpidy je v `obrazky/` jako vektor (SVG), takže je ostré v každé velikosti i při tisku:

| soubor | kde se používá |
|---|---|
| `elpida-logo.svg` | hlavička kurzu |
| `elpida-logo-cb.svg` | černobílá verze, použije se při tisku |
| `elpida-znak.svg` | samotný znak — patička a ikona záložky |
| `elpida-znak.png` | záloha ikony pro starší prohlížeče |
| `zdroj/*.pdf` | vektorové originály, ze kterých SVG vzniklo |

Překryvy v logu jsou udělané přes `mix-blend-mode: multiply` (odtud černý bod
uprostřed). Skupina je izolovaná, takže logo vypadá stejně na jakémkoli pozadí.

## Nasazení do LMS (SCORM)

Kurz umí mluvit s LMS přes SCORM — **1.2 i 2004 3rd Edition**, správnou verzi si najde sám.
Hotové balíčky jsou ve složce `dist/`:

| balíček | pro koho |
|---|---|
| `stroj-ktery-nasloucha-scorm12.zip` | Moodle, Elbot a většina ostatních — **začněte tímto** |
| `stroj-ktery-nasloucha-scorm2004.zip` | když LMS výslovně žádá SCORM 2004 |

V Moodle: *Přidat činnost → SCORM balíček* a ZIP nahrát.

### Nastavení v Moodle, na kterém záleží

| nastavení | doporučení | proč |
|---|---|---|
| **Zobrazit balíček** | *Nové okno*, nebo rámeček aspoň **700 px** | Výchozí rámeček má 500 px. Kurz se mu přizpůsobí a dá se používat, ale na ukázky i test je těsný. |
| **Vynutit nový pokus** | *Nikdy* | Jinak se při každém otevření zahodí rozdělaný postup. |
| **Metoda hodnocení** | *Nejvyšší skóre* | Test je schválně opakovatelný. |
| **Maximální velikost souboru** | musí být větší než balíček | Bez zvuku má balíček 42 kB. S namluveným výkladem poroste na jednotky až desítky MB — pokud nahrání selže, je to tohle a zvedá to správce. |

Zvuk vyexportujte jako mono, kolem 64 kbps. Na mluvené slovo to stačí a balíček
zůstane malý.

**Po každé úpravě textů balíček znovu vytvořte**, jinak v LMS zůstane stará verze:

```
python3 zabalit-scorm.py           # SCORM 1.2
python3 zabalit-scorm.py --2004    # SCORM 2004
```

Skript si seznam souborů i hranici úspěšnosti bere z kurzu, takže manifest
nemůže zůstat pozadu. Do balíčku nepatří tento návod, zdrojová PDF log,
zkušební LMS ani složka `dist/`.

### Co kurz do LMS hlásí

| údaj | kdy |
|---|---|
| splněno / nesplněno | po dokončení testu, podle hranice úspěšnosti |
| bodové skóre v procentech | po dokončení testu (0–100, hranice 80) |
| dokončeno | když má účastník hotové všechny kroky |
| rozdělaný postup | průběžně, aby mohl pokračovat i na jiném počítači |
| kde skončil | průběžně (modul a krok) |
| strávený čas | při zavření kurzu |

### Zkouška bez LMS

`test-lms.html` je zkušební LMS — otevřete ho v prohlížeči a vpravo uvidíte živě,
co kurz hlásí a jaká volání posílá. Adresou `test-lms.html?v=2004` přepnete
na SCORM 2004. Slouží jen k ověření, do balíčku se nepřidává.

## Data a soukromí

Mimo LMS se postup, nastavení písma i zaškrtnuté varovné signály ukládají **jen
do prohlížeče účastníka** (`localStorage`). Kurz nepoužívá cookies ani měření
návštěvnosti a sám nikam nic neodesílá. V LMS jde postup navíc do SCORM, takže
ho účastník najde i na jiném zařízení; co LMS o účastnících uchovává, se řídí
pravidly provozovatele LMS.

## Odborný rámec

Metodika AI Linky seniorů (Elpida) a APA Health Advisory on the Use of Generative AI
Chatbots and Wellness Applications for Mental Health (listopad 2025).
Kurz informuje, neléčí a neposkytuje poradenství.
