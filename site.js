/* =====================================================================
   EDIT HERE: your name, email and the scrolling strip.
   Every page loads this file, so a change here updates the whole site.
   Page text lives in each page's own .html file.
   ===================================================================== */
const SITE = {
  name:  "Lyris",
  email: "dsilvalyris@gmail.com",
  // Let's Talk form: paste your Formspree link here, e.g. 'https://formspree.io/f/abcdwxyz'.
  // Left empty, the form opens the visitor's email app with the message filled in.
  formEndpoint: '',
  strip: ['Available for work', 'Design + code', 'Based in New York']
};
/* ======================= end of editable settings ======================= */

(() => {
  const $$ = s => [...document.querySelectorAll(s)];

  // Page title, email links and email text
  const page = document.body.dataset.page;
  document.title = page === 'Portfolio' ? `${SITE.name} | Portfolio` : `${page} | ${SITE.name}`;
  $$('[data-mailto]').forEach(a => { a.href = `mailto:${SITE.email}`; });
  $$('[data-email]').forEach(el => { el.textContent = SITE.email; });

  // Scrolling strip
  const track = document.getElementById('track');
  if (track) {
    let html = '';
    for (let i = 0; i < 16; i++) html += `<span>${SITE.strip[i % SITE.strip.length]}</span>`;
    track.innerHTML = html;
    track.parentElement.setAttribute('aria-label', SITE.strip.join(', '));
  }

  // Copy email buttons
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
    const done = () => { btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy'; }, 1600); };
    const select = () => {
      const el = btn.previousElementSibling, r = document.createRange();
      r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    };
    try { navigator.clipboard.writeText(SITE.email).then(done, select); } catch (e) { select(); }
  }));

  // Work page filters
  const chips = $$('[data-filter]');
  if (chips.length) {
    const apply = f => {
      chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
      $$('.proj').forEach(card => {
        card.hidden = !(f === 'All' || (f === 'Featured' ? card.dataset.featured === 'yes' : card.dataset.type === f));
      });
    };
    chips.forEach(c => c.addEventListener('click', () => apply(c.dataset.filter)));
    // Open a filter from the link, e.g. projects.html#featured or projects.html#data
    const want = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    const match = chips.find(c => c.dataset.filter.toLowerCase().replace(/\s+/g, '-') === want);
    if (match) apply(match.dataset.filter);
  }

  // Let's Talk form
  const form = document.getElementById('talk-form');
  if (form) {
    const status = document.getElementById('tf-status');
    const say = (msg, kind) => { status.textContent = msg; status.dataset.kind = kind || ''; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); say('Please fill in your name, a valid email and a message.', 'error'); return; }
      const data = Object.fromEntries(new FormData(form));
      if (data._gotcha) return;
      delete data._gotcha;
      const btn = form.querySelector('.tf-send');
      if (SITE.formEndpoint) {
        btn.disabled = true; say('Sending...');
        try {
          const r = await fetch(SITE.formEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error(r.status);
          form.reset(); say("Message sent. Thanks! I'll get back to you soon.", 'ok');
        } catch (err) {
          say(`That didn't send. Please email me at ${SITE.email} instead.`, 'error');
        } finally { btn.disabled = false; }
      } else {
        const subject = `${data.topic}: message from ${data.name}`;
        const body = `${data.message}\n\n${data.name}\n${data.email}`;
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        say(`Your email app should open with this message ready to send. If it doesn't, email me at ${SITE.email}.`, 'ok');
      }
    });
  }
})();
