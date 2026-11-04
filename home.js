/* Home page only: typing screen, keycaps and the typing wave. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const device = $('#device'), tagEl = $('#tag'), headEl = $('#head'), detailEl = $('#detail');
  const caps = [...document.querySelectorAll('.cap')];

  /* ---- Name & email from site.js ---- */
  $('#hero-name').textContent = SITE.name + '.';
  $('#scr-brand').textContent = `${SITE.name.toUpperCase()} / PORTFOLIO.EXE`;
  $('#head').textContent = `Hi, I'm ${SITE.name}.`;

  /* ---- Screen typing engine ---- */
  const STORY = [
    ['HELLO',   `Hi, I'm ${SITE.name}.`,     'A vibe coder with a curious mind.'],
    ['ABOUT',   'Data + code.',        'I turn messy data into clear answers.'],
    ['IMPACT',  '40% faster APIs.',    'Tuned backend logic at Prodigy InfoTech.'],
    ['PROJECT', 'Churn analysis.',     '7,043 customers, an 0.85 AUC model.'],
    ['PROJECT', 'MEDEASE.',            'Healthcare portal, +45% bookings.'],
    ['WORK', '3 internships.',      'Backend, full-stack & web dev.'],
    ['CONTACT', 'Got an idea?',        SITE.email]
  ];
  let run = 0, storyIdx = 0, pretyped = true, mode = 'story';
  const wait = (ms, id) => new Promise(r => setTimeout(() => r(id === run), ms));
  const setHead = t => { headEl.textContent = t; headEl.parentElement.classList.toggle('long', t.length > 16); };
  const setTag = t => { tagEl.textContent = t; };

  async function typeInto(setter, text, id, min, max) {
    if (RM) { setter(text); return true; }
    for (let i = 1; i <= text.length; i++) {
      setter(text.slice(0, i));
      let d = min + Math.random() * (max - min);
      if (text[i - 1] === ' ') d += 140;
      if (!(await wait(d, id))) return false;
    }
    return true;
  }
  async function erase(id) {
    if (RM) { setHead(''); return true; }
    while (headEl.textContent.length) {
      setHead(headEl.textContent.slice(0, -1));
      if (!(await wait(42, id))) return false;
    }
    return true;
  }
  const setDetail = t => { detailEl.textContent = t; };

  async function story() {
    const id = ++run; mode = 'story';
    while (true) {
      const [tag, head, detail] = STORY[storyIdx % STORY.length];
      setTag(tag);
      if (pretyped) { pretyped = false; }
      else {
        setDetail(''); setHead('');
        if (!(await wait(260, id))) return;
        if (!(await typeInto(setHead, head, id, 110, 200))) return;
        if (!(await wait(240, id))) return;
        if (!(await typeInto(setDetail, detail, id, 22, 48))) return;
      }
      if (!(await wait(RM ? 4200 : 2800, id))) return;
      setDetail('');
      if (!(await erase(id))) return;
      storyIdx++;
    }
  }

  async function explore(cap) {
    const id = ++run; mode = 'explore';
    clearTimeout(resumeT);
    setTag('EXPLORE'); setHead(''); setDetail('');
    if (!(await typeInto(setHead, cap.dataset.name + '.', id, 55, 95))) return;
    await typeInto(setDetail, cap.dataset.desc, id, 16, 32);
  }

  let resumeT = 0;
  function scheduleResume(ms = 700) {
    clearTimeout(resumeT);
    resumeT = setTimeout(() => {
      if (typingActive() || false) return;
      const a = document.activeElement;
      if (a && a.classList && a.classList.contains('cap')) return;
      if (device.querySelector('.cap:hover')) return;
      storyIdx++; story();
    }, ms);
  }

  /* ---- Keycap hover / focus ---- */
  let overKeys = false;
  device.addEventListener('pointerenter', () => { overKeys = true; });
  device.addEventListener('pointerleave', () => { overKeys = false; });
  caps.forEach(cap => {
    cap.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch' && !typingActive()) explore(cap); });
    cap.addEventListener('pointerleave', () => { if (mode === 'explore') scheduleResume(); });
    cap.addEventListener('focus', () => { if (!typingActive()) explore(cap); });
    cap.addEventListener('blur', () => { if (mode === 'explore') scheduleResume(); });
    cap.addEventListener('click', () => { if (!typingActive()) explore(cap); });
  });

  /* ---- Real keyboard typing ---- */
  let buffer = '', idleT = 0, lastType = 0;
  const typingActive = () => Date.now() - lastType < 3500 && buffer.length > 0;
  function press(cap) {
    cap.classList.add('down');
    clearTimeout(cap._t);
    cap._t = setTimeout(() => cap.classList.remove('down'), 150);
  }
  function showBuffer() {
    run++; mode = 'user';
    setTag('YOU'); setDetail(`You're typing on ${SITE.name}'s keyboard.`); setHead(buffer);
    lastType = Date.now();
    clearTimeout(idleT); clearTimeout(resumeT);
    idleT = setTimeout(() => { buffer = ''; setHead(''); storyIdx++; story(); }, 3500);
  }
  document.addEventListener('keydown', e => {
    if (false || e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const onControl = t && t.closest && t.closest('a,button');
    const k = e.key;
    if (k === 'Backspace') {
      if (!buffer) return;
      e.preventDefault(); buffer = buffer.slice(0, -1); showBuffer(); return;
    }
    if (k === 'Enter') {
      if (onControl) return;
      e.preventDefault(); buffer = '';
      const wide = device.querySelector('[data-wide]'); if (wide) press(wide);
      run++; mode = 'user'; setTag('YOU'); setDetail(`You're typing on ${SITE.name}'s keyboard.`); setHead('');
      lastType = Date.now(); clearTimeout(idleT);
      idleT = setTimeout(() => { storyIdx++; story(); }, 3500);
      return;
    }
    if (k.length !== 1) return;
    if (k === ' ' && onControl) return;
    e.preventDefault();
    buffer = (buffer + k).slice(-28);
    const low = k.toLowerCase();
    caps.forEach(c => { if (c.dataset.letter === low) press(c); });
    showBuffer();
  });

  /* ---- Typing wave every 10s ---- */
  function wave() {
    if (RM || document.hidden || overKeys || typingActive() || false) return;
    const a = document.activeElement;
    if (a && a.classList && a.classList.contains('cap')) return;
    caps.forEach((c, i) => setTimeout(() => {
      c.classList.remove('hop'); void c.offsetWidth; c.classList.add('hop');
    }, i * 460));
  }
  caps.forEach(c => c.addEventListener('animationend', () => c.classList.remove('hop')));
  if (!RM) { setTimeout(wave, 2200); setInterval(wave, 10000); }

  story();
})();
