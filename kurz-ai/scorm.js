/* Propojení s LMS přes SCORM. Umí SCORM 1.2 i SCORM 2004.
   Když kurz neběží v LMS, všechny funkce jsou prázdné a kurz funguje dál
   jako běžná stránka — postup se pak ukládá jen do prohlížeče. */

const SCORM = {
  api: null,
  verze: null,          // '1.2' | '2004'
  pripojeno: false,
  zacatek: Date.now(),
  _ukonceno: false,

  /* --- hledání API objektu v rámcích nadřazených oken --- */
  _najdi(okno, nazev, hloubka) {
    let o = okno, i = 0;
    while (o && i < 10) {
      try { if (o[nazev]) return o[nazev]; } catch (e) { /* jiná doména */ }
      if (o.parent === o) break;
      o = o.parent; i++;
    }
    return null;
  },
  _najdiApi() {
    for (const [nazev, verze] of [['API_1484_11', '2004'], ['API', '1.2']]) {
      let a = this._najdi(window, nazev);
      if (!a && window.opener) a = this._najdi(window.opener, nazev);
      if (a) return { api: a, verze };
    }
    return null;
  },

  _volej(jmeno1_2, jmeno2004, ...arg) {
    if (!this.api) return '';
    const f = this.api[this.verze === '2004' ? jmeno2004 : jmeno1_2];
    try { return typeof f === 'function' ? f.apply(this.api, arg) : ''; }
    catch (e) { return ''; }
  },
  dej(klic) { return String(this._volej('LMSGetValue', 'GetValue', klic) || ''); },
  nastav(klic, hodnota) { return this._volej('LMSSetValue', 'SetValue', klic, String(hodnota)); },
  potvrd() { return this._volej('LMSCommit', 'Commit', ''); },

  /* --- názvy prvků se mezi verzemi liší --- */
  _k(co) {
    const m = {
      poloha: ['cmi.core.lesson_location', 'cmi.location'],
      data: ['cmi.suspend_data', 'cmi.suspend_data'],
      skore: ['cmi.core.score.raw', 'cmi.score.raw'],
      skoreMin: ['cmi.core.score.min', 'cmi.score.min'],
      skoreMax: ['cmi.core.score.max', 'cmi.score.max'],
      cas: ['cmi.core.session_time', 'cmi.session_time'],
      odchod: ['cmi.core.exit', 'cmi.exit'],
      jmeno: ['cmi.core.student_name', 'cmi.learner_name']
    }[co];
    return this.verze === '2004' ? m[1] : m[0];
  },

  start() {
    const n = this._najdiApi();
    if (!n) return false;
    this.api = n.api; this.verze = n.verze;
    const ok = this._volej('LMSInitialize', 'Initialize', '');
    this.pripojeno = (ok === 'true' || ok === true);
    if (!this.pripojeno) { this.api = null; return false; }
    if (this.verze === '1.2') {
      // „not attempted“ by jinak zůstalo i po dokončení modulu
      if (this.dej('cmi.core.lesson_status') === 'not attempted') this.nastav('cmi.core.lesson_status', 'incomplete');
    } else if (this.dej('cmi.completion_status') === 'unknown') {
      this.nastav('cmi.completion_status', 'incomplete');
    }
    this.nastav(this._k('odchod'), 'suspend');
    this.potvrd();
    return true;
  },

  /* --- postup účastníka --- */
  nacti() { return this.pripojeno ? this.dej(this._k('data')) : ''; },

  _casovac: 0,
  uloz(text, poloha) {
    if (!this.pripojeno) return;
    // SCORM 1.2 garantuje jen 4096 znaků; delší stav raději neposíláme
    if (this.verze === '1.2' && text.length > 4000) return;
    this.nastav(this._k('data'), text);
    if (poloha != null) this.nastav(this._k('poloha'), String(poloha).slice(0, 255));
    // hodnoty posíláme hned, potvrzení jen jednou za čas: u některých LMS
    // je commit síťový dotaz a klikání po obrazovce by ho volalo zbytečně často
    if (!this._casovac) this._casovac = setTimeout(() => { this._casovac = 0; this.potvrd(); }, 1500);
  },

  /* --- výsledek testu v procentech --- */
  vysledek(procenta, proslo) {
    if (!this.pripojeno) return;
    this.nastav(this._k('skore'), Math.round(procenta));
    this.nastav(this._k('skoreMin'), 0);
    this.nastav(this._k('skoreMax'), 100);
    if (this.verze === '2004') {
      this.nastav('cmi.score.scaled', (procenta / 100).toFixed(2));
      this.nastav('cmi.success_status', proslo ? 'passed' : 'failed');
    } else {
      this.nastav('cmi.core.lesson_status', proslo ? 'passed' : 'failed');
    }
    this.potvrd();
  },

  dokonceno() {
    if (!this.pripojeno) return;
    if (this.verze === '2004') this.nastav('cmi.completion_status', 'completed');
    else if (!['passed', 'failed'].includes(this.dej('cmi.core.lesson_status')))
      this.nastav('cmi.core.lesson_status', 'completed');
    this.nastav(this._k('odchod'), '');
    this.potvrd();
  },

  konec() {
    if (!this.pripojeno || this._ukonceno) return;
    this._ukonceno = true;
    if (this._casovac) { clearTimeout(this._casovac); this._casovac = 0; }
    this.nastav(this._k('cas'), this._trvani(Date.now() - this.zacatek));
    this.potvrd();
    this._volej('LMSFinish', 'Terminate', '');
    this.pripojeno = false;
  },

  _trvani(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), v = s % 60;
    return this.verze === '2004'
      ? `PT${h}H${m}M${v}S`
      : `${String(h).padStart(4, '0')}:${String(m).padStart(2, '0')}:${String(v).padStart(2, '0')}`;
  }
};
