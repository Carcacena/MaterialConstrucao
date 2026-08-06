	
	async function abrirPainelFechamento() {
	    if (!window.itensCupomMemoria ||
	        window.itensCupomMemoria.length === 0) {

	        alert("O carrinho está vazio!");
	        return;
	    }
		
		await carregarClientesPDV();

		const total = window.itensCupomMemoria.reduce(
		    (soma, item) => {
		        const quantidade = Number(item.quantidade || 0);
		        const preco = Number(item.precoPraticado || 0);

		        return soma + (quantidade * preco);
		    },
		    0
		);

	    const totalModal =
	        document.getElementById("totalModalDisplay");

	    if (totalModal) {
	        totalModal.textContent =
	            `R$ ${total.toFixed(2).replace(".", ",")}`;
	    }

	    const modalElemento =
	        document.getElementById("modalFecharPedido");

	    if (!modalElemento) {
	        console.error(
	            'Modal "modalFecharPedido" não encontrado.'
	        );
	        return;
	    }

	    const modal =
	        bootstrap.Modal.getOrCreateInstance(modalElemento);

	    modal.show();
	}
	async function confirmarFaturamentoDefinitivo() {
	    if (
	        !window.itensCupomMemoria ||
	        window.itensCupomMemoria.length === 0
	    ) {
	        alert("O carrinho está vazio.");
	        return;
	    }

	    const selectCliente =
	        document.getElementById("selectClienteModal");

	    const selectPagamento =
	        document.getElementById("selectPagamentoModal");

	    const clienteId = Number(selectCliente?.value || 0);
	    const formaPagamento = selectPagamento?.value || "";

	    if (!clienteId) {
	        alert("Selecione o cliente.");
	        return;
	    }

	    if (!formaPagamento) {
	        alert("Selecione a forma de pagamento.");
	        return;
	    }

		const numeroPedido = window.numeroPedidoAtual;

		if (!numeroPedido) {
		    alert("Número do pedido não foi gerado.");
		    return;
		}

		try {
		    const response = await fetch(
		        `${API_URL}/carrinho/faturar/pedido/${encodeURIComponent(numeroPedido)}/cliente/${clienteId}`,
		        {
		            method: "POST",
		            headers: {
		                "Authorization": `Bearer ${token}`
		            }
		        }
		    );

		    if (!response.ok) {
		        const mensagemErro = await response.text();

		        console.error(
		            "Erro ao faturar pedido:",
		            response.status,
		            mensagemErro
		        );

		        alert(
		            `Não foi possível faturar o pedido.\n\n` +
		            `${mensagemErro || `Status: ${response.status}`}`
		        );

		        return;
		    }

		    const mensagemSucesso = await response.text();

		    alert(mensagemSucesso || "Venda faturada com sucesso!");

		    window.itensCupomMemoria = [];
		    window.numeroPedidoAtual = `PED-${Date.now()}`;

		    if (typeof renderizarCupomDaMemoria === "function") {
		        renderizarCupomDaMemoria();
		    }

		    if (typeof carregarProdutosPDV === "function") {
		        await carregarProdutosPDV();
		    }

		    const modalElemento =
		        document.getElementById("modalFecharPedido");

		    const modal =
		        bootstrap.Modal.getInstance(modalElemento);

		    if (modal) {
		        modal.hide();
		    }

	    const labelStatus =
		        document.getElementById("labelStatusCarrinho");

		    if (labelStatus) {
		        labelStatus.textContent = "2 - Faturado";
		        labelStatus.className =
		            "status-badge bg-success text-white";
		    }

		} catch (erro) {
		    console.error(
		        "Falha de comunicação ao faturar:",
		        erro
		    );

		    alert("Falha de comunicação com o servidor.");
		}
		
		
		
}