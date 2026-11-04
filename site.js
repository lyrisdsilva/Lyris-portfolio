/* =====================================================================
   EDIT HERE: your name, email and the scrolling strip.
   Every page loads this file, so a change here updates the whole site.
   Page text lives in each page's own .html file.
   ===================================================================== */
const SITE = {
  name:  "Lyris",
  email: "dsilvalyris@gmail.com",
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

  // Work page filters (open work.html#featured to start on Featured)
  const chips = $$('[data-filter]');
  if (chips.length) {
    const apply = f => {
      chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
      $$('.proj').forEach(card => {
        card.hidden = !(f === 'All' || (f === 'Featured' ? card.dataset.featured === 'yes' : card.dataset.type === f));
      });
    };
    chips.forEach(c => c.addEventListener('click', () => apply(c.dataset.filter)));
    if (location.hash === '#featured') apply('Featured');
  }
})();
