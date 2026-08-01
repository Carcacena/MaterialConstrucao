async function carregarClientesPDV() {
  try {
    const response = await fetch(`${API_URL}/clientes`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const select = document.getElementById("selectClienteModal");
    if (!select) return;

    if (response.ok) {
      const clientes = await response.json();
      select.innerHTML = '<option value="">Selecione o Cliente...</option>';
      
      clientes.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.id} - ${c.nome}`;
        if (c.nome.toUpperCase().includes("BALCAO") || c.id === 1) opt.selected = true;
        select.appendChild(opt);
      });

      // 🛑 REMOVIDO: A chamada automática para carregarCarrinhoDoBanco() foi tirada daqui
      // Isso impede que a renderização inicial entre em loop cíclico.
    }
  } catch (e) {
    console.error("Erro clientes:", e);
  }
}

// 📦 APERTOU F10: INFLA O POP-UP DE FECHAMENTO COM O VALOR ATUALIZADO
// 📦 APERTOU F10: INFLA O POP-UP DE FECHAMENTO COM O VALOR ATUALIZADO
async function abrirPainelFechamento() {
  if (totalAcumuladoCupom <= 0) {
    alert("O carrinho de negociação está vazio! Lance um item antes de fechar.");
    return;
  }

  document.getElementById("totalModalDisplay").textContent = `R$ ${totalAcumuladoCupom.toFixed(2).replace('.', ',')}`;

  const modalElement = document.getElementById("modalFecharPedido");

  // 🚀 SEGUNDA OPÇÃO: Carrega o Bootstrap sob demanda para fugir do loop do HTML
  if (typeof bootstrap === "undefined") {
    console.log("Injetando Bootstrap dinamicamente para evitar loops...");
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://jsdelivr.net";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Não foi possível carregar o Bootstrap."));
      document.body.appendChild(script);
    });
  }

  // Com a biblioteca carregada de forma isolada, abre o modal normalmente
  if (typeof bootstrap !== "undefined") {
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  } else {
    alert("Erro ao inicializar os componentes do modal.");
  }
}

// 💾 CONFIRMAR E EMITIR: FINALIZA, ATUALIZA CONTA CORRENTE E LIMPA TEMPORÁRIO
async function confirmarFaturamentoDefinitivo() {
  const clienteId = parseInt(document.getElementById("selectClienteModal").value);
  const labelStatus = document.getElementById("labelStatusCarrinho");

  if (!clienteId) {
    alert("Por favor, selecione o cliente definitivo para este cupom!");
    return;
  }

  try {
    // 🔥 CORREÇÃO DA ROTA: Aponta para /carrinho/faturar/cliente/{id} conforme o seu Java Controller
    const URL_FATURAR = `${API_URL}/carrinho/faturar/cliente/${clienteId}`;
    console.log("Enviando requisição de faturamento para:", URL_FATURAR);

    const response = await fetch(URL_FATURAR, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // Removido Content-Type e Body porque o seu Java usa apenas o @PathVariable
      }
    });

    if (response.ok) {
      // Captura a mensagem de sucesso customizada do seu Java ("Venda faturada com sucesso no Spring Boot, piá!")
      const mensagemSucesso = await response.text();
      alert(mensagemSucesso);
      
      // Fecha o modal do Bootstrap de forma segura
      if (typeof bootstrap !== "undefined") {
        const modalElement = document.getElementById("modalFecharPedido");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
      }

      if (labelStatus) {
        labelStatus.textContent = "3 - Finalizado";
        labelStatus.className = "status-badge bg-success text-white";
      }

      // Atualiza a tela com o carrinho agora vazio
      if (typeof carregarCarrinhoDoBanco === "function") carregarCarrinhoDoBanco();
    } else {
      // Se cair aqui, o Spring Boot retornou 400 BadRequest (ex: Falta de estoque)
      const mensagemErro = await response.text();
      console.error("O servidor Spring Boot retornou um erro:", mensagemErro);
      alert(`Atenção: ${mensagemErro}`);
    }
  } catch (e) {
    console.error("Falha ao faturar:", e);
  }
}

// ❌ CANCELAR CUPOM (LIMPA A MESA DE NEGOCIAÇÃO)
async function cancelarOperacao() {
  if (confirm("Deseja mesmo cancelar e esvaziar a mesa de negociação atual?")) {
    try {
      await fetch(`${API_URL}/carrinho/cliente/1`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      produtoSelecionadoId = null;
      document.getElementById("inputQuantidade").value = "1";
      
      const labelStatus = document.getElementById("labelStatusCarrinho");
      if (labelStatus) {
        labelStatus.textContent = "2 - Cancelado";
        labelStatus.className = "status-badge bg-danger text-white";
      }

      if (typeof carregarCarrinhoDoBanco === "function") carregarCarrinhoDoBanco();
    } catch (e) {
      console.error("Erro ao cancelar:", e);
    }
  }
}

// 🔄 INICIALIZADOR SEGURO: Roda uma única vez quando a página termina de carregar
document.addEventListener("DOMContentLoaded", async () => {
  // Executa as funções sequencialmente e de forma isolada
  if (typeof carregarProdutosPDV === "function") await carregarProdutosPDV();
  if (typeof carregarClientesPDV === "function") await carregarClientesPDV();
  if (typeof carregarCarrinhoDoBanco === "function") carregarCarrinhoDoBanco();
});