// =========================================================================
// 💳 MOTOR FINANCEIRO: Controle de Abertura e Movimento de Janela
// =========================================================================

window.abrirFormaPagamento = function () {
    console.log("💰 [Financeiro] Abrindo a janela de Fechamento do Pedido...");

    // 1. Captura o valor final calculado na tela de Impostos
    const valorTotalNota =
        parseFloat(document.getElementById("valorTotalNota")?.value) || 0;

    const totalModal = document.getElementById("totalModalDisplay");

    if (totalModal) {
        totalModal.textContent =
            `R$ ${valorTotalNota.toFixed(2).replace(".", ",")}`;
    }

    // 2. Localiza a pedra física do modal de fechamento
    const modalFinanceiro = document.getElementById("modalFecharPedido");

    if (modalFinanceiro) {
        // ⚡ XEQUE-MATE VISUAL: Abre a tela e remove as correntes fixas do Bootstrap!
        modalFinanceiro.style.setProperty("display", "block", "important");
        modalFinanceiro.style.position = "absolute"; 
        modalFinanceiro.style.right = "auto"; // Pulveriza a trava elástica da direita
        
        // Remove opacidade de fundo cinza que bloqueia o clique por trás
        modalFinanceiro.style.background = "#2c3e50"; 

        // 🚀 GATILHO COMPATÍVEL: Aciona a leitura dos mouses no exato milissegundo da abertura!
        window.ativarArrastoFechamentoCentral();
        console.log("🎯 [Sucesso] Modal aberto e motor de arraste ativado com perfume absoluto!");
    }
};

window.confirmarPagamentoFinanceiro = function () {
    const modalFinanceiro = document.getElementById("modalFecharPedido");

    if (modalFinanceiro) {
        modalFinanceiro.style.setProperty("display", "none", "important");
        if (modalFinanceiro.classList.contains("show")) {
            modalFinanceiro.classList.remove("show");
        }
    }
};

// =========================================================================
// 🌟 ENGINE VISUAL MESTRE: Faz o Modal do Centro passear livremente!
// =========================================================================
function ativarArrastoFechamentoCentral() {
    const modalCentral = document.getElementById("modalFecharPedido");
    const alcaHeader = document.getElementById("modalFecharPedidoHeader");

    if (!modalCentral || !alcaHeader) {
        console.log("ℹ️ Elementos do modal de fechamento ainda não renderizados na tela.");
        return;
    }

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Vincula o evento do clique do mouse na barra de título do fechamento
    alcaHeader.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Coordenadas iniciais do mouse no balcão
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calcula o deslocamento físico do ponteiro
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Altera dinamicamente as posições top e left da janela!
        modalCentral.style.top = (modalCentral.offsetTop - pos2) + "px";
        modalCentral.style.left = (modalCentral.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Solta o clique e crava a nova posição física na mesa de vendas
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Vincula a ativação no escopo global para chamarmos no ato da abertura
window.ativarArrastoFechamentoCentral = ativarArrastoFechamentoCentral;



// =========================================================================
// O SEU CODIGO ORIGINAL INTACTO (Com o gatilho móvel injetado no final)
// =========================================================================
window.abrirFormaPagamento = function () {
    const valorTotalNota = parseFloat(document.getElementById("valorTotalNota")?.value) || 0;
    const totalModal = document.getElementById("totalModalDisplay");

    if (totalModal) {
        totalModal.textContent = `R$ ${valorTotalNota.toFixed(2).replace(".", ",")}`;
    }

    const modalFinanceiro = document.getElementById("modalFecharPedido");

    if (modalFinanceiro) {
        modalFinanceiro.classList.add("show");
        modalFinanceiro.style.setProperty("display", "block", "important");
        modalFinanceiro.style.background = "rgba(0,0,0,0.6)";
        
        // 🌟 O TOQUE DE MAGIA: Destrava o fixed elástico e ativa os mouses no ato da abertura!
        modalFinanceiro.style.position = "absolute";
        modalFinanceiro.style.right = "auto";
        window.ativarArrastoFinanceiroMestre();
    }
};

window.confirmarPagamentoFinanceiro = function () {
    const modalFinanceiro = document.getElementById("modalFecharPedido");
    if (modalFinanceiro) {
        modalFinanceiro.style.setProperty("display", "none", "important");
        modalFinanceiro.classList.remove("show");
    }
};

// =========================================================================
// 🌟 ENGINE VISUAL ADICIONAL: Faz a sua roda original flutuar e passear!
// =========================================================================
window.ativarArrastoFinanceiroMestre = function () {
    const modal = document.getElementById("modalFecharPedido");
    const header = document.getElementById("modalFecharPedidoHeader");

    if (!modal || !header) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Mantém absoluto e limpa o right para o top/left mandar na tela
        modal.style.position = "absolute";
        modal.style.right = "auto";
        
        modal.style.top = (modal.offsetTop - pos2) + "px";
        modal.style.left = (modal.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
};















