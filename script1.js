document.addEventListener('DOMContentLoaded', function() {
    const campoBusca = document.getElementById('campoBusca');
    const btnBusca = document.getElementById('btnBusca');
    const btnVoltarInicio = document.getElementById('btnVoltarInicio');
    const sumarioLinks = document.querySelectorAll('.sumario-link');
    const secoes = document.querySelectorAll('.secao-manual');
    const resultadoBusca = document.getElementById('resultadoBusca');

    // ============================================
    // FUNÇÃO CENTRAL DE SCROLL COM OFFSET (Compensa Header Fixo)
    // ============================================
    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        // Ajuste este valor (80) conforme a altura real do seu header em pixels
        const headerOffset = 80; 
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Efeito visual de "Seleção" na seção encontrada
        targetSection.classList.add('highlight');
        setTimeout(() => {
            targetSection.classList.remove('highlight');
        }, 2000); // Dura 2 segundos

        // Atualiza o sumário lateral para refletir a seção ativa
        sumarioLinks.forEach(link => {
            link.classList.remove('ativo');
            if (link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('ativo');
            }
        });
    }

    // ============================================
    // NAVEGAÇÃO POR ÂNCORA DO SUMÁRIO
    // ============================================
    sumarioLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            history.pushState(null, null, `#${targetId}`);
        });
    });

    // ============================================
    // SCROLL SPY (Detectar seção visível)
    // ============================================
    const observerOptions = { root: null, rootMargin: '-100px 0px -60% 0px', threshold: 0 };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                sumarioLinks.forEach(link => {
                    link.classList.remove('ativo');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('ativo');
                    }
                });
            }
        });
    }, observerOptions);

    secoes.forEach(secao => sectionObserver.observe(secao));

    // ============================================
    // FUNCIONALIDADE DE BUSCA OTIMIZADA
    // ============================================
    function realizarBusca() {
        const termo = campoBusca.value.toLowerCase().trim();
        
        // Limpa destaques anteriores
        secoes.forEach(s => s.classList.remove('highlight'));
        
        if (termo.length < 2) {
            resultadoBusca.classList.remove('ativo');
            resultadoBusca.innerHTML = '';
            return;
        }

        const resultados = [];
        
        secoes.forEach(secao => {
            const titulo = secao.querySelector('.titulo');
            const conteudo = secao.querySelector('.conteudo-secao');
            
            if (!titulo || !conteudo) return;
            
            const tituloTexto = titulo.textContent.toLowerCase();
            const conteudoTexto = conteudo.textContent.toLowerCase();
            
            if (tituloTexto.includes(termo) || conteudoTexto.includes(termo)) {
                const id = secao.getAttribute('id');
                const tipo = tituloTexto.includes(termo) ? 'Título' : 'Conteúdo';
                // Score maior para matches no título, garantindo que ele apareça primeiro
                const score = tituloTexto.includes(termo) ? 2 : 1; 
                
                resultados.push({ id, titulo: titulo.textContent, tipo, score });
            }
        });

        // Ordena resultados: títulos primeiro
        resultados.sort((a, b) => b.score - a.score);

        if (resultados.length > 0) {
            let html = `<div class="resultado-titulo">📋 ${resultados.length} resultado(s) encontrado(s):</div>`;
            
            resultados.forEach(r => {
                html += `
                    <div class="resultado-item" data-id="${r.id}">
                        <strong>${r.titulo}</strong><br>
                        <small>${r.tipo}</small>
                    </div>
                `;
            });
            
            resultadoBusca.innerHTML = html;
            resultadoBusca.classList.add('ativo');
            
            // AUTO-DIRECIONA para o primeiro (melhor) resultado automaticamente
            scrollToSection(resultados[0].id);
            
            // Permite clicar manualmente em outros resultados da lista, se houver mais de um
            resultadoBusca.querySelectorAll('.resultado-item').forEach(item => {
                item.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-id');
                    scrollToSection(targetId);
                });
            });
        } else {
            resultadoBusca.innerHTML = '<div class="resultado-titulo">Nenhum resultado encontrado</div>';
            resultadoBusca.classList.add('ativo');
        }
    }

    // Event listeners para busca
    campoBusca.addEventListener('input', realizarBusca);
    btnBusca.addEventListener('click', realizarBusca);
    campoBusca.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita recarregar a página
            realizarBusca();
        }
    });

    // ============================================
    // BOTÃO VOLTAR AO INÍCIO
    // ============================================
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            btnVoltarInicio.style.opacity = '1';
            btnVoltarInicio.style.visibility = 'visible';
        } else {
            btnVoltarInicio.style.opacity = '0';
            btnVoltarInicio.style.visibility = 'hidden';
        }
    });

    btnVoltarInicio.style.opacity = '0';
    btnVoltarInicio.style.visibility = 'hidden';
    btnVoltarInicio.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

    btnVoltarInicio.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        sumarioLinks.forEach(link => link.classList.remove('ativo'));
        if (sumarioLinks.length > 0) sumarioLinks[0].classList.add('ativo');
    });

    // ============================================
    // CARREGAR SEÇÃO DA URL (se houver hash)
    // ============================================
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        setTimeout(() => scrollToSection(hash), 300);
    }
});