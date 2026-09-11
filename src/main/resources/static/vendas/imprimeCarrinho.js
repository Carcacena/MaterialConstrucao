// componentes-js/imprimeCarrinho.js
// 🖨️ Toda a lógica de impressão/PDF do carrinho, isolada aqui

function imprimirPedidoPdfAtual() {
    const numPedido = document.getElementById("dropdownPedidosLocalizados").value;
    if (!numPedido) {
        alert("Por favor, selecione um pedido no dropdown antes de imprimir!");
        return;
    }
    console.log(`🖨️ [Geração de PDF] Solicitando relatório do pedido: ${numPedido}`);
    baixarPdf(`/carrinho/public/pedido/${encodeURIComponent(numPedido)}/pdf`, "Pedido");
}

window.imprimirPedidoPdfAtual = imprimirPedidoPdfAtual;