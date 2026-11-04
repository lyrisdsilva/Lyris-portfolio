/* Toolkit page: tools orbiting around the centre, like keycaps in space.
   To change a tool, edit the RINGS list below. Each ring is one orbit:
   [short label on the keycap, full name]. */
(() => {
  const RINGS = [
    { style: 'charcoal', speed: 1 / 38, tools: [['Py', 'Python'], ['SQL', 'SQL'], ['Jv', 'Java'], ['JS', 'JavaScript'], ['C++', 'C++']] },
    { style: 'coral', speed: -1 / 56, tools: [['pd', 'pandas'], ['sk', 'scikit-learn'], ['Tb', 'Tableau'], ['BI', 'Power BI'], ['Pg', 'PostgreSQL'], ['My', 'MySQL'], ['Mg', 'MongoDB'], ['Sf', 'Snowflake']] },
    { style: 'cream', speed: 1 / 78, tools: [['Re', 'React'], ['Nd', 'Node.js'], ['Dj', 'Django'], ['Sb', 'Spring Boot'], ['Tw', 'Tailwind CSS'], ['API', 'REST APIs'], ['Git', 'Git & GitHub'], ['Pm', 'Postman'], ['GC', 'Google Cloud']] }
  ];
  // Orbit shapes as fractions of the stage: [width radius, height radius, tilt in degrees]
  const SHAPES = [[0.2, 0.17, -10], [0.32, 0.29, 7], [0.45, 0.41, -4]];

  const stage = document.getElementById('orbit');
  if (!stage) return;
  const svg = stage.querySelector('.orbit-rings');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [];
  let total = 0;

  RINGS.forEach((ring, r) => {
    ring.tools.forEach(([short, name], i) => {
      const el = document.createElement('div');
      el.className = `orbit-item ${ring.style}`;
      el.innerHTML = `<span class="oi-cap">${short}</span><span class="oi-label">${name}</span>`;
      stage.appendChild(el);
      items.push({ el, r, phase: (i / ring.tools.length) * Math.PI * 2 + r * 0.6 });
      total++;
    });
  });
  const count = document.getElementById('orbit-count');
  if (count) count.textContent = total;

  let W = 0, H = 0;
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `<defs><linearGradient id="og" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f7c600" stop-opacity=".55"/><stop offset="1" stop-color="#ee5b37" stop-opacity=".45"/></linearGradient></defs>` +
      SHAPES.map(([a, b, t]) => `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${a * W}" ry="${b * H}" transform="rotate(${t} ${W / 2} ${H / 2})" fill="none" stroke="url(#og)" stroke-width="1.2" stroke-dasharray="2 6"/>`).join('');
  }

  let t = 0, last = performance.now(), pace = 1, target = 1;
  function place() {
    for (const it of items) {
      const [a, b, tilt] = SHAPES[it.r];
      const th = it.phase + t * RINGS[it.r].speed * Math.PI * 2;
      const x = Math.cos(th) * a * W, y = Math.sin(th) * b * H;
      const k = tilt * Math.PI / 180;
      const X = x * Math.cos(k) - y * Math.sin(k), Y = x * Math.sin(k) + y * Math.cos(k);
      const depth = (Math.sin(th) + 1) / 2; // 0 = back, 1 = front
      it.el.style.transform = `translate(${X}px, ${Y}px) translate(-50%, -50%) scale(${0.78 + depth * 0.26})`;
      it.el.style.opacity = (0.5 + depth * 0.5).toFixed(3);
      it.el.style.zIndex = String(10 + Math.round(depth * 40));
    }
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    pace += (target - pace) * Math.min(1, dt * 4);
    t += dt * pace;
    place();
    requestAnimationFrame(frame);
  }

  layout(); place();
  if ('ResizeObserver' in window) new ResizeObserver(() => { layout(); place(); }).observe(stage);
  else addEventListener('resize', () => { layout(); place(); });

  if (!RM) {
    stage.addEventListener('pointerenter', () => { target = 0.15; });
    stage.addEventListener('pointerleave', () => { target = 1; });
    requestAnimationFrame(now => { last = now; frame(now); });
  }
})();
