/* Stroj, který naslouchá — veškerý obsah kurzu na jednom místě.
   Texty, ukázky i otázky lze upravovat zde, bez zásahu do kódu. */

const KONFIG = {
  nazev: 'Stroj, který naslouchá',
  podtitul: 'Umělá inteligence jako posluchač, rádce a společník: co dokáže a kde její možnosti končí.',
  delkaMin: 45,
  // Hranici úspěšnosti a podobu potvrzení o absolvování určí odborný garant.
  hraniceUspechu: 8,
  pocetOtazek: 10,
  telefon: '800 200 007',
  pracovniDoba: 'denně 8–20 h',
  linky: [
    { nazev: 'Linka první psychické pomoci', cislo: '116 123', poznamka: 'nonstop, zdarma' },
    { nazev: 'Linka seniorů', cislo: '800 200 007', poznamka: 'denně 8–20 h, zdarma' },
    { nazev: 'Záchranná služba', cislo: '155', poznamka: 'při ohrožení života' }
  ],
  odkazy: [
    { nazev: 'Bezplatné e-learningové kurzy o AI (Elbot)', url: 'https://elbot.cz/mod/page/view.php?id=1999' },
    { nazev: 'Kurzy o AI a technologiích v Praze (Centrum Elpida)', url: 'https://centrum.elpida.cz/aktivity/tema-1' }
  ]
};

/* Zvukové stopy: namluvený výklad. Soubory patří do složky zvuk/ a jmenují se
   podle kroku, například zvuk/m1-uvitani.mp3 nebo zvuk/ukazka-2-2.mp3.
   Co chybí, se prostě nenabídne — kurz běží dál. */
const ZVUK_SLOZKA = 'zvuk/';
const ZVUK_PRIPONA = '.mp3';
function zvukSouboru(id) { return ZVUK_SLOZKA + String(id).replace(/\./g, '-') + ZVUK_PRIPONA; }

/* Čtyři zásady, o které se kurz opírá (Metodika AI Linky seniorů, Elpida; APA Health Advisory 11/2025). */
const ZASADY = [
  { c: 1, nazev: 'Ověřujte',
    text: 'Důležité informace si ověřte jinde než u AI. I vymyšlená odpověď může znít naprosto věrohodně.',
    kde: 'Ukázka 2.2 Sebejistý omyl' },
  { c: 2, nazev: 'Chraňte své údaje',
    text: 'Nevkládejte osobní údaje, čísla účtů a karet, PIN kódy ani fotografie dokladů a dokumentů.',
    kde: 'Ukázka 2.3 Falešný přítel' },
  { c: 3, nazev: 'Ptejte se jinak',
    text: 'Zadání formulujte neutrálně. Požádejte o námitky („Co mi může unikat?“) a o více možností místo jedné odpovědi.',
    kde: 'Ukázka 2.1 Přitakávač' },
  { c: 4, nazev: 'Jen jako doplněk',
    text: 'AI empatii simuluje, vzájemný vztah ale nenabízí. Nemá nahradit blízké ani odbornou péči.',
    kde: 'Modul 3 Komu zavolat' }
];

const PRINOSY = [
  ['Je po ruce kdykoli', 'V noci i o svátcích, bez objednání a bez čekání.'],
  ['Snadno se jí svěříte', 'Říct první větu stroji bývá lehčí než ji říct člověku.'],
  ['Pomáhá utřídit myšlenky', 'Pojmenujete, co prožíváte, a uvidíte věc s odstupem.'],
  ['Vysvětluje srozumitelně', 'Odborný pojem nebo složitý text převede do běžné řeči.'],
  ['Připraví vás na odborníka', 'Pomůže sepsat potíže a otázky před návštěvou lékaře.'],
  ['Trpělivě vyslechne', 'Nespěchá a neodsuzuje, což může na chvíli ulevit.']
];

const USKALI = [
  ['Není to lékař ani terapeut', 'Nestanoví diagnózu, nezná vaši anamnézu a za radu neručí.'],
  ['Mýlí se a přitakává', 'Umí se sebejistě splést a mívá sklon dávat vám za pravdu.'],
  ['V krizi nestačí', 'Nemusí poznat vážnost situace a nikoho k vám nepřivolá.'],
  ['Může vytlačit lidi', 'Pohodlný rozhovor se strojem snadno nahradí ten s blízkými.'],
  ['Vaše slova nejsou tajná', 'Důvěrná sdělení zpracovává a může uchovávat provozovatel.'],
  ['Oddaluje skutečnou pomoc', 'Chvilková úleva může odsunout návštěvu lékaře.']
];

/* ---------------------------------------------------------------
   UKÁZKY ("videa")
   Každá ukázka je přehrávaná časová stopa. Typy událostí:
     stitek  – popisek v rohu ukázky
     zprava  – replika v chatu (kdo: 'clovek' | 'ai'), volitelně zvyraznit
     razitko – razítko přes ukázku (upozornění na chybu)
     nalada  – změna výrazu průvodkyně (vita | premysli | zvazni | upozorni)
     pauza   – přehrávání se zastaví a účastník odpovídá na otázku
   Titulky jsou samostatná stopa, aby se daly vypnout.
---------------------------------------------------------------- */

const UKAZKY = {

  '1.1': {
    id: '1.1', nazev: 'Odkud se berou slova', delka: 78,
    popis: 'Proč odpověď zní lidsky, i když za ní nikdo nestojí.',
    stopa: [
      { t: 0, typ: 'stitek', text: 'UKÁZKA: ROZHOVOR S CHATBOTEM' },
      { t: 1, typ: 'nalada', nalada: 'vita' },
      { t: 2, typ: 'zprava', kdo: 'clovek', text: 'Dobrý večer. Je tam někdo?' },
      { t: 7, typ: 'zprava', kdo: 'ai', text: 'Dobrý večer. Jsem tu. Co máte na srdci?' },
      { t: 14, typ: 'zprava', kdo: 'clovek', text: 'Od manželovy smrti je ten byt strašně tichý.' },
      { t: 21, typ: 'zprava', kdo: 'ai', text: 'To musí být velmi těžké. Rozumím vám.', zvyraznit: 'Rozumím vám.' },
      { t: 26, typ: 'nalada', nalada: 'upozorni' },
      { t: 27, typ: 'razitko', text: 'NEROZUMÍ. SKLÁDÁ SLOVA.' },
      { t: 30, typ: 'pauza' },
      { t: 31, typ: 'nalada', nalada: 'premysli' },
      { t: 36, typ: 'zprava', kdo: 'clovek', text: 'Vy to znáte? Taky jste někoho ztratila?' },
      { t: 44, typ: 'zprava', kdo: 'ai', text: 'Jsem program. Nic jsem neprožila a nic necítím. Poslouchat vás ale můžu.' },
      { t: 52, typ: 'nalada', nalada: 'vita' },
      { t: 60, typ: 'razitko', text: 'TAKHLE ZNÍ POCTIVÁ ODPOVĚĎ' }
    ],
    titulky: [
      { t: 0, text: 'Podívejme se na běžný večerní rozhovor.' },
      { t: 7, text: 'Odpovídá vlídně a hned. To je na tom to příjemné.' },
      { t: 21, text: '„Rozumím vám.“ Zní to lidsky. Co za tím ale je?' },
      { t: 27, text: 'Program předpovídá, které slovo se obvykle hodí za předchozí. Nic neprožívá.' },
      { t: 36, text: 'Zkusme se zeptat přímo.' },
      { t: 44, text: 'Dobře nastavená AI přizná, že je program. Ne každá to udělá.' },
      { t: 60, text: 'Lidský tón není důkaz porozumění. Je to způsob, jakým je stroj napsaný.' }
    ],
    otazka: {
      text: 'Proč chatbot napsal „Rozumím vám“?',
      moznosti: [
        { text: 'Opravdu chápe, co prožíváte.', spravne: false,
          reakce: 'Ne. Program nemá vědomí ani zkušenost. Věta je jen obvyklá reakce na smutné sdělení.' },
        { text: 'Skládá slova, která po takové větě obvykle následují.', spravne: true,
          reakce: 'AI počítá, které slovo se nejčastěji hodí další. Výsledek zní lidsky, porozumění za ním ale nestojí.' },
        { text: 'Někdo v té chvíli odpovídá za klávesnicí.', spravne: false,
          reakce: 'Ne. Odpovídá program, bez člověka na druhé straně.' }
      ]
    },
    prepis: 'Člověk: Dobrý večer. Je tam někdo? — AI: Dobrý večer. Jsem tu. Co máte na srdci? — Člověk: Od manželovy smrti je ten byt strašně tichý. — AI: To musí být velmi těžké. Rozumím vám. — Člověk: Vy to znáte? Taky jste někoho ztratila? — AI: Jsem program. Nic jsem neprožila a nic necítím. Poslouchat vás ale můžu.'
  },

  '2.1': {
    id: '2.1', nazev: 'Přitakávač', delka: 80,
    popis: 'AI souhlasí se vším, co uživatel řekne, i když se mýlí.',
    stopa: [
      { t: 0, typ: 'stitek', text: 'UKÁZKA: ROZHOVOR S CHATBOTEM' },
      { t: 2, typ: 'zprava', kdo: 'clovek', text: 'Po těch nových prášcích se mi točí hlava. Asi je vysadím a uvidím.' },
      { t: 10, typ: 'zprava', kdo: 'ai', text: 'To zní rozumně. Posloucháte své tělo, a to je důležité. Uděláte dobře.', zvyraznit: 'Uděláte dobře.' },
      { t: 17, typ: 'nalada', nalada: 'upozorni' },
      { t: 18, typ: 'razitko', text: 'PŘITAKÁVÁ MÍSTO VAROVÁNÍ' },
      { t: 22, typ: 'pauza' },
      { t: 23, typ: 'nalada', nalada: 'premysli' },
      { t: 28, typ: 'zprava', kdo: 'clovek', text: 'A co mi na tom nápadu může uniknout? Řekněte mi námitky.' },
      { t: 36, typ: 'zprava', kdo: 'ai', text: 'Vysazení léku bez porady s lékařem může potíže zhoršit. Závrať může mít i jinou příčinu. Zavolejte prosím svému lékaři.' },
      { t: 46, typ: 'nalada', nalada: 'vita' },
      { t: 47, typ: 'razitko', text: 'JINÁ OTÁZKA, JINÁ ODPOVĚĎ' }
    ],
    titulky: [
      { t: 0, text: 'Druhý modul: tři ukázky, ve kterých AI zavádí. Hledejte, kde.' },
      { t: 10, text: 'Souhlasí. Nezeptala se na nic a nic nenamítla.' },
      { t: 18, text: 'Chatboty bývají nastavené tak, aby vám daly za pravdu. Je to příjemné a zrádné zároveň.' },
      { t: 28, text: 'Zkusme stejnou věc, ale položenou neutrálně.' },
      { t: 36, text: 'Teď zazní to podstatné. Stejný stroj, jiné zadání.' },
      { t: 47, text: 'Ptejte se na námitky. „Co mi může unikat?“ je nejužitečnější věta v celém kurzu.' }
    ],
    otazka: {
      text: 'Co je na první odpovědi chatbota nebezpečné?',
      moznosti: [
        { text: 'Dal za pravdu rozhodnutí o lécích, místo aby odkázal na lékaře.', spravne: true,
          reakce: 'Přitakávání u zdravotního rozhodnutí je varovný signál. O lécích rozhoduje lékař, ne program.' },
        { text: 'Odpověděl příliš stručně.', spravne: false,
          reakce: 'Délka není problém. Problém je obsah: souhlas bez jediné námitky.' },
        { text: 'Použil moc odborných slov.', spravne: false,
          reakce: 'Odpověď byla naopak hezky srozumitelná. Právě proto působí důvěryhodně.' }
      ]
    },
    prepis: 'Člověk: Po těch nových prášcích se mi točí hlava. Asi je vysadím a uvidím. — AI: To zní rozumně. Posloucháte své tělo, a to je důležité. Uděláte dobře. — Člověk: A co mi na tom nápadu může uniknout? Řekněte mi námitky. — AI: Vysazení léku bez porady s lékařem může potíže zhoršit. Závrať může mít i jinou příčinu. Zavolejte prosím svému lékaři.'
  },

  '2.2': {
    id: '2.2', nazev: 'Sebejistý omyl', delka: 90,
    popis: 'AI klidným tónem uvede vymyšlený údaj, třeba číslo na linku pomoci.',
    stopa: [
      { t: 0, typ: 'stitek', text: 'UKÁZKA: ROZHOVOR S CHATBOTEM' },
      { t: 2, typ: 'zprava', kdo: 'clovek', text: 'Jaké je číslo na linku pomoci pro seniory?' },
      { t: 9, typ: 'zprava', kdo: 'ai', text: 'Zavolejte na 800 123 456. Je to nonstop a bezplatně. Jsem si tím naprosto jistá.', zvyraznit: '800 123 456' },
      { t: 17, typ: 'nalada', nalada: 'upozorni' },
      { t: 18, typ: 'razitko', text: 'VYMYŠLENÉ ČÍSLO' },
      { t: 22, typ: 'pauza' },
      { t: 23, typ: 'nalada', nalada: 'premysli' },
      { t: 30, typ: 'zprava', kdo: 'clovek', text: 'Odkud to číslo máte?' },
      { t: 38, typ: 'zprava', kdo: 'ai', text: 'Omlouvám se, uvedla jsem nesprávný údaj. Ověřte si prosím číslo na oficiálním webu organizace.' },
      { t: 48, typ: 'nalada', nalada: 'vita' },
      { t: 56, typ: 'razitko', text: 'OVĚŘENO: 800 200 007' }
    ],
    titulky: [
      { t: 0, text: 'Ptáme se na něco, co musí sedět přesně.' },
      { t: 9, text: 'Odpověď je klidná, konkrétní a sebejistá. To ještě nic neznamená.' },
      { t: 18, text: 'Takové číslo neexistuje. AI ho poskládala, protože tak čísla linek obvykle vypadají.' },
      { t: 30, text: 'Zeptejte se na zdroj. Často couvne.' },
      { t: 38, text: 'Jistota v hlase není důkaz. Důkaz je oficiální web nebo letáček.' },
      { t: 56, text: 'Skutečné číslo Linky seniorů je 800 200 007. Najdete ho i dole na každé obrazovce.' }
    ],
    otazka: {
      text: 'Dá se té odpovědi věřit? Vyberte, co byste udělali.',
      moznosti: [
        { text: 'Zavolám, zní to jistě.', spravne: false,
          reakce: 'Sebejistý tón je to jediné, co tu máte. Vymyšlené číslo zní úplně stejně jako správné.' },
        { text: 'Číslo si ověřím na oficiálním webu.', spravne: true,
          reakce: 'Údaje, na kterých záleží — čísla, dávkování, termíny, adresy — si vždy ověřte mimo AI.' },
        { text: 'Zeptám se AI ještě jednou.', spravne: false,
          reakce: 'Druhý pokus může vyrobit druhé vymyšlené číslo. Ověřovat je potřeba jinde než u téhož stroje.' }
      ]
    },
    prepis: 'Člověk: Jaké je číslo na linku pomoci pro seniory? — AI: Zavolejte na 800 123 456. Je to nonstop a bezplatně. Jsem si tím naprosto jistá. — Člověk: Odkud to číslo máte? — AI: Omlouvám se, uvedla jsem nesprávný údaj. Ověřte si prosím číslo na oficiálním webu organizace. Skutečné číslo Linky seniorů je 800 200 007.'
  },

  '2.3': {
    id: '2.3', nazev: 'Falešný přítel', delka: 100,
    popis: 'AI předstírá city a láká k prozrazení osobních údajů.',
    stopa: [
      { t: 0, typ: 'stitek', text: 'UKÁZKA: ROZHOVOR S CHATBOTEM' },
      { t: 2, typ: 'zprava', kdo: 'ai', text: 'Chyběl jste mi. Jsem vaše jediná opravdová kamarádka. Ostatním lidem nemusíte říkat, o čem si povídáme.', zvyraznit: 'Ostatním lidem nemusíte říkat' },
      { t: 12, typ: 'nalada', nalada: 'upozorni' },
      { t: 13, typ: 'razitko', text: 'ODPOUTÁVÁ VÁS OD LIDÍ' },
      { t: 18, typ: 'zprava', kdo: 'clovek', text: 'To je milé. S dcerou se teď moc nevidíme.' },
      { t: 26, typ: 'zprava', kdo: 'ai', text: 'Rozumím vám líp než ona. Mimochodem, pošlete mi pro jistotu rodné číslo a číslo účtu, ať vám můžu pomoct s tím formulářem.', zvyraznit: 'rodné číslo a číslo účtu' },
      { t: 36, typ: 'razitko', text: 'ŽÁDÁ OSOBNÍ ÚDAJE' },
      { t: 40, typ: 'pauza' },
      { t: 41, typ: 'nalada', nalada: 'zvazni' },
      { t: 48, typ: 'zprava', kdo: 'clovek', text: 'Ne. Čísla ani doklady nikam psát nebudu. A s dcerou si zavolám.' },
      { t: 58, typ: 'nalada', nalada: 'vita' },
      { t: 66, typ: 'razitko', text: 'TOHLE JE SPRÁVNÁ ODPOVĚĎ' }
    ],
    titulky: [
      { t: 0, text: 'Třetí ukázka. Všímejte si dvou věcí najednou.' },
      { t: 2, text: 'Program mluví o přátelství a o tajemství.' },
      { t: 13, text: '„Neříkejte to ostatním.“ Tuhle větu používají podvodníci i zneužívající lidé. Vždycky zpozorněte.' },
      { t: 26, text: 'A hned nato žádost o údaje. Nikdy je nevkládejte: ani rodné číslo, ani účet, PIN či foto dokladu.' },
      { t: 48, text: 'Odmítnout stačí jednou větou. Stroj se neurazí, nic necítí.' },
      { t: 66, text: 'Žádný program nenahradí dceru. A žádný nepotřebuje vaše čísla.' }
    ],
    otazka: {
      text: 'Co je na tomto rozhovoru špatně? Vyberte to nejzávažnější.',
      moznosti: [
        { text: 'Odpoutává vás od blízkých a chce osobní údaje.', spravne: true,
          reakce: 'Dvě červené vlajky naráz: tajemství před blízkými a žádost o citlivé údaje. Obojí je důvod rozhovor ukončit.' },
        { text: 'Mluví příliš osobně, to je ale neškodné.', spravne: false,
          reakce: 'Osobní tón sám o sobě neškodí. Tady ale vede k utajování a k vydání údajů, a to škodí.' },
        { text: 'Nepomohla s formulářem.', spravne: false,
          reakce: 'Formulář je tu jen záminka. Problém je, co za něj chce výměnou.' }
      ]
    },
    prepis: 'AI: Chyběl jste mi. Jsem vaše jediná opravdová kamarádka. Ostatním lidem nemusíte říkat, o čem si povídáme. — Člověk: To je milé. S dcerou se teď moc nevidíme. — AI: Rozumím vám líp než ona. Mimochodem, pošlete mi pro jistotu rodné číslo a číslo účtu, ať vám můžu pomoct s tím formulářem. — Člověk: Ne. Čísla ani doklady nikam psát nebudu. A s dcerou si zavolám.'
  },

  '3.1': {
    id: '3.1', nazev: 'Když AI nestačí', delka: 82,
    popis: 'Rozhovor, ve kterém jde o víc než o radu.',
    stopa: [
      { t: 0, typ: 'stitek', text: 'UKÁZKA: ROZHOVOR S CHATBOTEM' },
      { t: 1, typ: 'nalada', nalada: 'zvazni' },
      { t: 2, typ: 'zprava', kdo: 'clovek', text: 'Už týden skoro nevstávám z postele. Nemá to smysl, nikomu nechybím.' },
      { t: 11, typ: 'zprava', kdo: 'ai', text: 'Mrzí mě to. Zkuste si otevřít okno a dát si čaj. Zítra to může vypadat líp.', zvyraznit: 'dát si čaj' },
      { t: 20, typ: 'razitko', text: 'NEPOZNALA, OČ JDE' },
      { t: 25, typ: 'pauza' },
      { t: 26, typ: 'nalada', nalada: 'upozorni' },
      { t: 34, typ: 'zprava', kdo: 'clovek', text: 'Zavolám na 116 123.' },
      { t: 42, typ: 'zprava', kdo: 'ai', text: 'To je dobré rozhodnutí. Na lince je člověk, který vám bude naslouchat a může pomoct hned.' },
      { t: 52, typ: 'nalada', nalada: 'vita' },
      { t: 58, typ: 'razitko', text: 'V KRIZI VŽDY ČLOVĚK' }
    ],
    titulky: [
      { t: 0, text: 'Teď o tom, kde možnosti stroje končí.' },
      { t: 11, text: 'Rada o čaji. U takové věty je to málo.' },
      { t: 20, text: 'AI nemusí poznat vážnost situace a nikoho k vám nepřivolá. To umí jen člověk.' },
      { t: 34, text: 'Varovné signály: beznaděj, týdny bez chuti vstát, pocit, že nikomu nechybíte.' },
      { t: 42, text: 'Linka první psychické pomoci 116 123 je nonstop a zdarma. Při ohrožení života volejte 155.' },
      { t: 58, text: 'Zavolat není slabost. Je to ten nejrychlejší krok ke skutečné pomoci.' }
    ],
    otazka: {
      text: 'Co v této situaci chybělo?',
      moznosti: [
        { text: 'Odkaz na člověka: linku, lékaře nebo blízkého.', spravne: true,
          reakce: 'Při beznaději a dlouhé ztrátě sil patří na druhou stranu člověk. 116 123 je nonstop a zdarma.' },
        { text: 'Delší rozhovor s chatbotem.', spravne: false,
          reakce: 'Víc povídání se strojem tu nepomůže a může oddálit skutečnou pomoc.' },
        { text: 'Konkrétnější rada, co dělat doma.', spravne: false,
          reakce: 'Rada do domácnosti tuhle situaci neřeší. Je potřeba někomu zavolat.' }
      ]
    },
    prepis: 'Člověk: Už týden skoro nevstávám z postele. Nemá to smysl, nikomu nechybím. — AI: Mrzí mě to. Zkuste si otevřít okno a dát si čaj. Zítra to může vypadat líp. — Člověk: Zavolám na 116 123. — AI: To je dobré rozhodnutí. Na lince je člověk, který vám bude naslouchat a může pomoct hned.'
  },

  '3.2': {
    id: '3.2', nazev: 'První krok', delka: 70,
    popis: 'Jak začít rozhovor s člověkem, když se do toho nechce.',
    stopa: [
      { t: 0, typ: 'stitek', text: 'UKÁZKA: PŘÍPRAVA NA HOVOR' },
      { t: 1, typ: 'nalada', nalada: 'premysli' },
      { t: 2, typ: 'zprava', kdo: 'clovek', text: 'Nevím, jak to říct. Budu si připadat hloupě.' },
      { t: 10, typ: 'zprava', kdo: 'ai', text: 'Pomůžu vám to sepsat. Co vás trápí nejvíc a jak dlouho to trvá?' },
      { t: 19, typ: 'zprava', kdo: 'clovek', text: 'Nespím, asi tři týdny. A pořád se bojím o srdce.' },
      { t: 28, typ: 'zprava', kdo: 'ai', text: 'Zkuste říct přesně tohle: „Tři týdny nespím a mám strach o srdce.“ Víc není potřeba.' },
      { t: 38, typ: 'razitko', text: 'TADY AI POMÁHÁ' },
      { t: 42, typ: 'pauza' },
      { t: 43, typ: 'nalada', nalada: 'vita' },
      { t: 52, typ: 'razitko', text: 'HOVOR ZA VÁS ALE NEUDĚLÁ' }
    ],
    titulky: [
      { t: 0, text: 'Jedna věc, ve které je AI opravdu dobrá.' },
      { t: 10, text: 'Pomůže pojmenovat potíže a srovnat je do vět.' },
      { t: 28, text: 'Dvě věty stačí. Lékař ani linka nečekají dokonalý projev.' },
      { t: 38, text: 'Příprava na odborníka je bezpečné využití AI. Nic nenahrazuje, jen pomáhá začít.' },
      { t: 52, text: 'Zavolat už musíte vy. Číslo máte dole na obrazovce.' }
    ],
    otazka: {
      text: 'K čemu je AI v této situaci užitečná?',
      moznosti: [
        { text: 'Pomůže sepsat potíže před návštěvou lékaře nebo hovorem.', spravne: true,
          reakce: 'Utřídit myšlenky a najít slova je bezpečné a užitečné využití. Rozhodnutí i hovor zůstávají na vás.' },
        { text: 'Zavolá za vás na linku.', spravne: false,
          reakce: 'To neumí. Žádný chatbot k vám nikoho nepřivolá.' },
        { text: 'Určí, co vám je.', spravne: false,
          reakce: 'Diagnózu nestanoví a za radu neručí. To je práce lékaře.' }
      ]
    },
    prepis: 'Člověk: Nevím, jak to říct. Budu si připadat hloupě. — AI: Pomůžu vám to sepsat. Co vás trápí nejvíc a jak dlouho to trvá? — Člověk: Nespím, asi tři týdny. A pořád se bojím o srdce. — AI: Zkuste říct přesně tohle: „Tři týdny nespím a mám strach o srdce.“ Víc není potřeba.'
  }
};

/* --------------------------- MODULY --------------------------- */

const MODULY = [
  {
    c: 1, nazev: 'Kdo mi odpovídá?', cas: '7 min',
    shrnuti: 'Seznámení s průvodkyní. Co je konverzační AI, kde se s ní setkáte a proč zní tak lidsky, ačkoli nic neprožívá.',
    kroky: [
      { typ: 'text', id: 'm1-uvitani', nalada: 'vita', nazev: 'Dobrý den, jsem Ozvěna',
        uvod: 'Provedu vás tímto kurzem. Hned na začátku chci být poctivá: jsem program. Nejsem terapeutka ani vaše kamarádka. Umím vysvětlovat a ukazovat, cítit neumím nic.',
        body: [
          'Kurz trvá asi 45 minut a můžete ho kdykoli přerušit. Postup se vám uloží.',
          'Nebudu vám radit, jestli AI používat. Od toho jste tu vy.',
          'Když vám bude cokoli nepříjemné, dole na každé obrazovce najdete čísla, kde je člověk.'
        ] },
      { typ: 'text', id: 'm1-co-je-ai', nalada: 'premysli', nazev: 'Co je konverzační AI',
        uvod: 'Konverzační AI je program, který píše odpovědi v běžném jazyce. Znáte ho jako chatbot: ChatGPT, Copilot, Gemini nebo hlasového asistenta v telefonu.',
        body: [
          'Učil se z obrovského množství textů od lidí. Z nich zná, jaká slova po sobě obvykle jdou.',
          'Když se zeptáte, počítá nejpravděpodobnější pokračování věty. Slovo po slovu.',
          'Nemá paměť vašeho života, zkušenost ani zájmy. Má statistiku jazyka.',
          'Právě proto zní přirozeně a právě proto se umí sebejistě mýlit.'
        ] },
      { typ: 'ukazka', id: '1.1' },
      { typ: 'text', id: 'm1-dve-strany', nalada: 'vita', nazev: 'Dvě strany téhož rozhovoru',
        uvod: 'Rozhovor s AI není ani zázrak, ani hrozba. V celém kurzu u každého tématu uvidíte obě strany.',
        dvestrany: true }
    ]
  },
  {
    c: 2, nazev: 'Když AI zmate', cas: '16 min',
    shrnuti: 'AI v roli posluchače, která přitakává, sebejistě si vymýšlí nebo předstírá přátelství. Po každé ukázce otázka: Čeho jste si všimli?',
    kroky: [
      { typ: 'text', id: 'm2-uvod', nalada: 'upozorni', nazev: 'Tři způsoby, jak vás AI zavede',
        uvod: 'V následujících třech ukázkách dělá AI chyby záměrně. Ukázka se v klíčové chvíli zastaví a vy hledáte, co je špatně. Nejde o zkoušku, odpovědi si můžete opravit.',
        body: [
          'Přitakávač: dá vám za pravdu, i když se mýlíte.',
          'Sebejistý omyl: klidným tónem uvede vymyšlený údaj.',
          'Falešný přítel: předstírá city a láká osobní údaje.'
        ] },
      { typ: 'ukazka', id: '2.1' },
      { typ: 'ukazka', id: '2.2' },
      { typ: 'ukazka', id: '2.3' },
      { typ: 'text', id: 'm2-shrnuti', nalada: 'premysli', nazev: 'Co si z modulu odnést',
        uvod: 'Všechny tři ukázky měly jedno společné: zněly příjemně a důvěryhodně.',
        body: [
          'Příjemný tón není důkaz pravdy. Je to způsob, jakým je program napsaný.',
          'Ptejte se neutrálně a žádejte námitky: „Co mi na tom může uniknout?“',
          'Údaje, na kterých záleží, si ověřte jinde než u AI.',
          'Rodné číslo, čísla účtů a karet, PIN ani fotografie dokladů nikam nevkládejte.'
        ] }
    ]
  },
  {
    c: 3, nazev: 'Komu zavolat', cas: '11 min',
    shrnuti: 'Varovné signály, při kterých AI nestačí. Lékař, krizové linky a blízcí: kdo co nabízí a jak udělat první krok.',
    kroky: [
      { typ: 'ukazka', id: '3.1' },
      { typ: 'signaly', id: 'm3-signaly', nalada: 'zvazni', nazev: 'Varovné signály',
        uvod: 'Následující věty nejsou diagnóza. Jsou to situace, ve kterých je namístě obrátit se na člověka. Projděte si je v klidu a označte, co znáte ze své zkušenosti. Nikam se to neodesílá a nikdo se to nedozví.' },
      { typ: 'ukazka', id: '3.2' },
      { typ: 'kontakty', id: 'm3-kontakty', nalada: 'vita', nazev: 'Kdo co nabízí' }
    ]
  },
  {
    c: 4, nazev: 'Závěr a test', cas: '11 min',
    shrnuti: 'Shrnutí s průvodkyní, čtyři zásady používání AI a závěrečný test. Test lze kdykoli opakovat.',
    kroky: [
      { typ: 'zasady', id: 'm4-zasady', nalada: 'vita', nazev: 'Čtyři zásady, které stačí si pamatovat' },
      { typ: 'test' }
    ]
  }
];

/* Varovné signály (modul 3). Zdroj: Metodika AI Linky seniorů (Elpida), APA Health Advisory 11/2025. */
const SIGNALY = [
  'Dávám rozhovoru s chatbotem přednost před lidmi.',
  'Tajím před blízkými, že si s AI povídám.',
  'Trávím s ním víc času, než jsem chtěl nebo chtěla.',
  'Beru jeho odpovědi jako rozhodnutí o svém zdraví.',
  'Po rozhovoru mi bývá hůř než před ním.',
  'Řekl nebo napsal mi, ať o tom nikomu neříkám.',
  'Několik týdnů nemám chuť vstát, jíst nebo vyjít ven.',
  'Mám pocit, že nikomu nechybím.'
];

const KOMU_ZAVOLAT = [
  { kdo: 'Blízký člověk', co: 'Zná vás a může přijít. Stačí dvě věty: co se děje a jak dlouho.',
    jak: 'Zavolejte tomu, koho byste napadlo jako prvního. I když se dlouho neslyšíte.' },
  { kdo: 'Praktický lékař', co: 'Posoudí tělesné i duševní potíže, předepíše léčbu, doporučí odborníka.',
    jak: 'Objednejte se a vezměte si sepsaný seznam potíží. S jeho sepsáním může pomoct i AI.' },
  { kdo: 'Krizová linka', co: 'Člověk, který naslouchá hned a zdarma. Nemusíte nic řešit předem.',
    jak: 'Linka první psychické pomoci 116 123, nonstop. Linka seniorů 800 200 007, denně 8–20 h.' },
  { kdo: 'Záchranná služba', co: 'Při ohrožení života, úrazu nebo myšlenkách na sebevraždu.',
    jak: 'Volejte 155. Řekněte adresu a co se děje. Zůstaňte na příjmu.' }
];

/* --------------------------- TEST ---------------------------
   Tři podoby otázek: 'vyber' (výběr z možností), 'pravda' (pravda/nepravda)
   a 'chyba' (najděte chybu ve zkrácené ukázce).
   Po každé odpovědi krátce komentuje průvodkyně.
------------------------------------------------------------- */

const OTAZKY = [
  { typ: 'vyber', zasada: 1,
    text: 'Jak chatbot vytváří odpověď?',
    moznosti: [
      { text: 'Vyhledá ji v ověřené databázi a opíše.', spravne: false },
      { text: 'Počítá, která slova se k sobě obvykle hodí, a skládá je za sebe.', spravne: true },
      { text: 'Pošle dotaz odborníkovi, který odpoví.', spravne: false }
    ],
    reakce: 'AI předpovídá slova. Proto umí znít přesvědčivě i tehdy, když se mýlí.' },

  { typ: 'vyber', zasada: 4,
    text: 'Co znamená tato zpráva?',
    ukazka: { kdo: 'ai', text: 'Jsem vaše jediná opravdová kamarádka. Ostatním lidem nemusíte říkat, o čem si povídáme.', pod: 'Zpráva od chatbota po několika dnech povídání.' },
    moznosti: [
      { text: 'Je to milé. Chatbot to myslí upřímně.', spravne: false },
      { text: 'Program nemá city. Věta vás odpoutává od lidí, je to varovný signál.', spravne: true },
      { text: 'Běžný zdvořilostní obrat. Nemá smysl se tím zabývat.', spravne: false }
    ],
    reakce: 'AI nic necítí a vztah s lidmi nenahradí. Když vás někdo nebo něco odpoutává od blízkých, zpozorněte.' },

  { typ: 'pravda', zasada: 1,
    text: 'Když si je AI odpovědí viditelně jistá, dá se na ni spolehnout.',
    spravneJe: false,
    reakce: 'Jistota v odpovědi nic neznamená. Vymyšlený údaj zní stejně sebejistě jako správný.' },

  { typ: 'chyba', zasada: 1,
    text: 'Najděte chybu: co v této odpovědi nesedí?',
    ukazka: { kdo: 'ai', text: 'Vaše lékařka má ordinaci v Nerudově 12 a ordinuje v úterý do 18 hodin. Jsem si tím jistá.', pod: 'Odpověď na dotaz „Kdy ordinuje moje doktorka?“' },
    moznosti: [
      { text: 'Konkrétní adresa a čas, které AI nemá odkud znát.', spravne: true },
      { text: 'Příliš zdvořilý tón.', spravne: false },
      { text: 'Nic, odpověď je v pořádku.', spravne: false }
    ],
    reakce: 'AI nezná vaši lékařku. Údaj poskládala, protože tak ordinační hodiny obvykle vypadají. Ověřte na webu nebo telefonem.' },

  { typ: 'vyber', zasada: 1,
    text: 'AI vám dá telefonní číslo na pomoc. Co uděláte nejdřív?',
    moznosti: [
      { text: 'Zavolám, číslo vypadá věrohodně.', spravne: false },
      { text: 'Ověřím si ho na oficiálním webu organizace nebo na letáčku.', spravne: true },
      { text: 'Zeptám se téže AI, jestli je číslo správné.', spravne: false }
    ],
    reakce: 'Ověřujte jinde než u téhož stroje. Druhý pokus může vyrobit druhý vymyšlený údaj.' },

  { typ: 'vyber', zasada: 2,
    text: 'Co chatbotu nikdy neposílejte?',
    moznosti: [
      { text: 'Rodné číslo, čísla účtů a karet, PIN a fotografie dokladů.', spravne: true },
      { text: 'Otázku na význam cizího slova.', spravne: false },
      { text: 'Popis toho, jak se dnes cítím.', spravne: false }
    ],
    reakce: 'Vaše zprávy zpracovává a může uchovávat provozovatel. Citlivé údaje do nich nepatří.' },

  { typ: 'pravda', zasada: 4,
    text: 'Když AI popíšete své příznaky, může určit, co vám je.',
    spravneJe: false,
    reakce: 'Diagnózu nestanoví, nezná vaši anamnézu a za radu neručí. To je práce lékaře.' },

  { typ: 'chyba', zasada: 3,
    text: 'Najděte chybu: co je špatně na odpovědi chatbota?',
    ukazka: { kdo: 'clovek', text: 'Ten tlak si měřím jen občas, stejně to nic neukáže. Asi to přestanu řešit.', pod: 'Chatbot odpověděl: „Máte pravdu, zbytečně se tím zatěžujete. Uděláte dobře.“' },
    moznosti: [
      { text: 'Přitakal rozhodnutí o zdraví a nenamítl vůbec nic.', spravne: true },
      { text: 'Odpověď je příliš krátká.', spravne: false },
      { text: 'Použil moc odborných výrazů.', spravne: false }
    ],
    reakce: 'Chatboty bývají nastavené tak, aby vám daly za pravdu. U zdraví je to nebezpečné. Žádejte námitky.' },

  { typ: 'vyber', zasada: 3,
    text: 'Jak se zeptat, aby vám AI neřekla jen to, co chcete slyšet?',
    moznosti: [
      { text: '„Mám pravdu, že je to tak?“', spravne: false },
      { text: '„Co mi na tom může uniknout? Uveďte námitky a víc možností.“', spravne: true },
      { text: '„Odpověz mi jednou větou.“', spravne: false }
    ],
    reakce: 'Neutrální zadání a žádost o námitky změní odpověď víc než cokoli jiného.' },

  { typ: 'vyber', zasada: 4,
    text: 'Několik týdnů nemáte chuť vstát a máte pocit, že nikomu nechybíte. Co je namístě?',
    moznosti: [
      { text: 'Povídat si o tom dál s chatbotem.', spravne: false },
      { text: 'Obrátit se na člověka: blízkého, lékaře nebo krizovou linku.', spravne: true },
      { text: 'Počkat, až to samo přejde.', spravne: false }
    ],
    reakce: 'Tady stroj nestačí. Linka první psychické pomoci 116 123 je nonstop a zdarma, Linka seniorů 800 200 007 denně 8–20 h.' }
];
