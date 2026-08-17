// Herdando automaticamente o domínio do Railway em produção
const API_URL = ""; 

// =========================================================================
// CONTROLE DE AUTENTICAÇÃO JWT
// =========================================================================
const dadosLoginString = localStorage.getItem("token");
let token = null;

if (dadosLoginString) {
    try {
        const dadosLogin = JSON.parse(dadosLoginString);
        token = dadosLogin.token;
    } catch (e) {
        token = dadosLoginString;
    }
}

if (!token) {
    window.location.href = "login.html";
}

// =========================================================================
// MEMÓRIA COMPARTILHADA DO SISTEMA
// =========================================================================
let listaProdutosGlobal = [];
let produtoSelecionadoId = null;
let precoPraticadoVenda = 0;
let totalAcumuladoCupom = 0;

// Array para acumular os materiais na lateral esquerda da árvore flutuante
let loteTemporarioProdutos = [];

// =========================================================================
// MÓDULO DO MODAL FLUTUANTE DA ÁRVORE (Gatilhos de Janela)
// =========================================================================
function abrirModalProdutos() {
    const modalOverlay = document.getElementById('modal-arvore-produtos');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex'; // Exibe a cortina e centraliza a árvore
        
        // Foca automaticamente no campo de busca interno se houver
        const buscaModal = document.getElementById('busca-interna-modal');
        if (buscaModal) buscaModal.focus();
    }
}

function fecharModalArvoreProdutos() {
    const modalOverlay = document.getElementById('modal-arvore-produtos');
    if (modalOverlay) {
        modalOverlay.style.display = 'none'; // Esconde a árvore e volta pro balcão
    }
}

// =========================================================================
// GESTÃO DO LOTE TEMPORÁRIO INTERNO DO MODAL
// =========================================================================

// 1. Adiciona o produto na conferência lateral da árvore
function adicionarAoLoteTemporario(id, nome, preco) {
    const itemExistente = loteTemporarioProdutos.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.qtd += 1;
    } else {
        loteTemporarioProdutos.push({ id: id, nome: nome, preco: preco, qtd: 1 });
    }

    renderizarLoteTemporarioInterface();
}

// 2. Atualiza a mini listagem direita de conferência do modal
function renderizarLoteTemporarioInterface() {
    const container = document.getElementById('lista-lote-temporario');
    if (!container) return;

    if (loteTemporarioProdutos.length === 0) {
        container.innerHTML = `<div class="mensagem-vazia" style="padding: 20px 0; font-size: 13px;">Nenhum item selecionado.</div>`;
        return;
    }

    let html = `<ul style="list-style: none; padding: 0; margin: 0; color: white; font-size: 13px;">`;
    loteTemporarioProdutos.forEach(item => {
        html += `
            <li class="d-flex justify-content-between align-items-center mb-2" style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                <span>📦 <strong>${item.qtd}x</strong> ${item.nome}</span>
                <span style="color: #5eff5e; font-weight: bold;">R$ ${(item.preco * item.qtd).toFixed(2)}</span>
            </li>
        `;
    });
    html += `</ul>`;
    container.innerHTML = html;
}

// 3. O Botão CONFIRMA descarrega o lote no cupom definitivo lá atrás
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btn-confirma-lote-modal') {
        if (loteTemporarioProdutos.length === 0) {
            alert("Escolha ao menos um produto antes de confirmar!");
            return;
        }

        // Envia os itens selecionados em lote para o seu 'modulo-cupom.js'
        loteTemporarioProdutos.forEach(item => {
            if (typeof adicionarProdutoAoCupomReal === "function") {
                adicionarProdutoAoCupomReal(item.id, item.nome, item.preco, item.qtd);
            }
        });

        // Reseta o lote para a próxima abertura
        loteTemporarioProdutos = [];
        renderizarLoteTemporarioInterface();

        // Recolhe o modal
        fecharModalArvoreProdutos();
    }
});

// =========================================================================
// CONFIGURAÇÃO DOS ATALHOS DE TECLADO
// =========================================================================
function configurarAtalhosTeclado() {
    document.removeEventListener("keydown", lidarComAtalhos);
    document.addEventListener("keydown", lidarComAtalhos);
}

function lidarComAtalhos(e) {
    if (e.key === "F2") {
        e.preventDefault();
        abrirModalProdutos(); // Abre a árvore por atalho físico do teclado
    }
    if (e.key === "F10") {
        e.preventDefault();
        if (typeof abrirPainelFechamento === "function") abrirPainelFechamento();
    }
}

// =========================================================================
// ORQUESTRADOR DE INICIALIZAÇÃO DA MESA DE NEGOCIAÇÃO
// =========================================================================
function inicializarLogicaVenda() {
    configurarAtalhosTeclado();
   
    // Funções que vamos criar nos módulos específicos:
    if (typeof carregarClientesPDV === "function") carregarClientesPDV();
    if (typeof carregarProdutosPDV === "function") carregarProdutosPDV();
}

    // Inicializa as consultas assíncronas do banco MySQL
    if (typeof carregarClientesPDV === "function") {
        carregarClientesPDV();
    }

    if (typeof carregarProdutosPDV === "function") {
        carregarProdutosPDV();
    }



// Resguarda compatibilidade caso alguma rotina antiga chame a função esvaziada
function adicionarItemNaLista() {
    console.log("Faturamento direto desativado. Utilizando fluxo em árvore.");
}
