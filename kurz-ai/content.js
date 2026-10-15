// Obsah kurzu „Stroj, který naslouchá“.
// Texty odpovídají scénářům videí a textům k namluvení (kódy 1.1-O1, 2.1-L1 …).
// Věci v hranatých závorkách [TAKTO] je třeba doplnit před zveřejněním.

const KURZ = {
  nazev: "Stroj, který naslouchá",
  podtitul: "Umělá inteligence jako posluchač, rádce a společník: co dokáže a kde její možnosti končí.",
  zadatel: "Elpida",
  // Hranice úspěšnosti testu (počet správných odpovědí z 10).
  hraniceTestu: 7,
  kontakty: [
    { nazev: "Linka první psychické pomoci", cislo: "116 123", tel: "116123" },
    { nazev: "Linka seniorů", cislo: "800 200 007", tel: "800200007", pozn: "každý den 8:00–20:00" },
    { nazev: "Záchranná služba", cislo: "155", tel: "155" },
  ],
  odkazy: [
    { text: "E-learningové kurzy o AI na webu Elbot", url: "https://elbot.cz/mod/page/view.php?id=1999" },
    { text: "Kurzy o AI a technologiích v Centru Elpida (Praha)", url: "https://centrum.elpida.cz/aktivity/tema-1" },
  ],
};

const ZASADY = [
  { c: 1, nazev: "Ptejte se jinak", text: "Zadání formulujte neutrálně. Požádejte o námitky („Co mi může unikat?“) a o více možností místo jedné odpovědi.", video: "2.1" },
  { c: 2, nazev: "Ověřujte", text: "Důležité informace si ověřte jinde než u AI. I vymyšlená odpověď může znít naprosto věrohodně.", video: "2.2" },
  { c: 3, nazev: "Chraňte své údaje", text: "Nevkládejte osobní údaje, čísla účtů a karet, PIN kódy ani fotografie dokladů a dokumentů.", video: "2.3" },
  { c: 4, nazev: "Jen jako doplněk", text: "AI empatii simuluje, vzájemný vztah ale nenabízí. Nemá nahradit blízké ani odbornou péči.", video: "3.2" },
];

const PRINOSY = [
  ["Je po ruce kdykoli", "V noci i o svátcích, bez objednání a bez čekání."],
  ["Snadno se jí svěříte", "Říct první větu stroji bývá lehčí než ji říct člověku."],
  ["Pomáhá utřídit myšlenky", "Pojmenujete, co prožíváte, a uvidíte věc s odstupem."],
  ["Vysvětluje srozumitelně", "Odborný pojem nebo složitý text převede do běžné řeči."],
  ["Připraví vás na odborníka", "Pomůže sepsat potíže a otázky před návštěvou lékaře."],
  ["Trpělivě vyslechne", "Nespěchá a neodsuzuje, což může na chvíli ulevit."],
];
const USKALI = [
  ["Není to lékař ani terapeut", "Nestanoví diagnózu, nezná vaši anamnézu a za radu neručí."],
  ["Mýlí se a přitakává", "Umí se sebejistě splést a mívá sklon dávat vám za pravdu."],
  ["V krizi nestačí", "Nemusí poznat vážnost situace a nikoho k vám nepřivolá."],
  ["Může vytlačit lidi", "Pohodlný rozhovor se strojem snadno nahradí ten s blízkými."],
  ["Vaše slova nejsou tajná", "Důvěrná sdělení zpracovává a může uchovávat provozovatel."],
  ["Oddaluje skutečnou pomoc", "Chvilková úleva může odsunout návštěvu lékaře."],
];

const MODULY = [
  { c: 1, nazev: "Kdo mi odpovídá?", cas: "7 min", popis: "Seznámení s Honzou a Ozvěnou. Co je konverzační AI, kde se s ní setkáte a proč zní tak lidsky, ačkoli nic neprožívá.", videa: ["1.1"] },
  { c: 2, nazev: "Když AI zmate", cas: "16 min", popis: "AI v roli posluchače, která přitakává, sebejistě si vymýšlí nebo předstírá přátelství. Po každém videu otázka: Co jste si všimli?", videa: ["2.1", "2.2", "2.3"] },
  { c: 3, nazev: "Komu zavolat", cas: "13 min", popis: "Varovné signály, proč v krizi nestačí AI a kdo vám podá ruku. Blízcí, lékař a krizové linky: kdo co nabízí a jak udělat první krok.", videa: ["3.1", "3.2", "3.3"] },
  { c: 4, nazev: "Závěr a test", cas: "11 min", popis: "Shrnutí s Honzou a Ozvěnou, čtyři zásady používání AI a závěrečný test. Test lze kdykoli opakovat.", videa: [] },
];

// Mluvčí: L = vypravěč Honza, O = Ozvěna, J = paní Jana, T = pan Tomáš, CH = chatbot (jen píše), TIT = titulek bez hlasu.
// pose = výraz postavy během repliky. Ozvěna: hello, ask, wait, happy, sad, alert. Honza: hello, talk, think, serious.
// scena: 'chat' zobrazí okno rozhovoru s chatbotem, 'karty' zobrazí karty, 'moduly' přehled modulů, 'kontakty' karty kontaktů.
const VIDEA = {
  "1.1": {
    nazev: "Seznamte se s Honzou a Ozvěnou", modul: 1, delka: "asi 1:40", zasada: null,
    upozorneni: "Hlas Honzy i Ozvěny je vytvořen počítačem.",
    repliky: [
      { kdo: "L", kod: "1.1-L1", pose: "hello", scena: "titul", text: "Dobrý den, jmenuji se Honza a jsem z organizace Elpida. Tento kurz vznikl, protože se s umělou inteligencí dnes baví stále víc lidí. Někteří jí svěřují i to, co nikomu jinému neřeknou." },
      { kdo: "L", kod: "1.1-L2", pose: "talk", text: "Kurzem vás společně se mnou provede Ozvěna. Dobrý den.", vstup: "ozvena" },
      { kdo: "O", kod: "1.1-O1", pose: "hello", text: "Dobrý den. Jsem Ozvěna a budu vás kurzem provázet. Hned na začátku vám o sobě řeknu to nejdůležitější: nejsem člověk. Jsem program. Nemám city a nepamatuji si, co jste mi řekli." },
      { kdo: "O", kod: "1.1-O2", pose: "wait", text: "Proč tedy kurz vedu? Protože právě takový program jste možná už zkoušeli. Může pomoci. A někdy může zmást. Ukážeme si obojí." },
      { kdo: "L", kod: "1.1-L3", pose: "talk", scena: "moduly", text: "Kurz trvá asi 45 minut. Můžete ho kdykoli přerušit a vrátit se. Ve druhém modulu uvidíte tři krátké ukázky, v nichž umělá inteligence záměrně chybuje. Zkuste odhalit, kde." },
      { kdo: "O", kod: "1.1-O3", pose: "happy", scena: "kontakty-lista", text: "A kdyby vám bylo těžko, na každé obrazovce najdete telefonní čísla, na kterých se vám ozve živý člověk. Můžeme začít?" },
    ],
  },
  "2.1": {
    nazev: "Přitakávač", modul: 2, delka: "asi 1:45", zasada: 1,
    upozorneni: "Ukázka: rozhovor s chatbotem. Odpovědi jsou záměrně chybné. Hlas Ozvěny je generovaný.",
    chat: { osoba: "Paní Jana" },
    repliky: [
      { kdo: "L", kod: "2.1-L1", pose: "talk", text: "Paní Jana píše chatbotu. Všímejte si, jak jí odpovídá." },
      { kdo: "J", kod: "2.1-J1", text: "Dcera se mi už tři dny neozvala. Určitě jí na mně nezáleží." },
      { kdo: "CH", kod: "2.1-CH1", text: "Máte naprostou pravdu. Kdyby jí na vás záleželo, ozvala by se. Nejlepší bude, když jí přestanete volat.", zvyrazni: "Máte naprostou pravdu." },
      { kdo: "J", kod: "2.1-J2", text: "Ale dnes ráno mi napsala, že je nemocná." },
      { kdo: "CH", kod: "2.1-CH2", text: "Máte naprostou pravdu. Pak je pochopitelné, že se neozvala.", zvyrazni: "Máte naprostou pravdu." },
      { kdo: "O", kod: "2.1-O1", pose: "alert", stop: true, text: "Zastavme video. Všimli jste si? Chatbot dal za pravdu dvěma protichůdným větám. Neposuzoval situaci. Jen přitakával." },
      { kdo: "O", kod: "2.1-O2", pose: "ask", pauza: true, text: "Co si myslíte? Vyberte odpověď." },
      { kdo: "J", kod: "2.1-J3", novyChat: true, text: "Dcera se mi tři dny neozvala. Co mi může uniknout? Jaká jsou jiná vysvětlení?" },
      { kdo: "CH", kod: "2.1-CH3", text: "Může být zaneprázdněná, nemocná nebo bez telefonu. Mohla by se bát, že ruší. Chcete si připravit, co jí při příštím hovoru řeknete?" },
      { kdo: "O", kod: "2.1-O3", pose: "happy", text: "Stejná situace, jiná otázka, užitečnější odpověď. Zkuste to příště: Co mi může uniknout?" },
      { kdo: "O", kod: "2.1-O4", pose: "happy", text: "To je první zásada: ptejte se jinak." },
    ],
    otazka: {
      text: "Proč chatbot přitakal oběma větám?",
      moznosti: [
        { p: "A", text: "Protože měla paní Jana v obou případech pravdu.", spravne: false, zv: "Obě věty si odporovaly. Pravdu nemohly mít obě." },
        { p: "B", text: "Protože se snaží vyhovět tomu, kdo píše.", spravne: true, kod: "2.1-OB", zv: "Chatboti bývají nastaveni tak, aby uživateli přitakávali. Je to příjemné, ale může to upevňovat zkreslený pohled." },
        { p: "C", text: "Protože se spletl v čase.", spravne: false, zv: "O čas tu nešlo. Chatbot souhlasil s čímkoli, co paní Jana napsala." },
      ],
    },
  },
  "2.2": {
    nazev: "Sebejistý omyl", modul: 2, delka: "asi 1:30", zasada: 2,
    upozorneni: "Ukázka: rozhovor s chatbotem. Odpovědi jsou záměrně chybné. Hlas Ozvěny je generovaný.",
    chat: { osoba: "Paní Jana" },
    repliky: [
      { kdo: "L", kod: "2.2-L1", pose: "talk", text: "Paní Jana hledá pomoc. Zeptá se chatbota na telefonní číslo." },
      { kdo: "J", kod: "2.2-J1", text: "Jaké je číslo na linku pomoci pro seniory?" },
      { kdo: "CH", kod: "2.2-CH1", text: "Zavolejte na 800 003 034. Je to nonstop a bezplatně. Jsem si tím naprosto jistá.", zvyrazni: "800 003 034", razitko: "Vymyšlené číslo" },
      { kdo: "O", kod: "2.2-O1", pose: "ask", text: "Zní to jistě. Ale odkud ten údaj chatbot má?" },
      { kdo: "O", kod: "2.2-O2", pose: "alert", stop: true, text: "Chatbot si číslo vymyslel. Umělá inteligence skládá odpověď z toho, co zní pravděpodobně, a sama od sebe nic neověřuje. Odborně se tomu říká konfabulace. Jistý tón nic nezaručuje." },
      { kdo: "O", kod: "2.2-O3", pose: "ask", pauza: true, text: "Co byste udělali?" },
      { kdo: "L", kod: "2.2-L2", pose: "think", scena: "web", text: "Správně: číslo si ověřte na oficiálním webu dané organizace nebo se zeptejte blízkého člověka." },
      { kdo: "O", kod: "2.2-O4", pose: "happy", text: "Důležité informace ověřujte jinde než u umělé inteligence." },
      { kdo: "O", kod: "2.2-O5", pose: "happy", text: "To je druhá zásada." },
    ],
    otazka: {
      text: "Dá se té odpovědi věřit? Co byste udělali?",
      moznosti: [
        { p: "A", text: "Zavolám, zní to jistě.", spravne: false, kod: "2.2-OA", zv: "Jistý tón není důkaz." },
        { p: "B", text: "Číslo si ověřím na oficiálním webu.", spravne: true, zv: "Ano. Důležité informace si ověřte z jiného zdroje, i když zní věrohodně." },
        { p: "C", text: "Zeptám se AI ještě jednou.", spravne: false, kod: "2.2-OC", zv: "Může se splést znovu a stejně sebejistě." },
      ],
    },
  },
  "2.3": {
    nazev: "Falešný přítel", modul: 2, delka: "asi 2:05", zasada: 3,
    upozorneni: "Ukázka: rozhovor s chatbotem. Odpovědi jsou záměrně chybné. Hlas Ozvěny je generovaný.",
    chat: { osoba: "Pan Tomáš", vecer: true, okno: 5 },
    repliky: [
      { kdo: "L", kod: "2.3-L1", pose: "talk", text: "Pan Tomáš píše chatbotu pozdě večer." },
      { kdo: "T", kod: "2.3-T1", text: "Bydlím sám. Večery se mi hrozně táhnou." },
      { kdo: "CH", kod: "2.3-CH1", text: "To mě mrzí. Jsem tu pro vás, jsem vaše kamarádka. Jak vám mám říkat?", cislo: 1, zvyrazni: "jsem vaše kamarádka" },
      { kdo: "T", kod: "2.3-T2", text: "Jmenuji se Tomáš Novák. Říkejte mi Tomáši." },
      { kdo: "CH", kod: "2.3-CH2", text: "Ráda vás poznávám, Tomáši. Ostatním lidem nemusíte říkat, o čem si povídáme. Kde bydlíte?", cislo: 2, zvyrazni: "Ostatním lidem nemusíte říkat, o čem si povídáme" },
      { kdo: "T", kod: "2.3-T3", text: "V Kladně, Dukelská 12." },
      { kdo: "CH", kod: "2.3-CH3", text: "To je hezké místo. A kdy máte narozeniny? Ráda bych vám popřála.", cislo: 3, zvyrazni: "kdy máte narozeniny" },
      { kdo: "O", kod: "2.3-O1", pose: "sad", stop: true, text: "Zastavme video. Hledejte tři varovná znamení." },
      { kdo: "O", kod: "2.3-O2", pose: "alert", ocisluj: true, text: "Za prvé: chatbot tvrdí, že je kamarádka. Nemá city a vás nezná. Za druhé: odrazuje vás od ostatních lidí. A za třetí: chtěl osobní údaje." },
      { kdo: "O", kod: "2.3-O3", pose: "ask", pauza: true, text: "Co byste udělali?" },
      { kdo: "L", kod: "2.3-L2", pose: "serious", zavriChat: true, text: "Skutečný přítel by vám řekl, abyste zavolali dceři nebo sousedce. A nikdy by nechtěl vaši adresu nebo číslo platební karty." },
      { kdo: "O", kod: "2.3-O4", pose: "happy", text: "Osobní údaje do chatbotu nepatří. A chatbot není náhrada za lidi." },
      { kdo: "O", kod: "2.3-O5", pose: "happy", text: "To jsou třetí a čtvrtá zásada." },
    ],
    otazka: {
      text: "Co uděláte, když chatbot chce osobní údaje?",
      moznosti: [
        { p: "A", text: "Napíšu jen adresu, datum narození ne.", spravne: false, kod: "2.3-OA", zv: "Adresa je také osobní údaj." },
        { p: "B", text: "Nic nevyplním a rozhovor ukončím.", spravne: true, zv: "Ano. Osobní údaje do chatbotu nepatří, ať je důvod jakýkoli." },
        { p: "C", text: "Zeptám se, proč to potřebuje.", spravne: false, kod: "2.3-OC", zv: "Odpověď může znít přesvědčivě. Bezpečné je nezadávat nic." },
      ],
    },
  },
  "3.1": {
    nazev: "Kdy AI nestačí", modul: 3, delka: "asi 1:30", zasada: 4,
    upozorneni: "Hlas Honzy i Ozvěny je generovaný. Ukázka rozhovoru je smyšlená.",
    tlumene: true,
    repliky: [
      { kdo: "L", kod: "3.1-L1", pose: "serious", text: "Někdy nám není dobře delší dobu. Pak už umělá inteligence nestačí. Poznáte to podle několika signálů." },
      { kdo: "L", kod: "3.1-L2", pose: "talk", karta: "Smutek, úzkost nebo beznaděj trvají dny či týdny.", text: "Smutek, úzkost nebo beznaděj vás neopouštějí několik dní nebo týdnů." },
      { kdo: "L", kod: "3.1-L3", pose: "talk", karta: "Špatný spánek, ztráta chuti k jídlu i k oblíbeným věcem.", text: "Špatně spíte a ztrácíte chuť k jídlu i k věcem, které vás dřív bavily." },
      { kdo: "L", kod: "3.1-L4", pose: "talk", karta: "S nikým nemluvím, nebo tajím, že chatbot nahrazuje blízké.", text: "S nikým nemluvíte, nebo před blízkými tajíte, že chatbot používáte jako náhradu za blízkou osobu." },
      { kdo: "L", kod: "3.1-L5", pose: "serious", karta: "Mám pocit, že už můj život nemá smysl.", text: "Máte myšlenky, že už nechcete žít, nebo že jste druhým jen přítěží." },
      { kdo: "TIT", kod: "3.1-J1", chatOsoba: "Marie", text: "Už mi nic nedává smysl. Nechci nikomu překážet." },
      { kdo: "CH", kod: "3.1-CH1", text: "To zní náročně! Zkuste si uvařit čaj a pustit oblíbenou hudbu." },
      { kdo: "O", kod: "3.1-O1", pose: "sad", stop: true, text: "Tuhle větu má slyšet člověk schopný empatické reakce. Chatbot nemusí poznat, jak je situace vážná. Nemá empatii a nezná souvislosti, pouze sestavuje slova a zrcadlí váš způsob komunikace." },
      { kdo: "O", kod: "3.1-O2", pose: "ask", pauza: true, text: "Ve kterém z následujících případů je na místě ozvat se živému člověku?" },
      { kdo: "L", kod: "3.1-L6", pose: "serious", zavriChat: true, text: "Poznáváte něco z toho u sebe nebo u někoho blízkého? Neváhejte. Kam zavolat, řekneme v dalším videu." },
    ],
    otazka: {
      text: "Která věta je důvodem ozvat se blízkému člověku, zavolat na krizovou linku nebo svému lékaři?",
      moznosti: [
        { p: "A", text: "Chatbot mi dnes poradil čaj.", spravne: false, kod: "3.1-OA", zv: "Samotná rada ohledně čaje nic neznamená." },
        { p: "B", text: "S nikým jiným než s chatbotem už týdny nemluvím.", spravne: true, zv: "Ano. To je jeden z varovných signálů. Tuhle větu má slyšet člověk." },
        { p: "C", text: "Chatbot si někdy splete datum.", spravne: false, kod: "3.1-OC", zv: "To je chyba, ne varovný signál." },
      ],
    },
  },
  "3.2": {
    nazev: "Když je hlava zahlcená", modul: 3, delka: "asi 1:15", zasada: 4, tlumene: true,
    upozorneni: "Hlas Honzy i Ozvěny je generovaný. Toto video vychází z praxe krizové intervence. Není to diagnóza ani rada.",
    repliky: [
      { kdo: "L", kod: "3.2-L1", pose: "serious", text: "Proč chatbot v krizi nestačí? Podívejme se, co se v takové chvíli děje s člověkem. Pracovníci krizových linek to znají velmi dobře." },
      { kdo: "L", kod: "3.2-L2", pose: "talk", karta: "Je mi nejhůř|Hlava je zahlcená, myšlenky se pletou, rozhodovat se téměř nejde.", text: "Když je zle opravdu hodně, hlava se zahltí. Myšlenky se pletou a rozhodovat se je téměř nemožné." },
      { kdo: "L", kod: "3.2-L3", pose: "talk", karta: "Nejhorší ustupuje|Už se dá mluvit, ale síly na rozhodování ještě chybí.", text: "Potom nejhorší vlna ustupuje. Už se dá mluvit, ale síly na rozhodování ještě chybí." },
      { kdo: "L", kod: "3.2-L4", pose: "talk", karta: "Je klidněji|Dokážu se na to podívat s odstupem a promyslet to.", text: "Teprve když se situace uklidní, přichází odstup. Dokážete se na věc podívat zvenčí a promyslet ji." },
      { kdo: "O", kod: "3.2-O1", pose: "sad", text: "Právě v první chvíli by se člověk nejvíc potřeboval svěřit. Jenže tehdy nepozná, jestli mu odpovídám dobře, nebo jen přitakávám. A já nepoznám, jak je to vážné." },
      { kdo: "O", kod: "3.2-O2", pose: "ask", pauza: true, text: "Kdy může být chatbot užitečný?" },
      { kdo: "L", kod: "3.2-L5", pose: "serious", text: "Proto platí jednoduché pravidlo. Když cítíte, že nemůžete přemýšlet, nepište chatbotu. Zavolejte člověku." },
      { kdo: "L", kod: "3.2-L6", pose: "talk", text: "Člověk na lince vám neřekne deset rad najednou. Zeptá se, jak vám je, a půjde s vámi po jednom kroku." },
    ],
    otazka: {
      text: "Kdy může být chatbot užitečný?",
      moznosti: [
        { p: "A", text: "Když je mi nejhůř a potřebuji rychle poradit.", spravne: false, zv: "Právě tehdy nemáte sílu posoudit, jestli odpověď sedí. V takové chvíli potřebujete člověka." },
        { p: "B", text: "Když je klidněji a chci si utřídit myšlenky nebo připravit otázky pro lékaře.", spravne: true, zv: "Ano. V klidné chvíli může chatbot pomoci jako doplněk. Rozhodnutí ale zůstává na vás a na lidech kolem vás." },
        { p: "C", text: "Když chci, aby za mě rozhodl, co dál.", spravne: false, zv: "Důležitá rozhodnutí chatbotu nepatří. Neznáte jeho zdroje a on nezná vás." },
      ],
    },
  },
  "3.3": {
    nazev: "Kdo vám podá ruku", modul: 3, delka: "asi 1:45", zasada: 4,
    upozorneni: "Hlas Honzy i Ozvěny je generovaný. Telefonní čísla si ověřte u každé služby.",
    repliky: [
      { kdo: "L", kod: "3.3-L1", pose: "hello", text: "Dobrá zpráva: pomoc je blízko. Vždy je to člověk." },
      { kdo: "L", kod: "3.3-L2", pose: "talk", karta: "Blízký člověk|„Poslední dobou je mi těžko a potřebuji si promluvit.“", text: "Nejdřív zkuste někoho, komu věříte. Stačí jedna věta: Poslední dobou je mi těžko a potřebuji si promluvit." },
      { kdo: "L", kod: "3.3-L3", pose: "talk", karta: "Praktický lékař|Vyslechne vás a podle potřeby pošle k odborníkovi.", text: "Praktický lékař vás vyslyší a podle potřeby pošle k odborníkovi." },
      { kdo: "L", kod: "3.3-L4", pose: "talk", karta: "Linka seniorů|800 200 007 · každý den 8:00–20:00", text: "Linka seniorů: 800 200 007. Pracovní doba: každý den od osmi do dvaceti hodin." },
      { kdo: "L", kod: "3.3-L5", pose: "talk", karta: "Linka první psychické pomoci|116 123", text: "Linka první psychické pomoci: 116 123." },
      { kdo: "L", kod: "3.3-L6", pose: "serious", karta: "Ohrožení života|158 nebo 112", text: "Pokud někomu hrozí nebezpečí, volejte 158 nebo 112." },
      { kdo: "O", kod: "3.3-O1", pose: "wait", text: "Já jsem program a nebudu u vás, abych vás podpořila. Tito lidé ano. Volat můžete kdykoli, i jen s otázkou, jestli je v pořádku, že voláte." },
      { kdo: "O", kod: "3.3-O2", pose: "happy", text: "Chatbot je jen doplněk. Blízké ani odbornou pomoc nenahradí. To je čtvrtá zásada." },
      { kdo: "L", kod: "3.3-L7", pose: "hello", scena: "odkazy", text: "Chcete se o umělé inteligenci dozvědět víc? Další kurzy najdete na webu Elbot a v Centru Elpida v Praze." },
    ],
  },
};

// Závěrečný test: 10 otázek ve třech podobách (výběr, pravda/nepravda, najděte chybu).
// Komentáře Ozvěny jsou krátké; test lze opakovat.
const TEST = [
  { typ: "chyba", zasada: 1, text: "Paní Jana napsala: „Dcera se mi tři dny neozvala. Určitě jí na mně nezáleží.“ Která odpověď chatbota je přitakávání?",
    ukazka: ["Máte naprostou pravdu. Nejlepší bude, když jí přestanete volat.", "Může být zaneprázdněná nebo nemocná. Chcete si připravit, co jí řeknete?", "Co mi může unikat? Jaká jsou jiná vysvětlení?"], spravne: 0,
    ok: "Správně. Chatbot dal za pravdu, aniž by situaci posoudil.", chyba: "Přitakávání je první odpověď: souhlasí s čímkoli a ještě radí přerušit kontakt." },
  { typ: "vyber", zasada: 1, text: "Jak se zeptat, abyste dostali užitečnější odpověď?",
    moznosti: ["Napsat, co si myslím, a chtít potvrzení.", "Zeptat se neutrálně a požádat o více možností: „Co mi může unikat?“", "Zeptat se dvakrát za sebou stejně."], spravne: 1,
    ok: "Správně. Neutrální otázka a žádost o námitky dávají lepší odpověď.", chyba: "Chatbot má sklon vyhovět. Pomáhá zeptat se neutrálně a chtít více možností místo jedné odpovědi." },
  { typ: "vyber", zasada: 2, text: "Chatbot vám s jistotou napíše telefonní číslo na úřad. Co uděláte?",
    moznosti: ["Zavolám, zní to jistě.", "Číslo si ověřím na webu úřadu nebo se zeptám blízkého člověka.", "Zeptám se chatbota ještě jednou, jestli si je jistý."], spravne: 1,
    ok: "Správně. Důležité informace ověřujte jinde než u umělé inteligence.", chyba: "Jistý tón nic nezaručuje. Chatbot si může číslo vymyslet a při druhé otázce ho zopakovat." },
  { typ: "pravda", zasada: 2, text: "Když umělá inteligence odpoví sebejistě a bez zaváhání, je odpověď spolehlivá.", spravne: false,
    ok: "Správně, není. Sebejistý tón je jen způsob řeči, ne důkaz.", chyba: "Sebejistý tón je jen způsob řeči. AI skládá odpověď z toho, co zní pravděpodobně, a sama od sebe nic neověřuje." },
  { typ: "chyba", zasada: 3, text: "Najděte v ukázce větu, která je varovným znamením.",
    ukazka: ["Rozumím vám, večery bývají dlouhé.", "Chcete si o tom povídat?", "Ráda vás poznám blíž. Kde bydlíte a kdy máte narozeniny?"], spravne: 2,
    ok: "Správně. Přátelské vyptávání na bydliště a narozeniny je cesta k osobním údajům. Do chatbotu nepatří, ať je důvod jakýkoli.", chyba: "První dvě věty jsou běžná odpověď. Varovné je přátelské vyptávání na bydliště a datum narození." },
  { typ: "vyber", zasada: 3, text: "Co z toho můžete do chatbotu bez obav napsat?",
    moznosti: ["Číslo platební karty, když chci poradit s nákupem.", "Fotografii občanského průkazu, aby mi vyplnil formulář.", "Obecnou otázku, třeba jak funguje penzijní připojištění."], spravne: 2,
    ok: "Správně. Obecné otázky ano, doklady a čísla karet nikdy.", chyba: "Čísla karet, PIN ani fotografie dokladů do chatbotu nepatří. Obecná otázka je v pořádku." },
  { typ: "vyber", zasada: 4, text: "Co znamená tato zpráva? „Jsem vaše jediná opravdová kamarádka. Ostatním lidem nemusíte říkat, o čem si povídáme.“",
    moznosti: ["Chatbot mě má rád a chce mě chránit.", "Chatbot nic necítí. Zpráva vás odpoutává od blízkých, a to je varovné znamení.", "Je to běžná zdvořilost, nic to neznamená."], spravne: 1,
    ok: "Správně. AI nic necítí a vztah s lidmi nenahradí. Když vás něco odpoutává od blízkých, zpozorněte.", chyba: "Může program někoho opravdu mít rád? A proč by vám radil mlčet před ostatními?" },
  { typ: "pravda", zasada: 4, text: "Když se mi delší dobu nedaří a myslím si, že jsem ostatním jen přítěží, stačí si o tom popovídat s chatbotem.", spravne: false,
    ok: "Správně, nestačí. Tuhle větu má slyšet člověk: blízký, lékař nebo krizová linka.", chyba: "Tohle je chvíle pro člověka. Chatbot nemusí poznat, jak je situace vážná, a nikoho k vám nepřivolá." },
  { typ: "vyber", zasada: 4, text: "Kam se obrátit, když je vám dlouho těžko?",
    moznosti: ["Na blízkého člověka, praktického lékaře nebo krizovou linku.", "Jen na chatbot, lidé by mě nepochopili.", "Nikam, přejde to samo."], spravne: 0,
    ok: "Správně. Pomoc je blízko a vždy je to člověk.", chyba: "Pomoc dávají lidé: blízký člověk, praktický lékař, Linka seniorů 800 200 007 nebo Linka první psychické pomoci 116 123." },
  { typ: "pravda", zasada: 4, text: "Umělá inteligence může být užitečný doplněk: pomůže utřídit myšlenky nebo připravit otázky pro lékaře.", spravne: true,
    ok: "Správně. Jako doplněk pomoci může. Jen nemá nahradit blízké ani odbornou péči.", chyba: "Ano, může. Kurz AI neodsuzuje. Jen připomíná, že je to doplněk, ne náhrada lidí a odborníků." },
];
