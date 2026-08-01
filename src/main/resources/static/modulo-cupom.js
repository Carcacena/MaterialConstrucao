// =========================================================================
// ⚡ CONEXÃO DO MOTOR DO BALCÃO: INTERCEPTORES E GRAVAÇÃO DE FLUXO RÁPIDO
// =========================================================================

// 🧠 O RECEPTOR DO BOTÃO MOVER: Conecta a Árvore da Esquerda ao Cupom da Direita
function adicionarProdutoAoCupom(id, nome, quantidade, precoVenda, precoCusto) {
    console.log(`➡️ [Mesa de Negociação] Movendo Produto ID: ${id} | Qtd: ${quantidade} | Custo: R$ ${precoCusto} | Venda: R$ ${precoVenda}`);
    
    // 1. Injeta os dados nas variáveis globais que o seu script já utiliza
    produtoSelecionadoId = parseInt(id);
    precoPraticadoVenda = parseFloat(precoVenda);
    
    // 2. Alinha a quantidade na caixa de texto para que o método nativo consiga ler o valor correto
    document.getElementById("inputQuantidade").value = quantidade;
    
    // 3. Dispara a rotina oficial de persistência e carga no MySQL
    adicionarItemNaLista();
}

// 🔍 CARREGA O CARRINHO PENDENTE DO MYSQL VIA REPOSITÓRIO/SERVICE
async function carregarCarrinhoDoBanco() {
    let clienteId = 1;
    const selectModal = document.getElementById("selectClienteModal");
    if (selectModal && selectModal.value) {
        clienteId = parseInt(selectModal.value);
    }
    try {
        const response = await fetch(`${API_URL}/carrinho/cliente/${clienteId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const itensSalvos = await response.json();
            const tbody = document.getElementById("corpoTabelaItens");
            const divVazia = document.getElementById("tabelaItensVazia");
            const labelStatus = document.getElementById("labelStatusCarrinho");
            
            if (!tbody) return;
            tbody.innerHTML = "";
            totalAcumuladoCupom = 0;
            
            if (itensSalvos.length === 0) {
                if (divVazia) divVazia.style.display = "block";
                if (labelStatus) {
                    labelStatus.textContent = "Sem Pedido";
                    labelStatus.className = "status-badge bg-secondary text-white";
                }
            } else {
                if (divVazia) divVazia.style.display = "none";
                if (labelStatus) {
                    labelStatus.textContent = "1 - Em Andamento";
                    labelStatus.className = "status-badge status-andamento";
                }
                itensSalvos.forEach((item, index) => {
                    const subtotal = item.quantidade * item.precoPraticado;
                    totalAcumuladoCupom += subtotal;
                    
                    const tr = document.createElement("tr");
                    tr.className = "item-linha";
                    tr.innerHTML = `
                        <td><strong>${index + 1}</strong> - ${item.produto.nome} (${item.produto.fornecedor ? item.produto.fornecedor.nome : 'S/M'})</td>
                        <td class="text-center">${item.quantidade}</td>
                        <td class="text-end text-success fw-bold">R$ ${subtotal.toFixed(2)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
            
            // Injeta o total acumulado nos dois visores do caixa para manter a simetria
            const lblTotalVenda = document.getElementById("labelTotalVenda");
            if (lblTotalVenda) lblTotalVenda.textContent = `R$ ${totalAcumuladoCupom.toFixed(2).replace('.', ',')}`;
            
            const totalGeralCupom = document.getElementById("totalGeralCupom");
            if (totalGeralCupom) totalGeralCupom.textContent = totalAcumuladoCupom.toFixed(2);
        }
    } catch (e) {
        console.error("Erro ao carregar carrinho:", e);
    }
}

// 🛒 CONVERSA COM O SPRING BOOT: Salva o item da mesa direto na tabela do banco
async function adicionarItemNaLista() {
    const clienteId = 1;
    const quantidade = parseFloat(document.getElementById("inputQuantidade").value) || 0;
    
    if (!produtoSelecionadoId) {
        alert("Clique em uma variação de produto na árvore central primeiro!");
        return;
    }
    if (quantidade <= 0) {
        alert("Digite uma quantidade válida!");
        return;
    }
    
    const itemPayload = {
        cliente: { id: clienteId },
        produto: { id: produtoSelecionadoId },
        quantidade: quantidade,
        precoPraticado: precoPraticadoVenda
    };
    
    console.log("PAYLOAD ENVIADO AO CARRINHO:", itemPayload);
    
    try {
        const response = await fetch(`${API_URL}/carrinho`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(itemPayload)
        });
        
        if (response.ok) {
            // Limpa as seleções temporárias para deixar o caixa pronto para o próximo "Jogo Rápido!"
            produtoSelecionadoId = null;
            document.getElementById("inputQuantidade").value = "1";
            document.querySelectorAll(".produto-item").forEach(item => item.classList.remove("selecionado"));
            
            // Recarrega o lado direito puxando a lista atualizada do MySQL
            carregarCarrinhoDoBanco();
        } else {
            const respostaErro = await response.text();
            console.error("STATUS HTTP:", response.status);
            console.error("RESPOSTA DO BACKEND:", respostaErro);
            alert(
                `Erro ao salvar item no carrinho.\n\n` +
                `Status: ${response.status}\n` +
                `Resposta: ${respostaErro || "Sem detalhes do backend."}`
            );
        }
    } catch (erro) {
        console.error("Erro de comunicação com o servidor:", erro);
        alert("Não foi possível comunicar com o servidor.");
    }
}

// LÓGICA COMPLEMENTAR PARA ATUALIZAÇÃO EM LOTE NA MEMÓRIA LOCAL
function adicionarProdutoAoCupomReal(id, nome, preco, quantidade) {
    if (typeof carrinho === 'undefined') {
        window.carrinho = [];
    }
    const itemExistente = carrinho.find(item => item.produtoId === id);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal = itemExistente.quantidade * preco;
    } else {
        carrinho.push({
            produtoId: id,
            nome: nome,
            precoUnitario: preco,
            quantidade: quantity = quantidade,
            subtotal: preco * quantidade
        });
    }
    if (typeof atualizarInterfaceCupom === "function") {
        atualizarInterfaceCupom();
    }
    atualisBadgeContadorCaixa();
}

function atualisBadgeContadorCaixa() {
    if (typeof carrinho !== 'undefined') {
        const totalPecas = carrinho.reduce((acumulador, item) => acumulador + item.quantidade, 0);
        const badge = document.querySelector('.contador-catalogo span') || document.getElementById('contador-itens');
        if (badge) {
            badge.textContent = totalPecas;
        }
    }
}