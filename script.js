// 1. Efeito de scroll na Navbar (adiciona borda ao rolar)
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// 2. Barra de Progresso de Leitura
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = progress + '%';
});

// 3. Botão "Voltar ao Topo"
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > 500);
});
backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 4. Scroll-Spy do Sumário (Destaca o capítulo atual)
const tocLinks = document.querySelectorAll('.toc-link');
const sections = [];

tocLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.startsWith('#')) {
    const el = document.querySelector(href);
    if (el) sections.push({ el, link });
  }
});

function updateToc() {
  const scrollPos = window.scrollY + 140; // Compensa a altura da navbar
  let current = sections[0];
  for (const s of sections) {
    if (s.el.offsetTop <= scrollPos) current = s;
  }
  tocLinks.forEach(l => l.classList.remove('active'));
  if (current) current.link.classList.add('active');
}

window.addEventListener('scroll', updateToc);
updateToc(); // Executa no carregamento inicial

// 5. Animação de Revelação ao rolar (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Para de observar após animar (performance)
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));