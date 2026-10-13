/* Přehrávač ukázek. Ukázka je časová stopa událostí, ne video:
   běží v prohlížeči, dá se zastavit, převinout, zpomalit, vypnout titulky
   i animace a celá je dostupná jako přepis. */

function Prehravac(ukazka, kam, panel, hotovo) {
  const stopa = [...ukazka.stopa].sort((a, b) => a.t - b.t);
  const st = {
    cas: 0, hraje: false, rychlost: 1, titulky: true,
    index: 0, pauzaVyresena: false, dohrano: false, odpovezeno: false
  };
  let posledniTik = 0, raf = 0;

  kam.innerHTML = `
    <div class="prehravac">
      <div class="scena">
        <div class="scena-zpravy" id="scena"></div>
        <div class="scena-spodek">
          <div id="razitkoMisto"></div>
          <div class="scena-postava" id="scenaPostava">${ozvenaSVG('vita')}</div>
        </div>
        <div class="titulek-pruh" id="titulek" aria-live="polite"></div>
      </div>
      <div class="ovladani">
        <button class="hrat" id="btnHrat" aria-label="Přehrát ukázku"><span id="ikonaHrat">▶</span></button>
        <div class="casova-osa" id="osa" role="slider" tabindex="0" aria-label="Čas v ukázce"
             aria-valuemin="0" aria-valuemax="${ukazka.delka}" aria-valuenow="0"><i id="osaVypln" style="width:0%"></i></div>
        <span class="cas" id="cas">0:00 / ${mmss(ukazka.delka)}</span>
        <button id="btnCC" aria-pressed="true" title="Titulky">CC</button>
        <button id="btnRychlost" title="Rychlost přehrávání">1×</button>
        <button id="btnPrepis" aria-pressed="false">Přepis</button>
      </div>
    </div>
    <div class="prepis-panel skryte" id="prepis">
      <b>Přepis ukázky</b>
      <p style="margin-top:.5rem">${ukazka.prepis}</p>
    </div>`;

  const scena = kam.querySelector('#scena');
  const elRazitko = kam.querySelector('#razitkoMisto');
  const elTitulek = kam.querySelector('#titulek');
  const elPostava = kam.querySelector('#scenaPostava');
  const elOsa = kam.querySelector('#osaVypln');
  const elCas = kam.querySelector('#cas');
  const btnHrat = kam.querySelector('#btnHrat');
  const ikona = kam.querySelector('#ikonaHrat');

  /* ---- otázka vedle ukázky ---- */
  panel.innerHTML = `
    <div class="karta karta-tyrkys">
      <h3>Zastavte a přemýšlejte</h3>
      <p id="otazkaText" class="poznamka">Pusťte si ukázku. V klíčové chvíli se sama zastaví a položí otázku.</p>
      <div id="volby"></div>
      <div id="reakce"></div>
    </div>`;
  const elOtazka = panel.querySelector('#otazkaText');
  const elVolby = panel.querySelector('#volby');
  const elReakce = panel.querySelector('#reakce');

  function nabidniOtazku() {
    elOtazka.className = '';
    elOtazka.textContent = ukazka.otazka.text;
    elVolby.innerHTML = ukazka.otazka.moznosti
      .map((m, i) => `<button class="volba" data-i="${i}"><span class="pismeno">${'ABC'[i]}</span><span>${m.text}</span></button>`)
      .join('');
    elVolby.querySelectorAll('.volba').forEach(b =>
      b.addEventListener('click', () => odpovez(+b.dataset.i)));
    panel.querySelector('.karta').scrollIntoView({ block: 'nearest' });
  }

  function odpovez(i) {
    const m = ukazka.otazka.moznosti[i];
    const tlacitka = [...elVolby.querySelectorAll('.volba')];
    tlacitka[i].classList.add(m.spravne ? 'volba-spravne' : 'volba-chybne');
    if (m.spravne) {
      tlacitka.forEach(b => b.disabled = true);
      st.odpovezeno = true;
      st.pauzaVyresena = true;
      elReakce.innerHTML = `<div class="reakce reakce-ok"><div style="flex:0 0 46px">${ozvenaSVG('vita')}</div>
        <div><b>Správně.</b> ${m.reakce}</div></div>
        <div class="radek-tlacitek"><button class="tl tl-hlavni" id="dal">Pokračovat v ukázce →</button></div>`;
      elReakce.querySelector('#dal').addEventListener('click', () => { prehraj(true); elReakce.querySelector('#dal').disabled = true; });
    } else {
      elReakce.innerHTML = `<div class="reakce reakce-ne"><div style="flex:0 0 46px">${ozvenaSVG('upozorni')}</div>
        <div><b>Ještě ne.</b> ${m.reakce} Zkuste to prosím znovu, klidně si ukázku převiňte.</div></div>`;
    }
    Nahlas.oznam(elReakce.textContent);
  }

  /* ---- vykreslování stopy ---- */
  function udalost(u) {
    if (u.typ === 'stitek') {
      const d = document.createElement('div');
      d.className = 'stitek-scena'; d.textContent = u.text;
      scena.appendChild(d);
    }
    if (u.typ === 'zprava') {
      const d = document.createElement('div');
      d.className = 'bublina bublina-' + u.kdo;
      d.innerHTML = u.zvyraznit
        ? escapuj(u.text).replace(escapuj(u.zvyraznit), '<mark>' + escapuj(u.zvyraznit) + '</mark>')
        : escapuj(u.text);
      scena.appendChild(d);
      scena.scrollTop = scena.scrollHeight;
    }
    if (u.typ === 'razitko') {
      elRazitko.innerHTML = '';
      const d = document.createElement('div');
      d.className = 'razitko'; d.textContent = u.text;
      elRazitko.appendChild(d);
    }
    if (u.typ === 'nalada') elPostava.innerHTML = ozvenaSVG(u.nalada);
    if (u.typ === 'pauza' && !st.pauzaVyresena) { stop(); nabidniOtazku(); }
  }

  function prekresliOdZacatku() {
    scena.innerHTML = '';
    elRazitko.innerHTML = '';
    elPostava.innerHTML = ozvenaSVG('vita');
    st.index = 0;
    for (const u of stopa) {
      if (u.t > st.cas) break;
      if (u.typ !== 'pauza') udalost(u);
      st.index++;
    }
    titulek();
  }

  function titulek() {
    if (!st.titulky) { elTitulek.textContent = ''; return; }
    let t = '';
    for (const x of ukazka.titulky) { if (x.t <= st.cas) t = x.text; }
    if (elTitulek.textContent !== t) elTitulek.textContent = t;
  }

  function tik(ted) {
    if (!st.hraje) return;
    const dt = Math.min((ted - posledniTik) / 1000, .25) * st.rychlost;
    posledniTik = ted;
    st.cas = Math.min(st.cas + dt, ukazka.delka);

    while (st.index < stopa.length && stopa[st.index].t <= st.cas) {
      udalost(stopa[st.index]); st.index++;
      if (!st.hraje) break;            // pauza zastavila přehrávání
    }
    titulek(); ukazatel();

    if (st.cas >= ukazka.delka) { stop(); dokonci(); return; }
    raf = requestAnimationFrame(tik);
  }

  function ukazatel() {
    const p = (st.cas / ukazka.delka) * 100;
    elOsa.style.width = p + '%';
    elCas.textContent = mmss(st.cas) + ' / ' + mmss(ukazka.delka);
    kam.querySelector('#osa').setAttribute('aria-valuenow', Math.round(st.cas));
  }

  function prehraj(odPauzy) {
    if (!odPauzy && !st.pauzaVyresena) {
      const p = stopa.find(u => u.typ === 'pauza');
      if (p && st.cas >= p.t) { nabidniOtazku(); return; }
    }
    if (odPauzy) st.cas += .1;
    st.hraje = true; ikona.textContent = '❚❚'; btnHrat.setAttribute('aria-label', 'Zastavit ukázku');
    posledniTik = performance.now();
    raf = requestAnimationFrame(tik);
  }

  function stop() {
    st.hraje = false; cancelAnimationFrame(raf);
    ikona.textContent = '▶'; btnHrat.setAttribute('aria-label', 'Přehrát ukázku');
  }

  function dokonci() {
    if (st.dohrano) return;
    st.dohrano = true;
    if (!st.odpovezeno) nabidniOtazku();
    const hotova = st.odpovezeno;
    elReakce.insertAdjacentHTML('beforeend',
      `<div class="radek-tlacitek"><button class="tl tl-hlavni tl-velke" id="konecUkazky">
        ${hotova ? 'Pokračovat →' : 'Pokračovat bez odpovědi →'}</button></div>`);
    elReakce.querySelector('#konecUkazky').addEventListener('click', () => hotovo(st.odpovezeno));
  }

  function previn(k) {
    stop();
    st.cas = Math.max(0, Math.min(k, ukazka.delka));
    st.dohrano = false;
    prekresliOdZacatku(); ukazatel();
  }

  btnHrat.addEventListener('click', () => st.hraje ? stop() : prehraj(st.pauzaVyresena));
  kam.querySelector('#btnCC').addEventListener('click', e => {
    st.titulky = !st.titulky;
    e.currentTarget.setAttribute('aria-pressed', String(st.titulky));
    titulek();
  });
  kam.querySelector('#btnRychlost').addEventListener('click', e => {
    st.rychlost = { 1: .75, .75: .5, .5: 1 }[st.rychlost];
    e.currentTarget.textContent = String(st.rychlost).replace('0.', '0,') + '×';
  });
  kam.querySelector('#btnPrepis').addEventListener('click', e => {
    const p = kam.querySelector('#prepis'), zap = p.classList.toggle('skryte');
    e.currentTarget.setAttribute('aria-pressed', String(!zap));
  });
  const osa = kam.querySelector('#osa');
  osa.addEventListener('click', e => {
    const r = osa.getBoundingClientRect();
    previn(((e.clientX - r.left) / r.width) * ukazka.delka);
  });
  osa.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { previn(st.cas + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { previn(st.cas - 5); e.preventDefault(); }
    if (e.key === ' ' || e.key === 'Enter') { st.hraje ? stop() : prehraj(st.pauzaVyresena); e.preventDefault(); }
  });

  ukazatel();
  return { stop, prehraj, odpovezeno: () => st.odpovezeno };
}

function mmss(s) {
  s = Math.max(0, Math.round(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function escapuj(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
