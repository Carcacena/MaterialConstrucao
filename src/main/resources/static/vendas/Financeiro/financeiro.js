window.abrirFormaPagamento = function () {

    const valorTotalNota =
        parseFloat(document.getElementById("valorTotalNota")?.value) || 0;

    const totalModal = document.getElementById("totalModalDisplay");

    if (totalModal) {
        totalModal.textContent =
            `R$ ${valorTotalNota.toFixed(2).replace(".", ",")}`;
    }

    const modalFinanceiro = document.getElementById("modalFecharPedido");

    if (modalFinanceiro) {
        modalFinanceiro.classList.add("show");
        modalFinanceiro.style.setProperty("display", "block", "important");
        modalFinanceiro.style.background = "rgba(0,0,0,0.6)";
    }
};


window.confirmarPagamentoFinanceiro = function () {

    const modalFinanceiro =
        document.getElementById("modalFecharPedido");

    if (modalFinanceiro) {
        modalFinanceiro.style.setProperty("display", "none", "important");
        modalFinanceiro.classList.remove("show");
    }
};


