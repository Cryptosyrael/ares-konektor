/* Stroj, který naslouchá – aplikace kurzu (bez serveru, čistý JavaScript) */
(function () {
  "use strict";

  // ---------- pomocné funkce ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k !== null && k !== undefined) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmt = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const JMENA = { L: "Honza", O: "Ozvěna", J: "Paní Jana", T: "Pan Tomáš", CH: "Chatbot", TIT: "Uživatelka" };

  // ---------- uložený postup a nastavení ----------
  // V LMS (SCORM) se postup drží i tam, mimo LMS jen v prohlížeči.
  SCORM.start();
  const zLms = (() => { try { return JSON.parse(SCORM.nacti() || "null"); } catch (e) { return null; } })();
  const stav = zLms || {};                 // zrcadlo všeho, co posíláme do LMS

  const store = {
    get(k, d) {
      if (k in stav) return stav[k];
      try { const v = localStorage.getItem("skn-" + k); if (v !== null) return (stav[k] = JSON.parse(v)); }
      catch (e) { /* soukromý režim */ }
      return d;
    },
    set(k, v) {
      stav[k] = v;
      try { localStorage.setItem("skn-" + k, JSON.stringify(v)); } catch (e) { /* soukromý režim */ }
      SCORM.uloz(JSON.stringify(stav), kdeJsem());
    },
  };

  const kdeJsem = () => {
    const [a, b] = location.hash.replace(/^#\/?/, "").split("/");
    return a === "video" ? "Video " + b : a === "modul" ? "Modul " + b : a === "test" ? "Závěrečný test" : "Úvod";
  };

  const progress = store.get("postup", { videa: {}, test: null });
  const saveProgress = () => {
    store.set("postup", progress);
    // kurz je dokončený, až jsou shlédnutá všechna videa a je za sebou test
    if (progress.test && Object.keys(VIDEA).every((id) => progress.videa[id])) SCORM.dokonceno();
  };
  const modulHotov = (m) => m.videa.length > 0 ? m.videa.every((v) => progress.videa[v]) : !!(progress.test && progress.test.uspel);

  // ---------- nastavení zobrazení ----------
  function setSize(n) {
    document.body.classList.remove("size-1", "size-2", "size-3");
    document.body.classList.add("size-" + n);
    document.querySelectorAll(".size-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size == n)));
    store.set("pismo", n);
  }
  document.querySelectorAll(".size-btn").forEach((b) => b.addEventListener("click", () => setSize(b.dataset.size)));
  setSize(store.get("pismo", 2));

  const motionToggle = $("#motionToggle");
  const applyMotion = () => { document.body.classList.toggle("nomotion", motionToggle.checked); store.set("pohyb", motionToggle.checked); };
  motionToggle.checked = store.get("pohyb", false);
  motionToggle.addEventListener("change", applyMotion);
  applyMotion();

  // Předčítání obsahu stránky hlasem prohlížeče.
  const readBtn = $("#readBtn");
  let reading = false;
  function stopReading() { if ("speechSynthesis" in window) speechSynthesis.cancel(); reading = false; readBtn.setAttribute("aria-pressed", "false"); readBtn.querySelector("span").textContent = "Přečíst nahlas"; }
  readBtn.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) { alert("Tento prohlížeč neumí předčítat. Zkuste prosím jiný prohlížeč, například Chrome nebo Edge."); return; }
    if (reading) { stopReading(); return; }
    const main = $("#obsah").cloneNode(true);
    main.querySelectorAll(".player, .sr, script, svg").forEach((n) => n.remove());
    const text = main.innerText.replace(/\s+/g, " ").trim();
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "cs-CZ"; u.rate = 0.92;
    const voice = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("cs"));
    if (voice) u.voice = voice;
    u.onend = stopReading; u.onerror = stopReading;
    speechSynthesis.speak(u);
    reading = true; readBtn.setAttribute("aria-pressed", "true"); readBtn.querySelector("span").textContent = "Zastavit čtení";
  });

  // Lišta s kontakty
  $("#helpContacts").innerHTML = KURZ.kontakty.map((k) => `${esc(k.nazev)} <a href="tel:${k.tel}">${esc(k.cislo)}</a>`).join('<span class="sep">·</span>');

  // ---------- zvuk ----------
  let activePlayer = null;
  const audioCache = new Map();
  // Vrátí <audio> pro daný kód (audio/KÓD.mp3), nebo null, když soubor neexistuje.
  function loadAudio(kod) {
    if (!kod) return Promise.resolve(null);
    if (audioCache.has(kod)) return Promise.resolve(audioCache.get(kod));
    return new Promise((resolve) => {
      const a = new Audio("audio/" + kod + ".mp3");
      a.preload = "auto";
      let done = false;
      const ok = () => { if (done) return; done = true; audioCache.set(kod, a); resolve(a); };
      const ko = () => { if (done) return; done = true; audioCache.set(kod, null); resolve(null); };
      a.addEventListener("canplaythrough", ok, { once: true });
      a.addEventListener("loadedmetadata", ok, { once: true });
      a.addEventListener("error", ko, { once: true });
      setTimeout(() => { if (!done) { if (a.readyState >= 1) ok(); else ko(); } }, 4000);
      a.load();
    });
  }
  const odhadSekund = (text) => Math.max(1.5, text.split(/\s+/).length * 0.55 + 0.8);

  // ---------- postavy ----------
  function charNode(kdo, pose, cls = "") {
    const n = el("div", { class: "char " + cls, "data-kdo": kdo, "aria-hidden": "true" });
    n.innerHTML = CHAR[kdo][pose] || CHAR[kdo][Object.keys(CHAR[kdo])[0]];
    n.dataset.pose = pose;
    return n;
  }
  function setPose(node, kdo, pose) {
    if (!pose || node.dataset.pose === pose) return;
    node.innerHTML = CHAR[kdo][pose] || node.innerHTML;
    node.dataset.pose = pose;
  }

  // ---------- přehrávač videa ----------
  class Player {
    constructor(id, root) {
      this.id = id; this.v = VIDEA[id]; this.root = root;
      this.idx = -1; this.playing = false; this.paused = false; this.finished = false;
      this.audio = null; this.timers = []; this.cancelToken = 0;
      this.subsOn = true; this.chatBody = null;
      this.elapsed = 0; this.total = this.v.repliky.reduce((s, r) => s + odhadSekund(r.text) + 0.8, 0);
      this.build();
    }
    build() {
      const v = this.v;
      const chatVideo = !!v.chat;
      this.stage = el("div", { class: "stage" + (v.tlumene ? " tlumene" : ""), "aria-label": "Animované video" });
      this.stage.append(el("div", { class: "warn" }, v.upozorneni));
      this.bars = el("div", { class: "bars", "aria-hidden": "true" });
      [40, 70, 55, 90, 65, 80, 50, 95, 60, 75, 45, 85].forEach((h) => this.bars.append(el("i", { style: "height:" + h + "%" })));
      this.stage.append(this.bars);
      this.honza = charNode("honza", chatVideo ? "think" : "hello", "ch ho");
      this.ozvena = charNode("ozvena", chatVideo ? "wait" : "hello", "ch oz" + (this.id === "1.1" ? " hidden" : ""));
      this.center = el("div", { class: "center" });
      this.stage.append(this.honza, this.ozvena, this.center);
      this.subs = el("div", { class: "subs", "aria-live": "off" });
      this.stage.append(this.subs);
      // úvodní překryv
      this.overlay = el("div", { class: "overlay" },
        el("div", { class: "box" },
          el("button", { class: "bigplay", "aria-label": "Přehrát video", onclick: () => this.start() }, playIcon(44)),
          el("h3", {}, "Video " + this.id + " · " + v.nazev),
          el("p", {}, "Délka " + v.delka + ". Video můžete kdykoli zastavit. Pod videem najdete přepis.")));
      this.stage.append(this.overlay);
      // ovládání
      this.playBtn = el("button", { class: "ctrl", "aria-label": "Přehrát", onclick: () => this.toggle() }, playIcon(24));
      this.progFill = el("i");
      this.timeEl = el("span", { class: "time" }, "0:00 / " + fmt(this.total));
      this.subsBtn = el("button", { class: "ctrl-label", "aria-pressed": "true", onclick: () => { this.subsOn = !this.subsOn; this.stage.classList.toggle("nosubs", !this.subsOn); this.subsBtn.setAttribute("aria-pressed", String(this.subsOn)); } }, "Titulky");
      const restart = el("button", { class: "ctrl sec", "aria-label": "Od začátku", title: "Od začátku", onclick: () => this.restart() }, restartIcon());
      const next = el("button", { class: "ctrl sec", "aria-label": "Další replika", title: "Další replika", onclick: () => this.skip() }, nextIcon());
      this.controls = el("div", { class: "controls" }, this.playBtn, restart, next, el("div", { class: "prog", role: "progressbar", "aria-label": "Průběh videa" }, this.progFill), this.timeEl, this.subsBtn);
      this.root.append(el("div", { class: "player" }, this.stage, this.controls));
      // přepis
      this.trans = el("ol");
      v.repliky.forEach((r, i) => this.trans.append(el("li", { class: r.kdo === "CH" ? "bot" : r.kdo === "O" ? "oz" : "", "data-i": i }, el("b", {}, JMENA[r.kdo] + (r.kdo === "CH" ? " (píše)" : "")), el("span", {}, r.text))));
      const det = el("details", { class: "transcript", open: true }, el("summary", {}, "Přepis videa"), this.trans);
      this.root.append(det);
    }
    // --- ovládání ---
    start() { this.overlay.remove(); this.playing = true; this.paused = false; this.setPlayIcon(); this.tick(); this.runFrom(0); }
    toggle() {
      if (this.finished) { this.restart(); return; }
      if (!this.playing) { this.start(); return; }
      this.paused = !this.paused;
      if (this.audio) { if (this.paused) this.audio.pause(); else this.audio.play().catch(() => {}); }
      if (this.loopAudio) { if (this.paused) this.loopAudio.pause(); else this.loopAudio.play().catch(() => {}); }
      this.setPlayIcon();
    }
    setPlayIcon() {
      const playingNow = this.playing && !this.paused && !this.finished;
      this.playBtn.innerHTML = ""; this.playBtn.append(playingNow ? pauseIcon(24) : playIcon(24));
      this.playBtn.setAttribute("aria-label", playingNow ? "Pozastavit" : "Přehrát");
      this.honza.classList.toggle("speaking", playingNow && this.speaker === "L");
      this.ozvena.classList.toggle("speaking", playingNow && this.speaker === "O");
    }
    stopAll() { this.cancelToken++; this.timers.forEach(clearTimeout); this.timers = []; if (this.audio) { this.audio.pause(); this.audio = null; } this.stopLoop(); }
    restart() {
      this.stopAll(); this.finished = false; this.paused = false; this.playing = true; this.elapsed = 0;
      this.center.innerHTML = ""; this.center.className = "center"; this.chatBody = null;
      this.stage.classList.remove("closing"); this.stage.querySelectorAll(".overlay").forEach((o) => o.remove());
      setPose(this.honza, "honza", this.v.chat ? "think" : "hello"); setPose(this.ozvena, "ozvena", this.v.chat ? "wait" : "hello");
      this.ozvena.classList.toggle("hidden", this.id === "1.1"); this.honza.classList.remove("dim"); this.ozvena.classList.remove("dim");
      this.setPlayIcon(); this.runFrom(0);
    }
    skip() { if (!this.playing || this.finished) return; const i = this.idx; this.stopAll(); this.stage.querySelectorAll(".overlay.pausepanel").forEach((o) => o.remove()); this.paused = false; this.setPlayIcon(); this.runFrom(i + 1); }
    tick() {
      if (this.finished || !this.playing) return;
      if (!this.paused) { this.elapsed = Math.min(this.total, this.elapsed + 0.25); }
      this.progFill.style.width = (100 * this.elapsed / this.total) + "%";
      this.timeEl.textContent = fmt(this.elapsed) + " / " + fmt(this.total);
      this.timers.push(setTimeout(() => this.tick(), 250));
    }
    async waitWhilePaused(token) { while (this.paused && token === this.cancelToken) await sleep(120); }
    // --- běh videa ---
    async runFrom(i) {
      const token = ++this.cancelToken;
      for (let k = i; k < this.v.repliky.length; k++) {
        if (token !== this.cancelToken) return;
        this.idx = k;
        await this.runStep(this.v.repliky[k], token);
        if (token !== this.cancelToken) return;
        await this.waitWhilePaused(token);
        await sleep(this.v.repliky[k].pauza ? 300 : 700);
      }
      if (token === this.cancelToken) this.finish();
    }
    async runStep(r, token) {
      // zvýraznění v přepisu a titulky
      this.trans.querySelectorAll("li").forEach((li) => li.classList.toggle("now", +li.dataset.i === this.idx));
      this.showSubs(r);
      // scéna
      if (r.vstup === "ozvena") this.ozvena.classList.remove("hidden");
      if (r.scena) this.showScene(r.scena, r);
      if (r.karta) this.addCard(r);
      if (r.novyChat && this.chatBody) { this.chatBody.innerHTML = ""; this.stage.classList.remove("closing"); }
      if (r.stop) this.freezeChat();
      if (r.ocisluj) this.numberMessages();
      if (r.zavriChat) this.stage.classList.add("closing");
      // kdo mluví
      this.speaker = r.kdo;
      if (r.kdo === "L") { setPose(this.honza, "honza", r.pose || "talk"); this.honza.classList.remove("dim"); this.ozvena.classList.add("dim"); }
      else if (r.kdo === "O") { setPose(this.ozvena, "ozvena", r.pose || "wait"); this.ozvena.classList.remove("dim"); this.honza.classList.add("dim"); if (this.honza.dataset.pose === "talk") setPose(this.honza, "honza", "think"); }
      else { this.honza.classList.add("dim"); this.ozvena.classList.add("dim"); if (this.honza.dataset.pose === "talk") setPose(this.honza, "honza", "think"); if (this.v.chat || r.kdo === "CH" || r.kdo === "TIT") setPose(this.ozvena, "ozvena", "wait"); }
      this.setPlayIcon();

      if (r.kdo === "L" || r.kdo === "O") {
        await this.speak(r, token);
      } else if (r.kdo === "CH") {
        await this.botTypes(r, token);
      } else { // J, T, TIT – zpráva uživatele
        await this.userTypes(r, token);
      }
      if (token !== this.cancelToken) return;
      this.speaker = null; this.setPlayIcon();
      if (r.pauza && this.v.otazka) await this.pausePanel(token);
    }
    showSubs(r) {
      this.subs.innerHTML = "";
      const s = el("span"); s.append(el("b", {}, JMENA[r.kdo] + (r.kdo === "CH" ? " píše:" : ":")), r.text);
      this.subs.append(s);
    }
    async speak(r, token) {
      const a = await loadAudio(r.kod);
      if (token !== this.cancelToken) return;
      if (a) {
        this.audio = a; a.currentTime = 0;
        await new Promise((res) => { a.onended = res; a.onerror = res; a.play().catch(() => res()); const guard = setTimeout(res, (a.duration || odhadSekund(r.text)) * 1000 + 3000); this.timers.push(guard); });
        this.audio = null;
      } else {
        await this.wait(odhadSekund(r.text) * 1000, token);
      }
    }
    async wait(ms, token) {
      const end = Date.now() + ms;
      while (Date.now() < end && token === this.cancelToken) { await sleep(100); if (this.paused) { const p = Date.now(); await this.waitWhilePaused(token); return this.wait(end - p, token); } }
    }
    chatWindow(osoba) {
      if (this.chatBody) return this.chatBody;
      this.center.className = "center chatview";
      this.center.innerHTML = "";
      const win = el("div", { class: "chatwin" }, el("div", { class: "cw-head" }, el("span", {}, "Chatbot"), el("span", {}, osoba || "")), (this.chatBody = el("div", { class: "cw-body" })));
      this.center.append(win);
      return this.chatBody;
    }
    async typeInto(target, text, ms, token, zvyrazni) {
      const cur = el("span", { class: "cursor" }); const txt = el("span"); target.append(txt, cur);
      const step = Math.max(18, ms / Math.max(1, text.length));
      for (let i = 1; i <= text.length; i++) {
        if (token !== this.cancelToken) return;
        txt.textContent = text.slice(0, i);
        await sleep(step); if (this.paused) await this.waitWhilePaused(token);
      }
      cur.remove();
      if (zvyrazni) txt.innerHTML = esc(text).replace(esc(zvyrazni), "<mark>" + esc(zvyrazni) + "</mark>");
    }
    async userTypes(r, token) {
      const body = this.chatWindow(r.chatOsoba || (this.v.chat && this.v.chat.osoba));
      const m = el("div", { class: "msg user" }, el("span", { class: "who" }, r.chatOsoba || JMENA[r.kdo]));
      body.append(m); this.trimChat();
      const voice = r.kdo === "TIT" ? null : await loadAudio(r.kod);
      if (token !== this.cancelToken) return;
      let ms = odhadSekund(r.text) * 1000;
      if (voice) { ms = (voice.duration || ms / 1000) * 1000; this.audio = voice; voice.currentTime = 0; voice.play().catch(() => {}); }
      // ťukání zní pod každým psaním člověka; hlasitost je zapečená v souboru (iPad hlasitost v kódu ignoruje)
      this.startLoop("smycka-pomalu-10s", 1);
      await this.typeInto(m, r.text, ms * 0.9, token);
      this.stopLoop();
      if (voice && !voice.ended) await new Promise((res) => { voice.onended = res; this.timers.push(setTimeout(res, 4000)); });
      this.audio = null;
    }
    async botTypes(r, token) {
      const body = this.chatWindow(this.v.chat && this.v.chat.osoba);
      const dots = el("div", { class: "msg bot typing-dots", "aria-hidden": "true" }, "···");
      body.append(dots); this.trimChat();
      await this.wait(900, token); if (token !== this.cancelToken) return;
      dots.remove();
      const m = el("div", { class: "msg bot" }, el("span", { class: "who" }, "Chatbot"));
      if (r.cislo) m.dataset.cislo = r.cislo;
      body.append(m); this.trimChat();
      const tuk = await loadAudio(r.kod);               // ťukání do klávesnice: KÓD.mp3
      const hlas = await loadAudio(r.kod + "-hlas");    // hlas chatbota: KÓD-hlas.mp3 (nepovinný)
      if (token !== this.cancelToken) return;
      let ms = odhadSekund(r.text) * 900;
      if (hlas) {
        // hlas čte odpověď a psaní se řídí jeho délkou; pod ním ťuká klávesnice ve smyčce, dokud chatbot píše
        ms = (hlas.duration || ms / 1000) * 1000 * 0.9;
        this.audio = hlas; hlas.currentTime = 0; hlas.play().catch(() => {});
        this.startLoop(tuk ? r.kod : "smycka-10s", 1);
      } else if (tuk) {
        ms = (tuk.duration || ms / 1000) * 1000; this.audio = tuk; tuk.currentTime = 0; tuk.play().catch(() => {});
      } else this.startLoop("smycka-10s", 1);          // náhrada, když chybí obojí
      await this.typeInto(m, r.text, ms, token, r.zvyrazni);
      this.stopLoop();
      if (hlas && this.audio === hlas) { if (!hlas.ended) await new Promise((res) => { hlas.onended = res; this.timers.push(setTimeout(res, 4000)); }); }
      else if (this.audio === tuk && tuk) tuk.pause();
      this.audio = null;
      if (r.razitko) { m.append(el("span", { class: "razitko" }, r.razitko)); }
      await this.wait(1200, token);
    }
    trimChat() { const max = (this.v.chat && this.v.chat.okno) || 4; while (this.chatBody && this.chatBody.children.length > max) this.chatBody.firstChild.remove(); }
    startLoop(kod, vol) {
      loadAudio(kod).then((a) => { if (!a || this.loopStopped) return; this.loopAudio = a; a.loop = true; a.volume = vol; a.currentTime = 0; a.play().catch(() => {}); });
      this.loopStopped = false;
    }
    stopLoop() { this.loopStopped = true; if (this.loopAudio) { this.loopAudio.pause(); this.loopAudio.loop = false; this.loopAudio = null; } }
    freezeChat() { if (!this.chatBody) return; this.chatBody.querySelectorAll(".msg").forEach((m) => { if (m.querySelector("mark")) m.classList.add("framed"); }); }
    numberMessages() { if (!this.chatBody) return; this.chatBody.querySelectorAll(".msg[data-cislo]").forEach((m, i) => { setTimeout(() => m.append(el("span", { class: "num" }, m.dataset.cislo)), i * 2600); }); }
    addCard(r) {
      if (!this.center.classList.contains("cardsview")) { this.center.className = "center cardsview"; this.center.innerHTML = ""; this.center.append(el("div", { class: "vcards" })); this.chatBody = null; }
      const box = this.center.querySelector(".vcards");
      box.querySelectorAll(".vcard").forEach((c) => c.classList.remove("hl"));
      const n = box.children.length + 1;
      let card;
      if (r.karta.includes("|")) { const [t, s] = r.karta.split("|"); card = el("div", { class: "vcard kontakt hl" }, el("span", { class: "k" }, n), el("div", {}, el("b", {}, t), el("br"), el("span", {}, s))); }
      else card = el("div", { class: "vcard hl" }, el("span", { class: "k" }, n), r.karta);
      box.append(card);
      while (box.children.length > 5) box.firstChild.remove();
    }
    showScene(name, r) {
      this.chatBody = null; this.center.className = "center"; this.center.innerHTML = "";
      if (name === "titul") {
        this.center.append(el("div", { class: "vquest", style: "text-align:center" }, el("img", { class: "logo-img", src: "obrazky/elpida-logo.svg", alt: "Elpida", style: "display:inline-block;margin:0 auto 10px" }), el("div", { style: "font-size:1.5em" }, KURZ.nazev), el("div", { style: "font-family:var(--body);font-weight:500;font-size:.8em;margin-top:6px;color:#444" }, KURZ.zadatel)));
      } else if (name === "moduly") {
        const g = el("div", { class: "vmods" });
        MODULY.forEach((m, i) => g.append(el("div", { style: "animation-delay:" + (i * .5) + "s" }, el("b", {}, m.c), m.nazev)));
        this.center.append(g, el("div", { class: "vtime" }, el("i", { style: "animation-duration:" + odhadSekund(r.text) + "s" })), el("div", { style: "font-size:.8em;font-weight:700;margin-top:4px" }, "asi 45 minut · lze kdykoli přerušit"));
      } else if (name === "kontakty-lista") {
        this.center.append(el("div", { class: "vhelp" }, el("b", {}, "Potřebujete pomoc hned? "), KURZ.kontakty.map((k) => k.nazev + " " + k.cislo).join(" · ")));
      } else if (name === "web") {
        this.center.append(el("div", { class: "vweb" }, el("div", { class: "bar" }, "🔒 www.[organizace].cz/kontakt"), el("div", { class: "pg" }, el("b", {}, "Kontakt"), "Oficiální web organizace", el("br"), el("span", { class: "kontakt" }, "Linka pomoci: [OVĚŘENÉ ČÍSLO]"))));
      } else if (name === "odkazy") {
        const g = el("div", { class: "vlinks" });
        KURZ.odkazy.forEach((o, i) => g.append(el("div", { style: "animation-delay:" + (i * .6) + "s" }, o.text, el("small", {}, o.url.replace("https://", "")))));
        this.center.append(g);
      }
    }
    async pausePanel(token) {
      const q = this.v.otazka;
      this.paused = false;
      const box = el("div", { class: "pausebox" });
      box.append(el("span", { class: "kicker" }, "Zastavte a přemýšlejte"), el("h3", {}, q.text));
      const list = el("ul", { class: "opts" });
      let resolveDone; const done = new Promise((r) => (resolveDone = r));
      const fb = el("div");
      const cont = el("div", { class: "row", style: "margin-top:14px" });
      const btns = [];
      q.moznosti.forEach((o) => {
        const b = el("button", { class: "opt", onclick: async () => {
          btns.forEach((x) => (x.disabled = true));
          b.classList.add(o.spravne ? "ok" : "ko");
          fb.innerHTML = ""; fb.append(el("div", { class: "feedback" + (o.spravne ? "" : " ko") }, el("b", {}, o.spravne ? "Správně. " : "Zkuste to znovu. "), o.zv));
          setPose(this.ozvena, "ozvena", o.spravne ? "happy" : "ask");
          if (o.kod) { const a = await loadAudio(o.kod); if (a && token === this.cancelToken) { this.audio = a; this.ozvena.classList.add("speaking"); a.currentTime = 0; await new Promise((res) => { a.onended = res; a.play().catch(res); }); this.ozvena.classList.remove("speaking"); this.audio = null; } }
          cont.innerHTML = "";
          if (!o.spravne) cont.append(el("button", { class: "btn ghost", onclick: () => { btns.forEach((x) => { x.disabled = false; x.classList.remove("ko"); }); fb.innerHTML = ""; cont.innerHTML = ""; } }, "Zkusit znovu"));
          cont.append(el("button", { class: "btn", onclick: () => resolveDone() }, "Pokračovat ve videu ", arrowIcon()));
          cont.querySelector(".btn:last-child").focus();
        } }, el("span", { class: "l" }, o.p), el("span", {}, o.text));
        btns.push(b); list.append(el("li", {}, b));
      });
      box.append(list, fb, cont);
      const ov = el("div", { class: "overlay pausepanel", role: "dialog", "aria-label": "Zastavte a přemýšlejte" }, box);
      this.stage.append(ov);
      this.pauseActive = true;
      btns[0].focus();
      await done;
      ov.remove(); this.pauseActive = false;
      if (token !== this.cancelToken) return;
    }
    finish() {
      this.finished = true; this.speaker = null; this.setPlayIcon();
      this.subs.innerHTML = "";
      progress.videa[this.id] = true; saveProgress();
      const m = MODULY.find((x) => x.c === this.v.modul);
      const next = nextVideoAfter(this.id);
      const ov = el("div", { class: "overlay" }, el("div", { class: "box" },
        el("h3", {}, "Video skončilo"),
        el("p", {}, this.v.zasada ? "Zásada " + this.v.zasada + ": " + ZASADY[this.v.zasada - 1].nazev + ". " + ZASADY[this.v.zasada - 1].text : "Děkujeme, pokračujte dalším modulem."),
        el("div", { class: "row", style: "justify-content:center" },
          el("button", { class: "btn ghost", onclick: () => this.restart() }, "Přehrát znovu"),
          next ? el("a", { class: "btn", href: "#/video/" + next }, "Další video ", arrowIcon()) : el("a", { class: "btn", href: "#/modul/" + (m.c + 1) }, "Další modul ", arrowIcon()))));
      this.stage.append(ov);
      renderCrumbs();
    }
    destroy() { this.stopAll(); this.finished = true; }
  }
  function nextVideoAfter(id) { const ids = Object.keys(VIDEA); const i = ids.indexOf(id); const n = ids[i + 1]; return n && VIDEA[n].modul === VIDEA[id].modul ? n : null; }

  // ---------- ikony ----------
  const svgI = (d, s = 24, extra = "") => { const n = document.createElementNS("http://www.w3.org/2000/svg", "svg"); n.setAttribute("viewBox", "0 0 24 24"); n.setAttribute("width", s); n.setAttribute("height", s); n.setAttribute("aria-hidden", "true"); n.innerHTML = d; return n; };
  const playIcon = (s) => svgI('<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>', s);
  const pauseIcon = (s) => svgI('<rect x="6" y="4.5" width="4" height="15" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" fill="currentColor"/>', s);
  const restartIcon = () => svgI('<path d="M4 12a8 8 0 1 0 2.5-5.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>', 22);
  const nextIcon = () => svgI('<path d="M6 5v14l9-7z" fill="currentColor"/><rect x="16" y="5" width="2.5" height="14" fill="currentColor"/>', 22);
  const arrowIcon = () => svgI('<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', 22);
  const checkIcon = () => svgI('<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>', 22);

  // ---------- obrazovky ----------
  const main = $("#obsah");
  let crumbsData = [];
  function renderCrumbs() {
    const c = $("#crumbs"); c.innerHTML = "";
    crumbsData.forEach((x, i) => { if (i) c.append(" › "); if (x.href) c.append(el("a", { href: x.href }, x.text)); else c.append(el("b", {}, x.text)); });
  }
  function page(...kids) {
    if (activePlayer) { activePlayer.destroy(); activePlayer = null; }
    stopReading();
    main.innerHTML = ""; main.append(...kids);
    window.scrollTo({ top: 0, behavior: "auto" });
    main.focus({ preventScroll: true });
  }
  function helpBox() {
    return el("p", { class: "note cor", style: "margin-top:24px" }, el("b", {}, "Potřebujete poradit? "), "Zavolejte na Linku seniorů " + KURZ.kontakty[1].cislo + " (" + KURZ.kontakty[1].pozn + "). Při krizi volejte člověka, ne program: ", KURZ.kontakty.map((k) => k.nazev + " " + k.cislo).join(", "), ".");
  }

  function viewUvod() {
    crumbsData = [{ text: "Kurz" }, { text: "Úvod" }];
    const hotovo = Object.keys(progress.videa).length;
    const left = el("div", {},
      el("span", { class: "tag" }, "Informační online kurz · 4 moduly · asi 45 minut"),
      el("h1", { style: "margin-top:12px" }, KURZ.nazev),
      el("p", { class: "lead" }, KURZ.podtitul),
      el("p", {}, "Pojďme se společně podívat, jak se s umělou inteligencí povídá. Ukážeme si, kdy vám může pomoci a kdy je lepší zavolat člověku. Kurzem vás provedou dvě animované postavy: vypravěč Honza a Ozvěna, program, na kterém si ukážeme, co umělá inteligence umí a neumí."),
      el("h3", {}, "Dříve než začnete, přečtěte si prosím:"),
      el("ul", { class: "list-check" },
        el("li", {}, "Kurz zabere asi ", el("b", {}, "45 minut"), ". Můžete ho kdykoli přerušit a vrátit se, postup si tento prohlížeč pamatuje."),
        el("li", {}, "Ve dvou modulech uvidíte videa, v nichž AI záměrně zmate. Zkuste odhalit, kde."),
        el("li", {}, "Hlas Honzy i Ozvěny je vytvořen počítačem."),
        el("li", {}, "Na konci vás čeká test. Můžete ho opakovat, kolikrát chcete.")),
      el("div", { class: "row" },
        el("a", { class: "btn", href: hotovo ? "#/modul/" + (MODULY.find((m) => !modulHotov(m)) || MODULY[3]).c : "#/modul/1" }, hotovo ? "Pokračovat v kurzu " : "Spustit kurz ", arrowIcon()),
        el("a", { class: "btn ghost", href: "#/zasady" }, "Čtyři zásady")),
      helpBox());
    const scene = el("div", { class: "scene", "aria-hidden": "true" },
      el("div", { class: "bars" }, [40, 70, 55, 90, 65, 80, 50, 95, 60, 75, 45, 85, 60].map((h) => el("i", { style: "height:" + h + "%" }))),
      el("div", { class: "bubble l" }, "Rozumím vám."), el("div", { class: "bubble r" }, "To bude jen stres."),
      charNode("ozvena", "hello", "ch oz"), charNode("honza", "talk", "ch ho"));
    const mods = el("ol", { class: "mods" });
    MODULY.forEach((m) => {
      const done = modulHotov(m);
      mods.append(el("li", { class: done ? "done" : "" }, el("span", { class: "num", "aria-hidden": "true" }, done ? "✓" : m.c), el("div", {}, el("h3", {}, "Modul " + m.c + ": " + m.nazev), el("p", {}, (m.videa.length ? m.videa.length + (m.videa.length === 1 ? " video" : " videa") : "test") + " · " + m.cas + ". " + m.popis)), el("a", { class: "go", href: "#/modul/" + m.c }, done ? "Znovu" : "Otevřít")));
    });
    page(el("div", { class: "grid-2" }, left, el("div", {}, scene, el("h2", { style: "margin-top:26px" }, "Obsah kurzu"), mods)));
  }

  function viewModul(c) {
    const m = MODULY.find((x) => x.c === +c); if (!m) return viewUvod();
    crumbsData = [{ text: "Kurz", href: "#/" }, { text: "Modul " + m.c + " ze 4" }, { text: m.nazev }];
    const vids = el("ul", { class: "vid-list" });
    m.videa.forEach((id) => {
      const v = VIDEA[id]; const done = !!progress.videa[id];
      vids.append(el("li", { class: done ? "done" : "" }, el("span", { class: "play", "aria-hidden": "true" }, done ? checkIcon() : playIcon(22)), el("div", { class: "t" }, el("b", {}, "Video " + id + " · " + v.nazev), el("span", {}, v.delka + (v.zasada ? " · zásada " + v.zasada + ": " + ZASADY[v.zasada - 1].nazev : ""))), el("a", { class: "btnmini", href: "#/video/" + id }, done ? "Přehrát znovu" : "Přehrát")));
    });
    const parts = [el("span", { class: "tag" }, "Modul " + m.c + " ze 4 · " + m.cas), el("h1", { style: "margin-top:12px" }, m.nazev), el("p", { class: "lead" }, m.popis)];
    if (m.videa.length) parts.push(el("h2", {}, m.videa.length === 1 ? "Video" : "Videa"), vids);
    if (m.c === 1) {
      parts.push(el("h2", {}, "Dvě strany téhož rozhovoru"), el("p", {}, "Rozhovor s umělou inteligencí není ani zázrak, ani hrozba. U každého tématu proto ukazujeme obě strany: co člověku skutečně přináší a kde je třeba zpozornět."),
        el("h3", {}, "Přínosy"), el("div", { class: "cards" }, PRINOSY.map(([t, s]) => el("div", { class: "card teal" }, el("h3", {}, t), el("p", {}, s)))),
        el("h3", {}, "Úskalí"), el("div", { class: "cards" }, USKALI.map(([t, s]) => el("div", { class: "card pink" }, el("h3", {}, t), el("p", {}, s)))));
    }
    if (m.c === 2) parts.push(el("p", { class: "note" }, "Ve všech třech ukázkách jsou odpovědi chatbota záměrně chybné. Po každé ukázce se video zastaví a Ozvěna vám položí otázku."));
    if (m.c === 3) {
      parts.push(el("h2", {}, "Kam se obrátit"), el("div", { class: "cards" },
        el("div", { class: "card" }, el("h3", {}, "Blízký člověk"), el("p", {}, "Stačí jedna věta: „Poslední dobou je mi těžko a potřebuji si promluvit.“")),
        el("div", { class: "card" }, el("h3", {}, "Praktický lékař"), el("p", {}, "Vyslechne vás a podle potřeby pošle k odborníkovi.")),
        ...KURZ.kontakty.map((k) => el("div", { class: "card teal" }, el("h3", {}, k.nazev), el("p", {}, el("a", { href: "tel:" + k.tel, style: "font-family:var(--head);font-weight:800;font-size:1.3em;text-decoration:none" }, k.cislo), k.pozn ? " · " + k.pozn : ""))),
        el("div", { class: "card pink" }, el("h3", {}, "Ohrožení života"), el("p", {}, el("b", {}, "158 nebo 112")))),
        el("h3", {}, "Chcete vědět víc?"), el("ul", {}, KURZ.odkazy.map((o) => el("li", {}, el("a", { href: o.url, target: "_blank", rel: "noopener" }, o.text)))));
    }
    if (m.c === 4) {
      parts.push(el("div", { class: "guide-box" }, charNode("ozvena", "happy", "char"), el("p", {}, "Prošli jsme spolu šest videí. Než začnete test, projděte si ještě jednou čtyři zásady. V testu se k nim vrátíme.")),
        el("h2", {}, "Čtyři zásady"), zasadyCards(),
        el("h2", {}, "Závěrečný test"), el("p", {}, "Deset otázek ve třech podobách: výběr z možností, pravda či nepravda a hledání chyby v krátké ukázce. Po každé odpovědi krátce komentuje Ozvěna. Test lze kdykoli opakovat."),
        progress.test ? el("p", { class: "note" }, "Váš poslední výsledek: " + progress.test.body + " z " + TEST.length + (progress.test.uspel ? ". Test jste splnili." : ". Zkuste to znovu, nic se neděje.")) : null,
        el("a", { class: "btn cor", href: "#/test" }, "Spustit test ", arrowIcon()));
    }
    const nav = el("div", { class: "after" }, el("p", {}, m.c < 4 ? "Až dokončíte tento modul, pokračujte dalším." : "Po testu se můžete ke kterémukoli videu vrátit."), m.c > 1 ? el("a", { class: "btn ghost", href: "#/modul/" + (m.c - 1) }, "Předchozí modul") : null, m.c < 4 ? el("a", { class: "btn", href: "#/modul/" + (m.c + 1) }, "Další modul ", arrowIcon()) : el("a", { class: "btn", href: "#/" }, "Zpět na úvod"));
    page(el("div", {}, ...parts, nav, helpBox()));
  }

  function zasadyCards() {
    return el("div", { class: "cards" }, ZASADY.map((z) => el("div", { class: "card zasada" }, el("span", { class: "n", "aria-hidden": "true" }, z.c), el("div", {}, el("h3", {}, z.nazev), el("p", {}, z.text), el("p", { style: "margin-top:6px" }, el("a", { href: "#/video/" + z.video }, "Video " + z.video + " · " + VIDEA[z.video].nazev))))));
  }

  function viewVideo(id) {
    const v = VIDEA[id]; if (!v) return viewUvod();
    const m = MODULY.find((x) => x.c === v.modul);
    const idxIn = m.videa.indexOf(id) + 1;
    crumbsData = [{ text: "Kurz", href: "#/" }, { text: "Modul " + m.c + ": " + m.nazev, href: "#/modul/" + m.c }, { text: "Video " + idxIn + " z " + m.videa.length }];
    const wrap = el("div", {});
    wrap.append(el("span", { class: "tag" }, "Modul " + m.c + " · " + m.nazev + " · video " + idxIn + " z " + m.videa.length), el("h1", { style: "margin-top:12px" }, v.nazev));
    if (v.chat) wrap.append(el("p", { class: "lead" }, "Ukázka: rozhovor s chatbotem. Odpovědi jsou záměrně chybné. Zkuste odhalit, kde chatbot zavádí."));
    else if (v.tlumene) wrap.append(el("p", { class: "lead" }, "Toto video mluví o těžkých chvílích. Je klidné, bez hudby. Kdykoli ho můžete zastavit."));
    const holder = el("div", {});
    wrap.append(holder);
    const others = el("ul", { class: "vid-list", style: "margin-top:26px" });
    m.videa.forEach((o) => others.append(el("li", { class: (progress.videa[o] ? "done" : "") + (o === id ? " now" : ""), style: o === id ? "border-color:var(--ink);background:var(--teal-light)" : "" }, el("span", { class: "play", "aria-hidden": "true" }, progress.videa[o] ? checkIcon() : playIcon(22)), el("div", { class: "t" }, el("b", {}, "Video " + o + " · " + VIDEA[o].nazev), el("span", {}, VIDEA[o].delka)), o === id ? el("span", { class: "tag grey" }, "Právě sledujete") : el("a", { class: "btnmini", href: "#/video/" + o }, "Přehrát"))));
    wrap.append(el("h2", {}, "Videa v modulu " + m.c), others, el("div", { class: "after" }, el("p", {}, "Zpět na přehled modulu nebo na úvod kurzu."), el("a", { class: "btn ghost", href: "#/modul/" + m.c }, "Modul " + m.c), el("a", { class: "btn ghost", href: "#/" }, "Úvod")), helpBox());
    page(wrap);
    activePlayer = new Player(id, holder);
  }

  function viewZasady() {
    crumbsData = [{ text: "Kurz", href: "#/" }, { text: "Čtyři zásady" }];
    page(el("div", {}, el("span", { class: "tag" }, "Odborný rámec"), el("h1", { style: "margin-top:12px" }, "Čtyři zásady, o které se kurz opírá"),
      el("p", { class: "lead" }, "Obsah kurzu vychází z doporučení Americké psychologické asociace a ze zkušeností z práce se seniory. Každá zásada má v kurzu své video a vrací se v závěrečném testu."),
      zasadyCards(),
      el("h2", {}, "Co upozorňuje odborná obec"),
      el("ul", {}, el("li", {}, "Chatboty nebyly vytvořeny k péči o duševní zdraví a nemají ji nahrazovat. Jako doplněk mohou pomoci."), el("li", {}, "Často jsou nastavené tak, aby uživateli přitakávaly. Příjemné to je, ale může to upevňovat zkreslené představy."), el("li", {}, "Vztah s AI je jednostranný, i když se tak nejeví. V krizi je její reakce nespolehlivá."), el("li", {}, "Varovné signály: dávám chatbotu přednost před lidmi, tajím, že ho používám, trávím s ním příliš času.")),
      el("p", { style: "color:var(--muted);font-size:.9em" }, "Zdroj: American Psychological Association, Health Advisory on the Use of Generative AI Chatbots and Wellness Applications for Mental Health (listopad 2025). Doporučení vznikla pro americké prostředí a jsou zde použita jako obecný odborný rámec. Znění zásad schvaluje " + KURZ.garant + "."),
      helpBox()));
  }

  function viewNapoveda() {
    crumbsData = [{ text: "Kurz", href: "#/" }, { text: "Nápověda" }];
    page(el("div", {}, el("h1", {}, "Nápověda"),
      el("dl", { class: "faq" },
        el("dt", {}, "Jak zvětším písmo?"), el("dd", {}, "Nahoře vpravo jsou tři tlačítka A. Klepněte na největší. Nastavení si prohlížeč zapamatuje."),
        el("dt", {}, "Jak si nechám stránku přečíst?"), el("dd", {}, "Klepněte na „Přečíst nahlas“. Počítač přečte text na stránce. Dalším klepnutím čtení zastavíte. Videa mají vlastní hlas a titulky."),
        el("dt", {}, "Video se mi nepřehrává."), el("dd", {}, "Klepněte na velké tlačítko uprostřed videa. Zkontrolujte, že máte zapnutý zvuk. Pod každým videem je úplný přepis, můžete si ho přečíst i bez zvuku."),
        el("dt", {}, "Ruší mě pohyb postav."), el("dd", {}, "Zaškrtněte „Vypnout pohyb“ pod hlavní nabídkou. Postavy se přestanou hýbat, kurz funguje dál."),
        el("dt", {}, "Musím kurz dokončit najednou?"), el("dd", {}, "Ne. Dokončená videa si tento prohlížeč pamatuje. Vraťte se kdykoli, i druhý den."),
        el("dt", {}, "Co se stane, když v testu udělám chybu?"), el("dd", {}, "Nic. Ozvěna vám krátce vysvětlí, proč odpověď neplatí, a můžete pokračovat. Test lze opakovat, kolikrát chcete."),
        el("dt", {}, "Kdo mluví ve videích?"), el("dd", {}, "Honza i Ozvěna jsou animované postavy a jejich hlas je vytvořen počítačem. Paní Janu a pana Tomáše v ukázkách namluvili lidé. Chatbot nemluví, jen píše.")),
      el("p", { class: "note" }, "Kurz informuje. Neléčí a neposkytuje poradenství. Pokud je vám dlouho těžko, obraťte se na blízkého člověka, praktického lékaře nebo krizovou linku."),
      helpBox()));
  }

  // ---------- test ----------
  function viewTest() {
    crumbsData = [{ text: "Kurz", href: "#/" }, { text: "Modul 4: Závěr a test", href: "#/modul/4" }, { text: "Test" }];
    const vysledky = []; let i = 0;
    const wrap = el("div", {});
    page(wrap);
    function render() {
      wrap.innerHTML = "";
      if (i >= TEST.length) return renderResult();
      const q = TEST[i];
      const progEl = el("div", { class: "test-prog", "aria-hidden": "true" }, TEST.map((_, k) => el("i", { class: k < i ? (vysledky[k] ? "ok" : "ko") : k === i ? "now" : "" })));
      const guideText = el("p", {}, i === 0 ? "Deset otázek, žádný spěch. Nejde o známku, ale o to, co si odnesete." : "Otázka " + (i + 1) + ". Přečtěte si ji v klidu.");
      const guide = el("div", { class: "guide-box" }, charNode("ozvena", "ask", "char"), guideText);
      wrap.append(el("div", { class: "test-head" }, el("span", { class: "tag" }, "Modul 4 ze 4 · Test"), el("b", {}, "Otázka " + (i + 1) + " z " + TEST.length), progEl), guide);
      const card = el("div", { class: "q-card" });
      card.append(el("span", { class: "tag grey" }, q.typ === "pravda" ? "Pravda, nebo nepravda?" : q.typ === "chyba" ? "Najděte chybu" : "Vyberte odpověď"), el("h2", { style: "margin-top:10px" }, q.text));
      let opts;
      if (q.typ === "pravda") opts = [{ text: "Pravda", ok: q.spravne === true }, { text: "Nepravda", ok: q.spravne === false }];
      else if (q.typ === "chyba") { card.append(el("div", { class: "ukazka" }, q.ukazka.map((s, k) => el("span", {}, (k + 1) + ". " + s)))); opts = q.ukazka.map((s, k) => ({ text: "Věta " + (k + 1), ok: k === q.spravne })); }
      else opts = q.moznosti.map((s, k) => ({ text: s, ok: k === q.spravne }));
      const list = el("ul", { class: "opts" }); const btns = []; const fb = el("div"); const cont = el("div", { class: "row", style: "margin-top:14px" });
      opts.forEach((o, k) => {
        const b = el("button", { class: "opt", onclick: () => {
          btns.forEach((x) => (x.disabled = true)); b.classList.add(o.ok ? "ok" : "ko");
          if (!o.ok) btns.find((x, j) => opts[j].ok).classList.add("ok");
          vysledky[i] = o.ok;
          fb.append(el("div", { class: "feedback" + (o.ok ? "" : " ko") }, o.ok ? q.ok : [el("b", {}, "Tentokrát ne. "), q.chyba]));
          const g = guide.querySelector(".char"); g.innerHTML = CHAR.ozvena[o.ok ? "happy" : "wait"];
          guideText.textContent = o.ok ? "Správně." : "Nevadí. Důležité je, co si zapamatujete.";
          cont.append(el("button", { class: "btn", onclick: () => { i++; render(); } }, i + 1 < TEST.length ? "Další otázka " : "Zobrazit výsledek ", arrowIcon()));
          cont.lastChild.focus();
        } }, el("span", { class: "l" }, String.fromCharCode(65 + k)), el("span", {}, o.text));
        btns.push(b); list.append(el("li", {}, b));
      });
      card.append(list, fb, cont);
      wrap.append(card, helpBox());
      window.scrollTo({ top: 0 }); card.querySelector(".opt").focus({ preventScroll: true });
    }
    function renderResult() {
      const body = vysledky.filter(Boolean).length; const uspel = body >= KURZ.hraniceTestu;
      progress.test = { body, uspel, datum: new Date().toISOString().slice(0, 10) }; saveProgress();
      SCORM.vysledek(Math.round((body / TEST.length) * 100), uspel);
      const spatne = TEST.map((q, k) => (!vysledky[k] ? q.zasada : null)).filter((x) => x);
      const zasadyKOpak = [...new Set(spatne)];
      wrap.append(el("div", { class: "guide-box" }, charNode("ozvena", uspel ? "happy" : "hello", "char"), el("p", {}, uspel ? "Výborně. Máte to za sebou a čtyři zásady vám zůstanou." : "Děkuji, že jste to zkusili. Můžete se podívat na videa k zásadám, které vás potrápily, a test zopakovat.")),
        el("div", { class: "result" }, el("span", { class: "tag" }, "Výsledek testu"), el("div", { class: "big" }, body, el("small", {}, " z " + TEST.length)), el("p", {}, uspel ? "Test jste splnili. Hranice je " + KURZ.hraniceTestu + " správných odpovědí." : "Pro splnění je potřeba " + KURZ.hraniceTestu + " správných odpovědí. Test lze opakovat, kolikrát chcete."),
          zasadyKOpak.length ? el("p", {}, "Doporučujeme si znovu projít: ", zasadyKOpak.map((z, k) => [k ? ", " : "", el("a", { href: "#/video/" + ZASADY[z - 1].video }, "zásada " + z + " " + ZASADY[z - 1].nazev)]).flat()) : null,
          el("div", { class: "row", style: "justify-content:center;margin-top:14px" }, el("button", { class: "btn ghost", onclick: () => { i = 0; vysledky.length = 0; render(); } }, "Opakovat test"), el("a", { class: "btn", href: "#/" }, "Zpět na úvod")),
          uspel ? el("div", { class: "cert" }, el("span", { class: "tag" }, "Potvrzení o absolvování"), el("h3", { style: "margin-top:10px" }, KURZ.nazev), el("p", {}, "Informační online kurz o umělé inteligenci jako posluchači, rádci a společníkovi."), el("p", {}, "Dokončeno " + new Date().toLocaleDateString("cs-CZ") + " · výsledek testu " + body + " z " + TEST.length), el("p", { style: "color:var(--muted);font-size:.9em;margin:0" }, KURZ.zadatel + " · odborný garant " + KURZ.garant + " · [PODOBA POTVRZENÍ SE URČÍ S GARANTEM]"), el("button", { class: "btn ghost", style: "margin-top:12px", onclick: () => window.print() }, "Vytisknout")) : null),
        helpBox());
    }
    render();
  }

  // LMS je potřeba na konci odhlásit, jinak se nemusí uložit čas ani stav
  window.addEventListener("pagehide", () => SCORM.konec());
  window.addEventListener("beforeunload", () => SCORM.konec());

  // ---------- směrování ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [a, b] = h.split("/");
    document.querySelectorAll(".top-nav a").forEach((x) => x.classList.toggle("active", x.getAttribute("href") === "#/" + (a || "")));
    if (a === "modul") viewModul(b);
    else if (a === "video") viewVideo(b);
    else if (a === "test") viewTest();
    else if (a === "zasady") viewZasady();
    else if (a === "napoveda") viewNapoveda();
    else viewUvod();
    renderCrumbs();
  }
  window.addEventListener("hashchange", route);
  if ("speechSynthesis" in window) speechSynthesis.getVoices();
  route();
})();
