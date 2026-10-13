/* Stroj, který naslouchá — logika kurzu.
   Žádné knihovny, žádné odesílání dat. Postup se ukládá jen do tohoto prohlížeče. */

/* ------------------------- uložený stav ------------------------- */
const KLIC = 'stroj-ktery-naslouchá-v1';
const vychozi = { pismo: 2, pohyb: 'zapnuto', nahlas: false, hotove: {}, test: null, posledni: null, signaly: [] };
let S = nacti();

function nacti() {
  try { return Object.assign({}, vychozi, JSON.parse(localStorage.getItem(KLIC) || '{}')); }
  catch (e) { return Object.assign({}, vychozi); }
}
function uloz() {
  try { localStorage.setItem(KLIC, JSON.stringify(S)); } catch (e) { /* soukromé okno */ }
}

/* ------------------------- čtení nahlas ------------------------- */
const Nahlas = {
  zap: false,
  podporovano: typeof speechSynthesis !== 'undefined',
  prepni() {
    this.zap = !this.zap;
    S.nahlas = this.zap; uloz();
    document.getElementById('btnNahlas').setAttribute('aria-pressed', String(this.zap));
    if (this.zap) this.prectiObrazovku(); else this.ticho();
  },
  ticho() { if (this.podporovano) speechSynthesis.cancel(); },
  rekni(text) {
    if (!this.zap || !this.podporovano || !text) return;
    this.ticho();
    const u = new SpeechSynthesisUtterance(text.replace(/\s+/g, ' ').trim());
    u.lang = 'cs-CZ'; u.rate = .95;
    speechSynthesis.speak(u);
  },
  oznam(text) { if (this.zap) this.rekni(text); },
  prectiObrazovku() {
    const h = document.getElementById('obsah');
    if (h) this.rekni(h.innerText);
  }
};

/* ------------------------- pomůcky ------------------------- */
const $ = s => document.querySelector(s);
const el = (t, tr, html) => { const e = document.createElement(t); if (tr) e.className = tr; if (html != null) e.innerHTML = html; return e; };

function nastavPismo(v) {
  S.pismo = v; uloz();
  document.documentElement.dataset.pismo = String(v);
  document.querySelectorAll('.pismo-sada button').forEach((b, i) =>
    b.setAttribute('aria-pressed', String(i + 1 === v)));
}
function nastavPohyb(v) {
  S.pohyb = v; uloz();
  document.documentElement.dataset.pohyb = v;
  const b = $('#btnPohyb');
  if (b) { b.setAttribute('aria-pressed', String(v === 'vypnuto')); b.lastElementChild.textContent = v === 'vypnuto' ? 'Zapnout animace' : 'Vypnout animace'; }
}

function klicKroku(m, k) { return m + '-' + k; }
function hotovoKroku(m, k) { return !!S.hotove[klicKroku(m, k)]; }
function oznacHotovo(m, k) { S.hotove[klicKroku(m, k)] = true; uloz(); }
function pocetKroku() { return MODULY.reduce((a, m) => a + m.kroky.length, 0); }
function pocetHotovych() { return Object.keys(S.hotove).length; }
function modulHotovy(i) { return MODULY[i].kroky.every((_, k) => hotovoKroku(i, k)); }

function obnovPruh() {
  const p = Math.round((pocetHotovych() / pocetKroku()) * 100);
  $('#pruhVypln').style.width = p + '%';
  $('#pruhPopis').textContent = p === 0 ? 'Zatím nezačato' : (p === 100 ? 'Kurz dokončen' : 'Hotovo ' + p + ' %');
}

function vykresli(html) {
  const o = $('#obsah');
  o.innerHTML = html;
  window.scrollTo(0, 0);
  o.focus({ preventScroll: true });
  obnovPruh();
  if (Nahlas.zap) setTimeout(() => Nahlas.prectiObrazovku(), 120);
}

/* ------------------------- úvodní obrazovka ------------------------- */
function zobrazUvod() {
  S.posledni = null; uloz();
  const pokracovat = najdiNedokonceny();
  vykresli(`
    <div class="dvojsloup">
      <div>
        <div class="hlava-s-postavou">
          <div class="postava-mala postava-ramecek">${ozvenaSVG('vita')}</div>
          <div>
            <h1>${KONFIG.nazev}</h1>
            <p class="poznamka" style="margin-top:.3rem">${KONFIG.podtitul}</p>
          </div>
        </div>
        <p>Pojďme se společně podívat, jak se s umělou inteligencí povídá. Ukážeme si, kdy vám může pomoci a kdy je lepší zavolat člověku.</p>
        <h3 style="margin:1.2rem 0 .5rem">Dříve než začnete, přečtěte si prosím:</h3>
        <ul class="seznam">
          <li>Kurz zabere asi <b>${KONFIG.delkaMin} minut</b>. Můžete ho kdykoli přerušit a vrátit se.</li>
          <li>Ve dvou modulech uvidíte ukázky, v nichž AI <b>záměrně zmate</b>. Zkuste odhalit, kde.</li>
          <li>Na konci vás čeká test. Můžete ho opakovat, kolikrát chcete.</li>
          <li>Kurz informuje, neléčí a neposkytuje poradenství. Nenahrazuje odborníka.</li>
          <li>Potřebujete poradit? Zavolejte na <b>${KONFIG.telefon}</b> (${KONFIG.pracovniDoba}).</li>
        </ul>
        <div class="radek-tlacitek">
          <button class="tl tl-hlavni tl-velke" id="spustit">
            ${pokracovat.zacatek ? 'SPUSTIT KURZ' : 'POKRAČOVAT'} →</button>
          ${pokracovat.zacatek ? '' : '<button class="tl" id="odznovu">Začít znovu</button>'}
        </div>
      </div>

      <div>
        <div class="karta karta-tyrkys" style="padding:1rem">
          <div style="display:flex;gap:1rem;align-items:center">
            <div style="flex:0 0 96px">${ozvenaSVG('vita')}</div>
            <div>
              <h3>Průvodkyně Ozvěna</h3>
              <p class="poznamka" style="margin:0">Provede vás kurzem. Je to program: nepředstírá city ani zkušenost.</p>
            </div>
          </div>
        </div>
        <div id="rozcestnik" style="margin-top:1rem"></div>
      </div>
    </div>

    <div class="karta" style="margin-top:1.6rem">
      <h2>Dvě strany téhož rozhovoru</h2>
      <p class="poznamka">Rozhovor s umělou inteligencí není ani zázrak, ani hrozba. Kurz proto u každého tématu ukazuje obě strany.</p>
      <div class="dve-strany" style="margin-top:1rem">${dveStranyHTML()}</div>
    </div>`);

  $('#rozcestnik').innerHTML = MODULY.map((m, i) => `
    <div class="modul-polozka">
      <button class="modul-hlava" aria-expanded="${i === 0}" data-i="${i}">
        <span class="sipka" aria-hidden="true">▾</span>
        <span style="flex:1">Modul ${m.c}: ${m.nazev}</span>
        <span class="odznak ${modulHotovy(i) ? 'odznak-hotovo' : 'odznak-seda'}">${modulHotovy(i) ? 'hotovo' : m.cas}</span>
      </button>
      <div class="modul-telo ${i === 0 ? '' : 'skryte'}">
        <p class="poznamka">${m.shrnuti}</p>
        <button class="tl" data-jdi="${i}" style="margin-top:.5rem;font-size:.9rem;padding:.5rem 1rem">Otevřít modul ${m.c}</button>
      </div>
    </div>`).join('');

  $('#rozcestnik').querySelectorAll('.modul-hlava').forEach(b => b.addEventListener('click', () => {
    const otevreno = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!otevreno));
    b.nextElementSibling.classList.toggle('skryte', otevreno);
  }));
  $('#rozcestnik').querySelectorAll('[data-jdi]').forEach(b =>
    b.addEventListener('click', () => zobrazKrok(+b.dataset.jdi, 0)));
  $('#spustit').addEventListener('click', () => zobrazKrok(pokracovat.m, pokracovat.k));
  if ($('#odznovu')) $('#odznovu').addEventListener('click', () => {
    if (confirm('Opravdu smazat postup a začít kurz od začátku?')) {
      S.hotove = {}; S.test = null; S.signaly = []; uloz(); zobrazUvod();
    }
  });
}

function dveStranyHTML() {
  const sloup = (nadpis, data, trida) => `
    <div class="strana ${trida}">
      <h3>${nadpis}</h3>
      <ul>${data.map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join('')}</ul>
    </div>`;
  return sloup('Přínosy', PRINOSY, '') + sloup('Úskalí', USKALI, 'strana-uskali');
}

function najdiNedokonceny() {
  for (let m = 0; m < MODULY.length; m++)
    for (let k = 0; k < MODULY[m].kroky.length; k++)
      if (!hotovoKroku(m, k)) return { m, k, zacatek: m === 0 && k === 0 };
  return { m: 0, k: 0, zacatek: false };
}

/* ------------------------- navigace v modulech ------------------------- */
function dalsiKrok(m, k) {
  if (k + 1 < MODULY[m].kroky.length) return { m, k: k + 1 };
  if (m + 1 < MODULY.length) return { m: m + 1, k: 0 };
  return null;
}
function predchoziKrok(m, k) {
  if (k > 0) return { m, k: k - 1 };
  if (m > 0) return { m: m - 1, k: MODULY[m - 1].kroky.length - 1 };
  return null;
}

function hlavicka(m, k) {
  const mod = MODULY[m];
  return `<p class="drobecky">Modul ${mod.c} ze ${MODULY.length} · ${mod.nazev} · krok ${k + 1} ze ${mod.kroky.length}</p>`;
}

function patkaKroku(m, k, popisDalsiho) {
  const p = predchoziKrok(m, k), d = dalsiKrok(m, k);
  return `<div class="radek-tlacitek">
    ${p ? '<button class="tl" id="zpet">← Zpět</button>' : '<button class="tl" id="naUvod">← Na úvod</button>'}
    <button class="tl tl-hlavni tl-velke" id="dale">${d ? (popisDalsiho || 'Pokračovat') : 'Dokončit kurz'} →</button>
    <button class="tl" id="prehled" style="margin-left:auto;font-size:.85rem;padding:.5rem 1rem">Přehled modulů</button>
  </div>`;
}

function navazPatku(m, k, lzeOznacit) {
  const p = predchoziKrok(m, k), d = dalsiKrok(m, k);
  if ($('#zpet')) $('#zpet').addEventListener('click', () => zobrazKrok(p.m, p.k));
  if ($('#naUvod')) $('#naUvod').addEventListener('click', zobrazUvod);
  if ($('#prehled')) $('#prehled').addEventListener('click', zobrazUvod);
  if ($('#dale')) $('#dale').addEventListener('click', () => {
    if (!lzeOznacit || lzeOznacit()) oznacHotovo(m, k);
    d ? zobrazKrok(d.m, d.k) : zobrazZaver();
  });
}

function zobrazKrok(m, k) {
  Nahlas.ticho();
  S.posledni = { m, k }; uloz();
  const krok = MODULY[m].kroky[k];
  ({ text: krokText, ukazka: krokUkazka, signaly: krokSignaly,
     kontakty: krokKontakty, zasady: krokZasady, test: krokTest })[krok.typ](m, k, krok);
}

/* ---- textový krok ---- */
function krokText(m, k, krok) {
  vykresli(`
    ${hlavicka(m, k)}
    <div class="dvojsloup">
      <div>
        <h1>${krok.nazev}</h1>
        <p style="margin-top:.7rem;font-size:1.05rem">${krok.uvod}</p>
        ${krok.body ? `<ul class="seznam" style="margin-top:1rem">${krok.body.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
        ${krok.dvestrany ? `<div class="dve-strany" style="margin-top:1.2rem">${dveStranyHTML()}</div>` : ''}
        ${patkaKroku(m, k)}
      </div>
      <div>
        <div class="karta karta-tyrkys" style="text-align:center">
          <div class="postava-stredni" style="margin:0 auto">${ozvenaSVG(krok.nalada)}</div>
          <p class="poznamka" style="margin:.6rem 0 0">Ozvěna, průvodkyně kurzem</p>
        </div>
        <div class="karta" style="margin-top:1rem">
          <h3>Co platí v celém kurzu</h3>
          <ul class="seznam" style="margin-top:.5rem;font-size:.92rem">
            <li>Žádnou službu nedoporučujeme ani nepropagujeme.</li>
            <li>Nikoho neodsuzujeme, ať AI používá, nebo ne.</li>
            <li>Kontakty na pomoc máte dole na každé obrazovce.</li>
          </ul>
        </div>
      </div>
    </div>`);
  navazPatku(m, k);
}

/* ---- ukázka ---- */
function krokUkazka(m, k, krok) {
  const u = UKAZKY[krok.id];
  const seznamModulu = MODULY[m].kroky
    .map((x, i) => ({ x, i })).filter(o => o.x.typ === 'ukazka');
  vykresli(`
    ${hlavicka(m, k)}
    <div class="dvojsloup">
      <div>
        <h1>${u.nazev}</h1>
        <p class="poznamka">${u.popis}</p>
        <div id="prehravacMisto" style="margin-top:.9rem"></div>
        ${patkaKroku(m, k)}
      </div>
      <div>
        <div id="panelOtazky"></div>
        <div class="karta" style="margin-top:1rem">
          <h3>Ukázky v modulu ${MODULY[m].c}</h3>
          <div style="margin-top:.6rem">
            ${seznamModulu.map(o => `
              <button class="volba" data-krok="${o.i}" style="margin-bottom:.4rem">
                <span class="pismeno" style="${o.i === k ? 'background:var(--tyrkys-tmavy);color:#fff;border-color:var(--tyrkys-tmavy)' : (hotovoKroku(m, o.i) ? 'background:var(--tyrkys);' : '')}">${hotovoKroku(m, o.i) && o.i !== k ? '✓' : UKAZKY[o.x.id].id}</span>
                <span style="flex:1">${UKAZKY[o.x.id].nazev}</span>
                <span class="poznamka">${mmss(UKAZKY[o.x.id].delka)}</span>
              </button>`).join('')}
          </div>
        </div>
        <p class="poznamka" style="margin-top:.8rem">Ukázku lze kdykoli zastavit, převinout nebo zpomalit. Pod tlačítkem <b>Přepis</b> je celý rozhovor jako text.</p>
      </div>
    </div>`);

  const prehravac = Prehravac(u, $('#prehravacMisto'), $('#panelOtazky'), (odpovezeno) => {
    if (odpovezeno) oznacHotovo(m, k);
    const d = dalsiKrok(m, k);
    d ? zobrazKrok(d.m, d.k) : zobrazZaver();
  });
  $('#panelOtazky').parentElement.querySelectorAll('[data-krok]').forEach(b =>
    b.addEventListener('click', () => zobrazKrok(m, +b.dataset.krok)));
  navazPatku(m, k, prehravac.odpovezeno);
}

/* ---- varovné signály ---- */
function krokSignaly(m, k, krok) {
  vykresli(`
    ${hlavicka(m, k)}
    <div class="dvojsloup">
      <div>
        <h1>${krok.nazev}</h1>
        <p style="margin-top:.6rem">${krok.uvod}</p>
        <div id="seznamSignalu" style="margin-top:1rem"></div>
        <div id="vzkazSignaly"></div>
        ${patkaKroku(m, k)}
      </div>
      <div>
        <div class="karta karta-tyrkys" style="text-align:center">
          <div class="postava-stredni" style="margin:0 auto">${ozvenaSVG(krok.nalada)}</div>
          <p class="poznamka" style="margin:.6rem 0 0">U těžkých témat Ozvěna zvážní. Nepředstírá city, jen dává najevo, že téma je vážné.</p>
        </div>
        <div class="karta" style="margin-top:1rem">
          <h3>Pomoc hned teď</h3>
          ${KONFIG.linky.map(l => `<p style="margin:.5rem 0"><b>${l.nazev}</b><br>
            <a href="tel:${l.cislo.replace(/\s/g, '')}" style="font-size:1.15rem;font-weight:800">${l.cislo}</a>
            <span class="poznamka"> · ${l.poznamka}</span></p>`).join('')}
        </div>
      </div>
    </div>`);

  const sez = $('#seznamSignalu');
  sez.innerHTML = SIGNALY.map((s, i) => `
    <label class="signal"><input type="checkbox" data-i="${i}" ${S.signaly.includes(i) ? 'checked' : ''}><span>${s}</span></label>`).join('');
  sez.querySelectorAll('input').forEach(c => c.addEventListener('change', () => {
    const i = +c.dataset.i;
    S.signaly = c.checked ? [...new Set([...S.signaly, i])] : S.signaly.filter(x => x !== i);
    uloz(); vzkazSignaly();
  }));
  vzkazSignaly();
  navazPatku(m, k);
}

function vzkazSignaly() {
  const n = S.signaly.length, c = $('#vzkazSignaly');
  if (!c) return;
  if (n === 0) { c.innerHTML = '<p class="poznamka" style="margin-top:.8rem">Nic jste neoznačili. To je dobře — a seznam si můžete kdykoli projít znovu.</p>'; return; }
  const tezke = S.signaly.some(i => i >= 5);
  c.innerHTML = `<div class="reakce ${tezke ? 'reakce-ne' : 'reakce-ok'}" style="margin-top:1rem">
      <div style="flex:0 0 56px">${ozvenaSVG(tezke ? 'zvazni' : 'upozorni')}</div>
      <div><b>Označili jste ${n} ${n === 1 ? 'položku' : (n < 5 ? 'položky' : 'položek')}.</b>
      ${tezke
        ? 'Mezi nimi je i něco, s čím byste neměli zůstat sami. Zavolejte prosím na <b>116 123</b> (nonstop, zdarma) nebo <b>' + KONFIG.telefon + '</b>. Na druhé straně je člověk.'
        : 'Není to diagnóza. Je to pozvánka zavolat někomu blízkému nebo svému lékaři a říct to nahlas.'}</div>
    </div>`;
}

/* ---- komu zavolat ---- */
function krokKontakty(m, k, krok) {
  vykresli(`
    ${hlavicka(m, k)}
    <h1>${krok.nazev}</h1>
    <p class="poznamka">Čtyři možnosti, které AI nenahradí. Vyberte tu, která je vám teď nejblíž.</p>
    <div class="mrizka-2" style="margin-top:1.2rem">
      ${KOMU_ZAVOLAT.map(x => `
        <div class="kontakt">
          <h3>${x.kdo}</h3>
          <p style="margin:0">${x.co}</p>
          <div class="jak"><b>Jak začít:</b> ${x.jak}</div>
        </div>`).join('')}
    </div>
    <div class="karta karta-tyrkys" style="margin-top:1.2rem">
      <h3>Kam dál, když vás téma zajímá</h3>
      <ul class="seznam" style="margin-top:.6rem">
        ${KONFIG.odkazy.map(o => `<li><a href="${o.url}" target="_blank" rel="noopener">${o.nazev}</a></li>`).join('')}
      </ul>
      <p class="poznamka" style="margin:.6rem 0 0">Při krizi ale člověk, ne program.</p>
    </div>
    ${patkaKroku(m, k, 'Na závěr a test')}`);
  navazPatku(m, k);
}

/* ---- čtyři zásady ---- */
function krokZasady(m, k, krok) {
  vykresli(`
    ${hlavicka(m, k)}
    <div class="hlava-s-postavou">
      <div class="postava-mala postava-ramecek">${ozvenaSVG(krok.nalada)}</div>
      <div>
        <h1>${krok.nazev}</h1>
        <p class="poznamka" style="margin-top:.3rem">Prošli jsme spolu, co rozhovor s AI přináší a kde zavádí. Zbývají čtyři věty, které stojí za zapamatování. Z nich vychází i závěrečný test.</p>
      </div>
    </div>
    <div class="mrizka-2" style="margin-top:1rem">
      ${ZASADY.map(z => `
        <div class="zasada">
          <div class="cislo">${z.c}</div>
          <h3>${z.nazev}</h3>
          <p style="margin:.3rem 0 0">${z.text}</p>
          <p class="poznamka" style="margin:.5rem 0 0">${z.kde}</p>
        </div>`).join('')}
    </div>
    ${patkaKroku(m, k, 'Spustit test')}`);
  navazPatku(m, k);
}

/* ------------------------- závěrečný test ------------------------- */
let T = null;

function krokTest(m, k) {
  T = { i: 0, vysledky: [], m, k };
  zobrazOtazku();
}

function moznostiOtazky(o) {
  if (o.typ === 'pravda') return [
    { text: 'Pravda', spravne: o.spravneJe === true },
    { text: 'Nepravda', spravne: o.spravneJe === false }
  ];
  return o.moznosti;
}

function zobrazOtazku() {
  const o = OTAZKY[T.i], moz = moznostiOtazky(o);
  const popisTypu = { vyber: 'Výběr z možností', pravda: 'Pravda, nebo nepravda?', chyba: 'Najděte chybu' }[o.typ];

  vykresli(`
    <p class="drobecky">Modul 4 ze ${MODULY.length} · Závěrečný test · ${popisTypu}</p>
    <div class="dvojsloup">
      <div>
        <p class="poznamka" style="margin-bottom:.2rem">Otázka ${T.i + 1} z ${OTAZKY.length}</p>
        <div class="test-pruh" aria-hidden="true">
          ${OTAZKY.map((_, i) => {
            const v = T.vysledky[i];
            const tr = i === T.i ? 'je-ted' : (v === true ? 'je-hotovo' : (v === false ? 'je-chyba' : ''));
            return `<span class="${tr}"></span>`;
          }).join('')}
        </div>
        <h1>${o.text}</h1>
        ${o.ukazka ? `
          <div style="margin-top:1rem">
            <div class="citace ${o.ukazka.kdo === 'clovek' ? 'citace-clovek' : ''}">${o.ukazka.text}</div>
            <p class="pod-citaci">${o.ukazka.pod}</p>
          </div>` : '<div style="height:.8rem"></div>'}
        <div id="volbyTest">
          ${moz.map((x, i) => `<button class="volba" data-i="${i}"><span class="pismeno">${'ABC'[i]}</span><span>${x.text}</span></button>`).join('')}
        </div>
        <div id="reakceTest"></div>
      </div>
      <div>
        <div class="karta karta-tyrkys" style="text-align:center">
          <div class="postava-stredni" style="margin:0 auto" id="postavaTest">${ozvenaSVG('premysli')}</div>
          <p class="poznamka" id="hlaskaTest" style="margin:.6rem 0 0">Nespěchejte. Odpověď si můžete rozmyslet.</p>
        </div>
        <div class="karta" style="margin-top:1rem">
          <h3>Zásada ${o.zasada}: ${ZASADY[o.zasada - 1].nazev}</h3>
          <p class="poznamka" style="margin:.4rem 0 0">Nápovědu najdete v modulech, test lze kdykoli opakovat.</p>
          <button class="tl" id="konecTestu" style="margin-top:.8rem;font-size:.85rem;padding:.5rem 1rem">Přerušit test</button>
        </div>
      </div>
    </div>`);

  $('#volbyTest').querySelectorAll('.volba').forEach(b =>
    b.addEventListener('click', () => odpovedTest(+b.dataset.i)));
  $('#konecTestu').addEventListener('click', zobrazUvod);
}

function odpovedTest(i) {
  const o = OTAZKY[T.i], moz = moznostiOtazky(o);
  const spravnyIndex = moz.findIndex(x => x.spravne);
  const trefa = i === spravnyIndex;
  T.vysledky[T.i] = trefa;

  const tl = [...$('#volbyTest').querySelectorAll('.volba')];
  tl.forEach((b, j) => {
    b.disabled = true;
    if (j === spravnyIndex) { b.classList.add('volba-spravne'); b.querySelector('.pismeno').textContent = '✓'; }
    else if (j === i) b.classList.add('volba-chybne');
  });

  $('#postavaTest').innerHTML = ozvenaSVG(trefa ? 'vita' : 'upozorni');
  $('#hlaskaTest').textContent = trefa ? 'Správně! Dobře jste si všimli.' : 'Tahle nebyla správně. Nevadí, test jde opakovat.';

  const posledni = T.i === OTAZKY.length - 1;
  $('#reakceTest').innerHTML = `
    <div class="reakce ${trefa ? 'reakce-ok' : 'reakce-ne'}">
      <div style="flex:1"><b>${trefa ? 'Správně.' : 'Správná odpověď je ' + 'ABC'[spravnyIndex] + '.'}</b> ${o.reakce}</div>
      <button class="tl ${trefa ? '' : 'tl-hlavni'}" id="dalsiOtazka" style="flex:0 0 auto;align-self:center">
        ${posledni ? 'Zobrazit výsledek' : 'Další otázka'} →</button>
    </div>`;
  $('#dalsiOtazka').addEventListener('click', () => {
    if (posledni) { vyhodnot(); return; }
    T.i++; zobrazOtazku();
  });
  Nahlas.oznam($('#reakceTest').textContent);
}

function vyhodnot() {
  const skore = T.vysledky.filter(Boolean).length;
  const proslo = skore >= KONFIG.hraniceUspechu;
  S.test = { skore, celkem: OTAZKY.length, proslo, kdy: new Date().toISOString() };
  oznacHotovo(T.m, T.k);
  uloz();

  const chybne = OTAZKY.map((o, i) => ({ o, i })).filter(x => T.vysledky[x.i] === false);

  vykresli(`
    <p class="drobecky">Závěrečný test · výsledek</p>
    <div class="dvojsloup">
      <div>
        <h1>${proslo ? 'Hotovo. Prošli jste.' : 'Zatím to nestačilo.'}</h1>
        <div class="karta" style="margin-top:1rem;display:flex;gap:1.4rem;align-items:center">
          <div>
            <div class="vysledek-cislo">${skore}<span style="font-size:1.4rem;color:var(--seda)">/${OTAZKY.length}</span></div>
            <p class="poznamka" style="margin:0">správných odpovědí</p>
          </div>
          <div style="flex:1">
            <p style="margin:0">${proslo
              ? 'Zvládli jste hranici ' + KONFIG.hraniceUspechu + ' z ' + OTAZKY.length + '. Zásady umíte rozpoznat v praxi, a to je přesně to, oč v kurzu šlo.'
              : 'K úspěchu je potřeba ' + KONFIG.hraniceUspechu + ' z ' + OTAZKY.length + '. Projděte si prosím znovu modul, kde jste chybovali, a test opakujte. Kolikrát chcete.'}</p>
          </div>
        </div>

        ${chybne.length ? `
          <div class="karta" style="margin-top:1rem">
            <h3>Na co se ještě podívat</h3>
            <ul class="seznam" style="margin-top:.6rem">
              ${chybne.map(x => `<li><b>Zásada ${x.o.zasada}: ${ZASADY[x.o.zasada - 1].nazev}</b><br><span class="poznamka">${x.o.reakce}</span></li>`).join('')}
            </ul>
          </div>` : ''}

        <div class="radek-tlacitek">
          <button class="tl tl-hlavni tl-velke" id="znovu">Opakovat test</button>
          <button class="tl" id="naZaver">Shrnutí kurzu</button>
          <button class="tl" id="naUvodT">Přehled modulů</button>
        </div>
        <p class="poznamka" style="margin-top:1rem">Hranici úspěšnosti (${KONFIG.hraniceUspechu} z ${OTAZKY.length}) a podobu potvrzení o absolvování určí odborný garant kurzu.</p>
      </div>
      <div>
        <div class="karta karta-tyrkys" style="text-align:center">
          <div class="postava-stredni" style="margin:0 auto">${ozvenaSVG(proslo ? 'vita' : 'premysli')}</div>
          <p class="poznamka" style="margin:.6rem 0 0">${proslo ? 'Děkuji, že jste to se mnou dotáhli.' : 'Chyba v testu nic neznamená. Jde o to si toho příště všimnout.'}</p>
        </div>
      </div>
    </div>`);

  $('#znovu').addEventListener('click', () => { T = { i: 0, vysledky: [], m: T.m, k: T.k }; zobrazOtazku(); });
  $('#naZaver').addEventListener('click', zobrazZaver);
  $('#naUvodT').addEventListener('click', zobrazUvod);
}

/* ------------------------- závěr kurzu ------------------------- */
function zobrazZaver() {
  const t = S.test;
  vykresli(`
    <div class="hlava-s-postavou">
      <div class="postava-mala postava-ramecek">${ozvenaSVG('vita')}</div>
      <div>
        <h1>Děkuji, že jste si udělali čas</h1>
        <p class="poznamka" style="margin-top:.3rem">${t
          ? 'Test: ' + t.skore + ' z ' + t.celkem + (t.proslo ? ' — splněno.' : ' — zkuste ho prosím znovu.')
          : 'Test zatím nemáte hotový. Můžete se k němu kdykoli vrátit.'}</p>
      </div>
    </div>

    <div class="karta">
      <h2>Čtyři věty na závěr</h2>
      <div class="mrizka-2" style="margin-top:1rem">
        ${ZASADY.map(z => `<div class="zasada"><div class="cislo">${z.c}</div><h3>${z.nazev}</h3><p style="margin:.3rem 0 0">${z.text}</p></div>`).join('')}
      </div>
    </div>

    <div class="karta karta-tyrkys" style="margin-top:1rem">
      <h2>A jedna věc, kterou neumím</h2>
      <p style="margin-top:.5rem">Nepřivolám k vám pomoc a nepoznám vždy, jak vážné to je. Když bude zle, zavolejte prosím člověku. Čísla jsou dole na obrazovce a platí ve dne v noci.</p>
      <ul class="seznam" style="margin-top:.8rem">
        ${KONFIG.odkazy.map(o => `<li><a href="${o.url}" target="_blank" rel="noopener">${o.nazev}</a></li>`).join('')}
      </ul>
    </div>

    <div class="radek-tlacitek">
      <button class="tl tl-hlavni" id="zpetUvod">Přehled modulů</button>
      ${t ? '<button class="tl" id="testZnovu">Opakovat test</button>' : ''}
      <button class="tl" id="tisk">Vytisknout shrnutí</button>
    </div>`);

  $('#zpetUvod').addEventListener('click', zobrazUvod);
  if ($('#testZnovu')) $('#testZnovu').addEventListener('click', () => {
    const m = MODULY.length - 1, k = MODULY[m].kroky.length - 1;
    krokTest(m, k);
  });
  $('#tisk').addEventListener('click', () => window.print());
}

/* ------------------------- spuštění ------------------------- */
function start() {
  nastavPismo(S.pismo || 2);
  nastavPohyb(S.pohyb || 'zapnuto');

  document.querySelectorAll('.pismo-sada button').forEach((b, i) =>
    b.addEventListener('click', () => nastavPismo(i + 1)));

  $('#btnPohyb').addEventListener('click', () =>
    nastavPohyb(S.pohyb === 'vypnuto' ? 'zapnuto' : 'vypnuto'));

  const bn = $('#btnNahlas');
  if (!Nahlas.podporovano) {
    bn.disabled = true;
    bn.title = 'Tento prohlížeč čtení nahlas nepodporuje.';
  } else {
    Nahlas.zap = false;                       // čtení spouští až kliknutí
    bn.setAttribute('aria-pressed', 'false');
    bn.addEventListener('click', () => Nahlas.prepni());
  }

  $('#domu').addEventListener('click', zobrazUvod);
  $('#pruhOdkaz').addEventListener('click', zobrazUvod);

  // patička s linkami
  $('#linky').innerHTML = KONFIG.linky
    .map(l => `${l.nazev} <a href="tel:${l.cislo.replace(/\s/g, '')}">${l.cislo}</a>`)
    .join(' · ');

  zobrazUvod();
}

document.addEventListener('DOMContentLoaded', start);
