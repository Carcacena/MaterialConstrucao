async function cancelarOperacao() { 
    // 1. Validação de segurança: impede cancelar se o caixa já estiver zerado
    if (!window.itensCupomMemoria || window.itensCupomMemoria.length === 0) {
        alert("O carrinho de negociação já está vazio! Lance um item antes de cancelar.");
        return;
    }

    if (!confirm("Deseja mesmo cancelar e esvaziar a mesa de negociação atual?")) { 
        return; 
    } 

    const urlServidor = window.API_URL || "http://localhost:8080"; 
    let tokenSeguro = ""; 
    
    // Força a extração do token JWT do SUPERADMIN direto do localStorage no clique
    try { 
        const usuarioDadosBrutos = localStorage.getItem("usuario"); 
        if (usuarioDadosBrutos) { 
            const usuarioObjeto = JSON.parse(usuarioDadosBrutos); 
            tokenSeguro = usuarioObjeto.token || ""; 
            window.token = tokenSeguro; 
        } 
    } catch (e) { 
        console.error("Erro crítico ao ler token no cancelamento:", e); 
    } 

    try { 
        console.log(`💾 REGISTRANDO HISTÓRICO DE CANCELAMENTO PARA CONTA CORRENTE. ITENS: ${window.itensCupomMemoria.length}`);

        // 2. 🔥 AQUI ESTÁ A MÁGICA: Varre os itens REAIS da tela e envia um por um pro MySQL com status 2
        for (const item of window.itensCupomMemoria) {
            const itemPayload = { 
                cliente: { id: 1 }, // ID do cliente padrão/Balcão
                produto: { id: item.produtoId }, // Usa o ID REAL do produto que estava na tabela
                quantidade: item.quantidade, 
                precoPraticado: item.precoPraticado, 
                
                // 🌟 REGRA DO DIRETOR: 2 = Cancelado (Persiste fisicamente no MySQL)
                status: 2, 
                
                numeroPedido: window.numeroPedidoAtual, 
                numero_pedido: window.numeroPedidoAtual 
            }; 

            console.log("-> Enviando item cancelado ao banco:", itemPayload);

            // Bate no endpoint @PostMapping que você acabou de reconstruir no Java
            await fetch(`${urlServidor}/carrinho`, { 
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${tokenSeguro}` 
                }, 
                body: JSON.stringify(itemPayload) 
            }); 
        }

        console.log("✅ Todos os itens foram persistidos no MySQL com status 2.");

        // 3. 🧹 LIMPEZA TOTAL DA INTERFACE APÓS A CONFIRMAÇÃO DO BANCO
        window.itensCupomMemoria = []; 
        window.numeroPedidoAtual = `PED-${Date.now()}`; // Gera um novo número para a próxima venda

        produtoSelecionadoId = null; 
        document.getElementById("inputQuantidade").value = "1"; 
        
        const labelStatus = document.getElementById("labelStatusCarrinho"); 
        if (labelStatus) { 
            labelStatus.textContent = "2 - Cancelado"; 
            labelStatus.className = "status-badge bg-danger text-white"; 
        } 

        // Limpa visualmente o grid da direita
        if (typeof renderizarCupomDaMemoria === "function") { 
            renderizarCupomDaMemoria(); 
        } else { 
            const tbody = document.getElementById("corpoTabelaItens") || document.getElementById("corpoTabelaCupom"); 
            if (tbody) tbody.innerHTML = ""; 
        } 

        alert("Operação cancelada! Histórico gravado no MySQL e caixa resetado."); 

		 } catch (erroFetch) {
		        console.error(
		            "Erro na rota de persistência do cancelamento:",
		            erroFetch
		        );

		        alert(
		            "Falha de rede ao tentar registrar o cancelamento no banco."
		        );
		    }

		} // FECHA cancelarOperacao()
	
	async function carregarClientesPDV() {
	    try {
	        const response = await fetch(`${API_URL}/api/clientes`, {
	            method: "GET",
	            headers: {
	                "Authorization": `Bearer ${token}`
	            }
	        });

	        if (!response.ok) {
	            console.error(
	                "Erro ao carregar clientes. Status:",
	                response.status
	            );
	            return;
	        }

	        const clientes = await response.json();

	        const select =
	            document.getElementById("selectClienteModal");

	        if (!select) {
	            console.error(
	                'Select "selectClienteModal" não encontrado.'
	            );
	            return;
	        }

	        select.innerHTML =
	            '<option value="">Selecione o Cliente...</option>';

	        clientes.forEach(cliente => {
	            const option = document.createElement("option");

	            option.value = cliente.id;
	            option.textContent =
	                `${cliente.id} - ${cliente.nome}`;

	            select.appendChild(option);
	        });

	    } catch (erro) {
	        console.error("Erro ao carregar clientes:", erro);
	    }
	}
	
	
	
	