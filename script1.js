document.addEventListener('DOMContentLoaded', function() {
    // Seleção de elementos do DOM
    const campoBusca = document.getElementById('campoBusca');
    const btnBusca = document.getElementById('btnBusca');
    const btnVoltarInicio = document.getElementById('btnVoltarInicio');
    const sumarioLinks = document.querySelectorAll('.sumario-link');
    const secoes = document.querySelectorAll('.secao-manual');
    const resultadoBusca = document.getElementById('resultadoBusca');

    // ============================================
    // 1. FUNÇÃO CENTRAL DE SCROLL COM OFFSET
    // Compensa a altura do header fixo para que o título da seção não fique escondido
    // ============================================
    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        // Offset de 80px para compensar o header fixo no topo
        const headerOffset = 80; 
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // Executa a rolagem suave até a posição calculada
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Adiciona classe 'highlight' para efeito visual de amarelo piscando na seção encontrada
        targetSection.classList.add('highlight');
        setTimeout(() => {
            targetSection.classList.remove('highlight');
        }, 2000); // Remove o destaque após 2 segundos

        // Atualiza o sumário lateral para refletir visualmente a seção ativa
        sumarioLinks.forEach(link => {
            link.classList.remove('ativo');
            if (link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('ativo');
            }
        });
    }

    // ============================================
    // 2. NAVEGAÇÃO POR ÂNCORA DO SUMÁRIO
    // Intercepta o clique nos links do sumário para usar o scroll personalizado
    // ============================================
    sumarioLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Impede o salto brusco padrão do navegador
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Atualiza a URL sem recarregar a página
            history.pushState(null, null, `#${targetId}`);
        });
    });

    // ============================================
    // 3. SCROLL SPY (Intersection Observer)
    // Detecta automaticamente qual seção está visível na tela e atualiza o sumário
    // ============================================
    // rootMargin: '-100px' compensa o header, '-60%' faz o gatilho ocorrer quando a seção ocupa a parte superior da tela
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

    // Registra cada seção para ser observada
    secoes.forEach(secao => sectionObserver.observe(secao));

    // ============================================
    // 4. FUNCIONALIDADE DE BUSCA OTIMIZADA
    // Filtra seções por título ou conteúdo, pontua e exibe resultados no sumário
    // ============================================
    function realizarBusca() {
        const termo = campoBusca.value.toLowerCase().trim();
        
        // Limpa destaques visuais anteriores
        secoes.forEach(s => s.classList.remove('highlight'));
        
        // Se o termo for muito curto, limpa os resultados e sai da função
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
            
            // Verifica se o termo existe no título ou no conteúdo
            if (tituloTexto.includes(termo) || conteudoTexto.includes(termo)) {
                const id = secao.getAttribute('id');
                const tipo = tituloTexto.includes(termo) ? 'Título' : 'Conteúdo';
                
                // Sistema de pontuação: Match no título vale mais (score 2) que no conteúdo (score 1)
                const score = tituloTexto.includes(termo) ? 2 : 1; 
                
                resultados.push({ id, titulo: titulo.textContent, tipo, score });
            }
        });

        // Ordena os resultados: os com maior score (matches no título) aparecem primeiro
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

    // Event listeners para acionar a busca
    campoBusca.addEventListener('input', realizarBusca); // Busca em tempo real ao digitar
    btnBusca.addEventListener('click', realizarBusca);   // Busca ao clicar no ícone
    
    // Permite acionar a busca pressionando "Enter" no campo de texto
    campoBusca.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita recarregar a página
            realizarBusca();
        }
    });

        // ============================================
    // 5. BOTÃO VOLTAR AO INÍCIO (CORRIGIDO E ROBUSTO)
    // Controla a visibilidade e a ação de rolagem suave para o topo
    // ============================================
    
    // Verificação de segurança: garante que o botão existe no DOM antes de manipulá-lo
    if (btnVoltarInicio) {
        
        // 1. Estado inicial do botão (oculto e com transição suave definida no JS como fallback)
        btnVoltarInicio.style.opacity = '0';
        btnVoltarInicio.style.visibility = 'hidden';
        btnVoltarInicio.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

        // 2. Função dedicada para atualizar a visibilidade baseada na posição do scroll
        const toggleBackToTopButton = () => {
            // Usa window.scrollY (padrão moderno) ou window.pageYOffset (fallback para navegadores antigos)
            const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollPosition > 300) {
                btnVoltarInicio.style.opacity = '1';
                btnVoltarInicio.style.visibility = 'visible';
                btnVoltarInicio.style.pointerEvents = 'auto'; // Garante que o botão seja clicável
            } else {
                btnVoltarInicio.style.opacity = '0';
                btnVoltarInicio.style.visibility = 'hidden';
                btnVoltarInicio.style.pointerEvents = 'none'; // CRUCIAL: evita que o botão invisível bloqueie cliques em outros elementos
            }
        };

        // 3. Adiciona o listener de scroll com { passive: true } para melhorar a performance de rolagem da página
        window.addEventListener('scroll', toggleBackToTopButton, { passive: true });
        
        // Executa uma vez no carregamento para definir o estado correto inicial
        toggleBackToTopButton();

        // 4. Ação de clique: rola suavemente para o topo e reseta o sumário
        btnVoltarInicio.addEventListener('click', (e) => {
            e.preventDefault(); // Previne qualquer comportamento padrão indesejado do navegador
            
            // Força a rolagem para o topo usando múltiplos métodos para garantir compatibilidade total
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
            
            // Reseta visualmente o sumário lateral para a primeira opção
            sumarioLinks.forEach(link => link.classList.remove('ativo'));
            if (sumarioLinks.length > 0) {
                sumarioLinks[0].classList.add('ativo');
            }
        });
    } else {
        console.warn("Atenção: O elemento 'btnVoltarInicio' não foi encontrado no HTML.");
    }

    // ============================================
    // 6. CARREGAR SEÇÃO DA URL (Deep Linking)
    // Se o usuário acessar uma URL com hash (ex: site.com/#faq), rola até a seção
    // ============================================
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        // Pequeno timeout garante que o layout e as dimensões já foram calculados pelo navegador
        setTimeout(() => scrollToSection(hash), 300);
    }
});