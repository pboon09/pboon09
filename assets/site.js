document.documentElement.classList.add('js');
// if anything below fails or the observer never fires, show all content anyway
const showAll = () => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
setTimeout(() => { if (!document.querySelector('.reveal.in')) showAll(); }, 2500);
if (!('IntersectionObserver' in window)) showAll();

const reveal = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

const links = [...document.querySelectorAll('header.top nav a')];
const spy = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting)
    links.forEach((a) => a.classList.toggle('active', a.hash === '#' + e.target.id));
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

const bar = document.querySelector('.progress');
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const header = document.querySelector('header.top');
const btn = document.querySelector('.menu-btn');
btn.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});
links.forEach((a) => a.addEventListener('click', () => {
  header.classList.remove('open');
  btn.setAttribute('aria-expanded', false);
}));

const zoomable = document.querySelectorAll('img.zoom');
if (zoomable.length) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.innerHTML = '<img alt=""><p class="lb-hint">Click the image to zoom. Click outside or press Esc to close.</p>';
  document.body.append(box);
  const big = box.querySelector('img');
  const close = () => { box.classList.remove('on', 'zoomed'); document.body.style.overflow = ''; };
  zoomable.forEach((img) => img.addEventListener('click', () => {
    big.src = img.src;
    big.alt = img.alt;
    box.classList.remove('zoomed');
    box.classList.add('on');
    document.body.style.overflow = 'hidden';
  }));
  let drag = null;
  big.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drag && drag.moved) return;
    const r = big.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    box.classList.toggle('zoomed');
    if (box.classList.contains('zoomed')) {
      // keep the clicked point under the cursor after zooming in
      box.scrollLeft = fx * big.offsetWidth - e.clientX;
      box.scrollTop = fy * big.offsetHeight - e.clientY;
    }
  });
  big.addEventListener('mousedown', (e) => {
    if (!box.classList.contains('zoomed')) return;
    drag = { x: e.clientX, y: e.clientY, sl: box.scrollLeft, st: box.scrollTop, moved: false };
    e.preventDefault();
  });
  addEventListener('mousemove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    box.scrollLeft = drag.sl - dx;
    box.scrollTop = drag.st - dy;
  });
  addEventListener('mouseup', () => setTimeout(() => { drag = null; }, 0));
  box.addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

const tocLinks = [...document.querySelectorAll('.toc a')];
if (tocLinks.length) {
  const targets = tocLinks.map((a) => document.querySelector(a.hash));
  const fill = document.querySelector('.toc-bar span');
  // pick the last section whose top has passed 35% of the viewport; one source of truth, no observer races
  const update = () => {
    const line = innerHeight * 0.35;
    let current = 0;
    targets.forEach((s, k) => { if (s && s.getBoundingClientRect().top <= line) current = k; });
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0 && scrollY >= max - 2) current = targets.length - 1;
    tocLinks.forEach((a, k) => {
      a.classList.toggle('active', k === current);
      a.classList.toggle('done', k < current);
    });
    fill.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
