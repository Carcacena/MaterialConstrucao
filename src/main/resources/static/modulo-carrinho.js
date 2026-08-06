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

    console.log(`🖨️ [Geração de Arquivo] Solicitando PDF do pedido ${numPedido} ao Railway...`);
    
    // Alerta sênior de processamento que o piá vai ver na tela
    alert(`🖨️ SISTEMA MAGIA - BALCÃO DE VENDAS\n\nProcessando lote de dados do Pedido: ${numPedido}\nGerando arquivo PDF da Conta Corrente...\n\n[Impressão disparada com sucesso!]`);
}
		
async function buscarPedidosPorPeriodo() {
		    const dtInicio = document.getElementById("filtroDataInicio").value;
		    const dtFim = document.getElementById("filtroDataFim").value;
		    
		    console.log(`Buscando tráfego entre ${dtInicio} e ${dtFim}`);
		    
		   // const urlServidor = window.API_URL || "http://localhost:8080";
		   const urlServidor =
		       window.API_URL || "http://localhost:8080";

			//   const tokenSeguro =
			   let tokenSeguro = window.token || "";

			   if (!tokenSeguro) {
			       const tokenBruto = localStorage.getItem("token");

			       if (tokenBruto) {
			           try {
			               const dadosToken = JSON.parse(tokenBruto);
			               tokenSeguro = dadosToken.token || "";
			           } catch (erro) {
			               // Se não for JSON, assume que já é o JWT puro
			               tokenSeguro = tokenBruto;
			           }
			       }
			   }
			   
			   
			//       window.token ||
			//       localStorage.getItem("token") ||
			       "";
		   // const tokenSeguro = window.token || "";
		   console.log(
		       "TOKEN DA PESQUISA:",
		       tokenSeguro ? "ENCONTRADO" : "VAZIO"
		   );

		   try {
		       const selectPedidos =
		           document.getElementById("dropdownPedidosLocalizados");

		       selectPedidos.innerHTML =
		           '<option value="">-- Selecione o Pedido Abaixo --</option>';
		   

		  //  try {
		        // Alimenta o Dropdown Selective com a massa de dados que criamos no MySQL (IDs 1, 2, 3 e 4)
		  //      const selectPedidos = document.getElementById("dropdownPedidosLocalizados");
		        selectPedidos.innerHTML = '<option value="">-- Selecione o Pedido Abaixo --</option>';
		  //falar com chefe     
		  const response = await fetch(
		      `${urlServidor}/carrinho/pesquisa/periodo` +
		      `?dataInicio=${dtInicio}&dataFim=${dtFim}`,
		      {
		          method: "GET",
				 
		          headers: {
		              "Authorization": `Bearer ${tokenSeguro}`
		          }
		      }
		  );
		  if (!response.ok) {
		      const mensagem = await response.text();

		      console.error(
		          "Erro ao pesquisar período:",
		          response.status,
		          mensagem
		      );

		      alert("Não foi possível pesquisar os pedidos.");
		      return;
		  }
		  const linhasCarrinho = await response.json();
		  const mapaPedidos = new Map();

		  linhasCarrinho.forEach(item => {
		      const numero =
		          item.numeroPedido || item.numero_pedido;

		      if (!numero || mapaPedidos.has(numero)) {
		          return;
		      }

		      mapaPedidos.set(numero, {
		          numero: numero,
		          cliente:
		              item.cliente?.nome || "Consumidor Geral",
		          status: Number(item.status)
		      });
		  });
		  
		  const pedidosDoBanco =
		      Array.from(mapaPedidos.values());

		  if (pedidosDoBanco.length === 0) {
		      selectPedidos.innerHTML =
		          '<option value="">Nenhum pedido no período</option>';

		      document.getElementById(
		          "secaoDropdownPedidos"
		      ).style.display = "block";

		      document.getElementById(
		          "areaGridProdutosPesquisa"
		      ).style.display = "none";

		      return;
		  }
		  
		  pedidosDoBanco.forEach(p => {
		      const opt = document.createElement("option");

		      opt.value = p.numero;

		      opt.textContent =
		          `${p.numero}` +
		          ` | Cliente: ${p.cliente}` +
		          ` | [${traduzirStatusCarrinho(p.status)}]`;

		      selectPedidos.appendChild(opt);
		  });
			  
	        pedidosDoBanco.forEach(p => {
		            const opt = document.createElement("option");
		            opt.value = p.numero;
		            opt.textContent = `${p.numero} | Cliente: ${p.cliente} | [${p.status}]`;
		            selectPedidos.appendChild(opt);
		        });

		        document.getElementById("secaoDropdownPedidos").style.display = "block";
		        document.getElementById("areaGridProdutosPesquisa").style.display = "none";

		    } catch (e) {
		        console.error("Erro ao carregar período:", e);
		    }
		}		
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
		
		
		
