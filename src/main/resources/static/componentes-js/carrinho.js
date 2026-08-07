// --- 1. TOPO DO ARQUIVO: DECLARAÇÃO DO BUFFER LOCAL E VARIÁVEIS GLOBAIS ---
if (typeof window.API_URL === 'undefined') {
    window.API_URL = "http://localhost:8080";
}

async function pesquisaCarrinho() {
    console.log("🔍 [Filtro Avançado] Abrindo painel de tráfego por período...");

    let painelConsulta = document.getElementById("painelConsultaCarrinho");
    if (!painelConsulta) {
        painelConsulta = document.createElement("div");
        painelConsulta.id = "painelConsultaCarrinho";
        painelConsulta.style = "position: fixed; top: 12%; left: 20%; width: 60%; background: white; border: 2px solid #2c3e50; border-radius: 8px; box-shadow: 0px 4px 15px rgba(0,0,0,0.3); z-index: 9999; padding: 15px; font-family: sans-serif;";
        document.body.appendChild(painelConsulta);
    }

	painelConsulta.innerHTML = `
	       <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2c3e50; padding-bottom: 8px; margin-bottom: 15px;">
	           <h3 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 8px;">
	               <span>🛒</span> Painel Gerencial de Pedidos
	           </h3>
	           <button onclick="document.getElementById('painelConsultaCarrinho').style.display='none'" style="background: #c0392b; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">X</button>
	       </div>
	       
	       <!-- 🔥 ESTRUTURA BLINDADA COM ALINHAMENTO LADO A LADO -->
	       <div style="display: flex; gap: 10px; align-items: flex-end; background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #ddd; flex-wrap: nowrap;">
	           <div style="width: 28%;">
	               <label style="display: block; font-size: 11px; font-weight: bold; color: #555; margin-bottom: 4px;">Data Início:</label>
	               <input type="date" id="filtroDataInicio" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; height: 32px; box-sizing: border-box;">
	           </div>
	           <div style="width: 28%;">
	               <label style="display: block; font-size: 11px; font-weight: bold; color: #555; margin-bottom: 4px;">Data Fim:</label>
	               <input type="date" id="filtroDataFim" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; height: 32px; box-sizing: border-box;">
	           </div>
	           
	           <!-- BOTÃO FILTRAR -->
	           <button onclick="buscarPedidosPorPeriodo()" style="width: 22%; background: #2980b9; color: white; border: none; padding: 0 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; height: 32px; box-sizing: border-box;">
	               🔍 Filtrar
	           </button>
	           
	           <!-- BOTÃO IMPRIMIR PDF -->
	           <button id="btnImprimirRelatorioPdf" onclick="imprimirPedidoPdfAtual()" disabled style="width: 22%; background: #27ae60; color: white; border: none; padding: 0 10px; border-radius: 4px; font-weight: bold; cursor: not-allowed; opacity: 0.5; font-size: 11px; height: 32px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 3px;">
	               <span>🖨️</span> Imprimir PDF
	           </button>
			   
	       </div>

	       <!-- SEÇÃO DROPDOWN SELECTIVE -->
	       <div id="secaoDropdownPedidos" style="display: none; background: #eef2f5; padding: 12px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #2980b9;">
	           <label style="display: block; font-size: 12px; font-weight: bold; color: #2c3e50; margin-bottom: 6px;">Selecione o Pedido Cadastrado no Período:</label>
	           <select id="dropdownPedidosLocalizados" onchange="carregarDetalhesDoPedidoSelecionado()" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; background: white; font-weight: bold; color: #2c3e50;">
	               <option value="">Aguardando seleção...</option>
	           </select>
	       </div>

	       <!-- TABELA DE EXIBIÇÃO DOS PRODUTOS -->
	       <div id="areaGridProdutosPesquisa" style="display: none;">
	           <div style="margin-bottom: 10px; font-size: 12px; color: #333;" id="infoClientePedidoSelecionado"></div>
	           <div style="max-height: 180px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
	               <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
	                   <thead>
	                       <tr style="background: #2c3e50; color: white; position: sticky; top: 0;">
	                           <th style="padding: 6px; text-align: left;">Produto</th>
	                           <th style="padding: 6px; text-align: center;">Qtd</th>
	                           <th style="padding: 6px; text-align: right;">Preço</th>
	                           <th style="padding: 6px; text-align: right;">Subtotal</th>
	                           <th style="padding: 6px; text-align: center;">Situação (C/C)</th>
	                       </tr>
	                   </thead>
	                   <tbody id="corpoTabelaPesquisaAvancada"></tbody>
	               </table>
	           </div>
	           <div style="margin-top: 10px; text-align: right; font-size: 14px; font-weight: bold; color: #27ae60;" id="totalizadorPesquisaAvancada"></div>
	       </div>
	   `;

    painelConsulta.style.display = "block";
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById("filtroDataInicio").value = hoje;
    document.getElementById("filtroDataFim").value = hoje;
}
window.pesquisaCarrinho = pesquisaCarrinho;
window.buscarPedidosPorPeriodo = buscarPedidosPorPeriodo;
window.carregarDetalhesDoPedidoSelecionado = carregarDetalhesDoPedidoSelecionado;
window.imprimirPedidoPdfAtual = imprimirPedidoPdfAtual;
		
// ============================================================================
// 4. FUNÇÃO AUXILIAR: ACIONADA AO CLICAR NO BOTÃO DE IMPRESSÃO (PDF)
// ============================================================================
function imprimirPedidoPdfAtual() {
    const numPedido = document.getElementById("dropdownPedidosLocalizados").value;
    
    if (!numPedido) {
        alert("Por favor, selecione um pedido no dropdown antes de imprimir!");
        return;
    }

    console.log(`🖨️ [Geração de PDF] Solicitando relatório do pedido: ${numPedido}`);

    const urlServidor = window.API_URL || "http://localhost:8080";
    
    // Captura o token JWT para autenticar a requisição do relatório
    let tokenSeguro = window.token || "";
    if (!tokenSeguro) {
        const tokenBruto = localStorage.getItem("token");
        if (tokenBruto) {
            try { tokenSeguro = JSON.parse(tokenBruto).token || tokenBruto; } 
            catch (e) { tokenSeguro = tokenBruto; }
        }
    }

    // Dispara a requisição buscando o arquivo binário (Blob) do PDF no Spring Boot
    fetch(`${urlServidor}/carrinho/pesquisa/pedido/${encodeURIComponent(numPedido)}/pdf`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${tokenSeguro}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro ao gerar o PDF no servidor.");
        return response.blob(); // Transforma a resposta em um arquivo binário
    })
    .then(blob => {
        // Cria uma URL temporária na memória do navegador para o arquivo
        const urlPdf = window.URL.createObjectURL(blob);
        
        // Abre o PDF em uma nova aba para o operador visualizar ou imprimir
        window.open(urlPdf, '_blank');
    })
    .catch(erro => {
        console.error("Erro crítico na emissão do PDF:", erro);
        alert("Falha ao gerar PDF. Certifique-se de que o endpoint de relatório está criado no Java.");
    });
}
		
async function buscarPedidosPorPeriodo() { 
    const dtInicio = document.getElementById("filtroDataInicio").value; 
    const dtFim = document.getElementById("filtroDataFim").value; 
    
    console.log(`🔍 [Quebra de Nível] Agrupando pedidos entre ${dtInicio} e ${dtFim}`); 
    const urlServidor = window.API_URL || "http://localhost:8080"; 
    let tokenSeguro = window.token || ""; 

    if (!tokenSeguro) { 
        const tokenBruto = localStorage.getItem("token"); 
        if (tokenBruto) { 
            try { 
                const dadosToken = JSON.parse(tokenBruto); 
                tokenSeguro = dadosToken.token || ""; 
            } catch (erro) { 
                tokenSeguro = tokenBruto; 
            } 
        } 
    } 

    try { 
        const selectPedidos = document.getElementById("dropdownPedidosLocalizados"); 
        selectPedidos.innerHTML = '<option value="">-- Selecione o Pedido Abaixo --</option>'; 

        // 🔥 CORRIGIDO: Retornada a URL de busca por período correta (Esta busca por datas!)
        const response = await fetch( 
            `${urlServidor}/carrinho/pesquisa/periodo?dataInicio=${dtInicio}&dataFim=${dtFim}`, 
            { 
                method: "GET", 
                headers: { "Authorization": `Bearer ${tokenSeguro}` } 
            } 
        ); 

        if (!response.ok) { 
            const mensagem = await response.text(); 
            console.error("Erro ao pesquisar período:", response.status, mensagem); 
            alert("Não foi possível pesquisar os pedidos."); 
            return; 
        } 

        const linhasCarrinho = await response.json(); 
        if (!linhasCarrinho || linhasCarrinho.length === 0) { 
            selectPedidos.innerHTML = '<option value="">Nenhum pedido no período</option>'; 
            document.getElementById("secaoDropdownPedidos").style.display = "block"; 
            document.getElementById("areaGridProdutosPesquisa").style.display = "none"; 
            return; 
        } 

        // ==================================================================== 
        // AGRUPAMENTO EM ÁRVORE COM ACUMULADOR (PADRÃO QUEBRA DE NÍVEL COBOL) 
        // ==================================================================== 
        // 🔥 CORRIGIDO: Recriada a variável que tinha sumido do escopo
        const arvoreClientes = {}; 

        linhasCarrinho.forEach(item => { 
            const clienteNome = item.cliente?.nome || item.nomeCliente || item.nome_cliente || `Cliente Código ${item.clienteId || 1}`; 
            
            // Aqui a variável numPedido nasce de forma segura para o loop usar abaixo
            const numPedido = item.numeroPedido || item.numero_pedido || (item.pedido && item.pedido.numero); 
            
            if (!numPedido) return; 

            // Inicializa o Cliente (Raiz) 
            if (!arvoreClientes[clienteNome]) { 
                arvoreClientes[clienteNome] = []; 
            } 

            // Calcula o valor da linha atual (Qtd * Preço) 
            const preco = Number(item.precoPraticado || item.preco_praticado || item.preco || 0); 
            const qtd = Number(item.quantidade || 0); 
            const subtotalLinha = qtd * preco; 

            // Verifica se o pedido já foi adicionado para este cliente 
            const pedidoExistente = arvoreClientes[clienteNome].find(p => p.numero === numPedido); 
            if (!pedidoExistente) { 
                // Se não existe, cria o registro do pedido com o valor inicial 
                arvoreClientes[clienteNome].push({ 
                    numero: numPedido, 
                    status: Number(item.status), 
                    totalPedido: subtotalLinha 
                }); 
            } else { 
                // Se já existe, acumula o valor do novo produto no total do pedido 
                pedidoExistente.totalPedido += subtotalLinha; 
            } 
        }); 

        // ==================================================================== 
        // INJEÇÃO HIERÁRQUICA COM DESTAQUE DE VALORES (TRECHO REFINADO) 
        // ==================================================================== 
        selectPedidos.innerHTML = '<option value="">-- SELECIONE UM PEDIDO --</option>'; 
	
		 Object.keys(arvoreClientes).forEach(nomeCliente => {
		            
		            // 👤 Linha de Cabeçalho do Cliente (Desativada para não ser clicada)
		            const optCliente = document.createElement("option");
		            optCliente.disabled = true;
		            optCliente.style = "background: #2c3e50; color: white; font-weight: bold; padding: 4px;";
		            optCliente.textContent = `👤 CLIENTE: ${nomeCliente.toUpperCase()}`;
		            selectPedidos.appendChild(optCliente);

		            // 📦 Linhas dos Pedidos Recuadas com Valores Acumulados
		            arvoreClientes[nomeCliente].forEach(p => {
		                const optPedido = document.createElement("option");
		                optPedido.value = p.numero;

		                // Tradução do status
		                const statusTxt = typeof traduzirStatusCarrinho === "function" 
		                    ? traduzirStatusCarrinho(p.status) 
		                    : (p.status === 2 ? "🟢 Faturado" : "🟡 Orçamento");

		                // Formatação comercial do dinheiro em Real R$
		                const valorFormatado = Number(p.totalPedido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

		                // Montagem da linha limpa e explícita para o balcão e diretoria
		                optPedido.textContent = `   ┗━━ Pedido: ${p.numero}  |  ${valorFormatado}  |  [${statusTxt}]`;
		                optPedido.style = "padding-left: 15px; font-weight: normal; color: #333;";
		                
		                selectPedidos.appendChild(optPedido);
		            });
		        });

		        document.getElementById("secaoDropdownPedidos").style.display = "block";
		        document.getElementById("areaGridProdutosPesquisa").style.display = "none";

		    } catch (e) {
		        console.error("Erro ao carregar período:", e);
		    }
		}
		      
window.buscarPedidosPorPeriodo = buscarPedidosPorPeriodo;

		function obterTokenSeguro() {
		    if (window.token) {
		        return window.token;
		    }

		    const fontes = [
		        localStorage.getItem("token"),
		        localStorage.getItem("usuario")
		    ];

		    for (const valor of fontes) {
		        if (!valor) {
		            continue;
		        }

		        try {
		            const objeto = JSON.parse(valor);

		            if (objeto.token) {
		                return objeto.token;
		            }
		        } catch (erro) {
		            // Se não for JSON, pode ser o JWT puro
		            if (valor.startsWith("eyJ")) {
		                return valor;
		            }
		        }
		    }

		    return "";
		}
		
		async function carregarDetalhesDoPedidoSelecionado() {
		  const select = document.getElementById("dropdownPedidosLocalizados");
		  const numPedido = select.value;
		  const btnPrint = document.getElementById("btnImprimirRelatorioPdf");

		  const resetarInterface = () => {
		    document.getElementById("areaGridProdutosPesquisa").style.display = "none";
		    btnPrint.disabled = true;
		    btnPrint.style.cursor = "not-allowed";
		    btnPrint.style.opacity = "0.5";
		  };

		  // PARTE 1: VALIDAÇÃO DE SEGURANÇA
		  if (!numPedido) {
		    resetarInterface();
		    return;
		  }

		  const urlServidor = window.API_URL || "http://localhost:8080";
		  let tokenSeguro = window.token || "";

		  if (!tokenSeguro) {
		    const tokenBruto = localStorage.getItem("token");
		    if (tokenBruto) {
		      try {
		        const dadosToken = JSON.parse(tokenBruto);
		        tokenSeguro = dadosToken.token || "";
		      } catch (erro) {
		        tokenSeguro = tokenBruto;
		      }
		    }
		  }

		  try {
		    console.log(`📦 [Dropdown Selective] Buscando dados do lote: ${numPedido}`);

		    // 🔥 URL AJUSTADA: Sem a palavra "/pesquisa" para casar perfeitamente com seu endpoint Java
		    const response = await fetch(
		      `${urlServidor}/carrinho/pedido/${encodeURIComponent(numPedido)}`,
		      {
		        method: "GET",
		        headers: {
		          "Authorization": `Bearer ${tokenSeguro}`
		        }
		      }
		    );

		    // PARTE 2: MAPEAMENTO DO PRODUTO E INJEÇÃO NO GRID VISUAL
		    if (response.ok) {
		      const itens = await response.json();
		      const tbody = document.getElementById("corpoTabelaPesquisaAvancada");
		      tbody.innerHTML = "";
		      
		      let totalAcumuladoLote = 0;
		      let nomeCliente = "Consumidor Geral";

		      // Lê o nome do cliente direto do relacionamento @ManyToOne do seu Java
		      if (itens && itens.length > 0) {
		        const primeiro = itens[0];
		        if (primeiro.cliente && primeiro.cliente.nome) {
		          nomeCliente = primeiro.cliente.nome;
		        }
		      }

		      // Varre o lote de registros e desenha as linhas na tabela
		      itens.forEach((item, index) => {
		        // 🔥 SINCRONIZADO COM SUA CLASSE JAVA: precoPraticado e quantidade
		        const preco = Number(item.precoPraticado || 0);
		        const qtd = Number(item.quantidade || 0);
		        const sub = qtd * preco;
		        totalAcumuladoLote += sub;

		        // 🔥 TRATAMENTO DA SITUAÇÃO (C/C): Baseado nos inteiros (1, 2, 3) comentados no seu Java
		        let bStatus = "";
		        if (typeof traduzirStatusCarrinho === "function") {
		          bStatus = traduzirStatusCarrinho(item.status);
		        }
		        if (!bStatus) {
		          if (item.status === 1) bStatus = "🟡 Em Andamento";
		          else if (item.status === 2) bStatus = "🟢 Faturado";
		          else if (item.status === 3) bStatus = "🔴 Pendente";
		          else bStatus = `Status ${item.status}`;
		        }

		        // 🔥 SINCRONIZADO COM SEU PRODUTO JAVA: Acessa o objeto mapeado pelo Hibernate
		        const nomeProd = item.produto && item.produto.nome 
		          ? item.produto.nome 
		          : "Produto sem Nome";

		        const tr = document.createElement("tr");
		        tr.style.borderBottom = "1px solid #eee";
		        tr.innerHTML = `
				<td style="padding: 6px; text-align: left; color: #333;"><strong>${index + 1}</strong> - ${nomeProd}</td> 
				<td style="padding: 6px; text-align: center; color: #333;">${Number(qtd).toFixed(3)}</td> 
				<td style="padding: 6px; text-align: right; color: #333;">R$ ${Number(preco).toFixed(2)}</td> 
				<td style="padding: 6px; text-align: right; font-weight: bold; color: #27ae60;">R$ ${sub.toFixed(2)}</td> 
				<td style="padding: 6px; text-align: center; color: #333;">${bStatus}</td>
		        `;
		        tbody.appendChild(tr);
		      });

		      // Atualiza os cabeçalhos internos e os totalizadores do modal
		      document.getElementById("infoClientePedidoSelecionado").innerHTML = `
		        <strong>Cliente do Lote:</strong> <span style="text-transform: uppercase; color: #2980b9; font-weight: bold;">${nomeCliente}</span>
		      `;
		      
		      document.getElementById("totalizadorPesquisaAvancada").textContent = `VALOR DO LOTE NO BANCO: R$ ${totalAcumuladoLote.toFixed(2)}`;
		      
		      // Faz o bloco do grid e dos produtos aparecer na interface
		      document.getElementById("areaGridProdutosPesquisa").style.display = "block";

		      // Destrava o botão verde de impressão
		      btnPrint.disabled = false;
		      btnPrint.style.cursor = "pointer";
		      btnPrint.style.opacity = "1";

		    } else {
		      console.error("Servidor respondeu com erro ao buscar os itens do pedido:", response.status);
		      resetarInterface();
		    }
		  } catch (err) {
		    console.error("Erro crítico ao renderizar o select do dropdown:", err);
		    resetarInterface();
		  }
		}	
		
		
		
		
		function traduzirStatusCarrinho(status) {
		    switch (Number(status)) {
		        case 1:
		            return "1 - Pendente";

		        case 2:
		            return "2 - Faturado";

		        default:
		            return "Situação não identificada";
		    }
		}
	
		
		
	
		
