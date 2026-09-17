// =========================================================================
// 🚀 FUNÇÃO DE ESTORNO DISPARADA PELO BOTÃO ROXO DO PAINEL GERENCIAL
// =========================================================================
async function estornarNotaViaPainel(entradaId) {
    if (!entradaId) {
        alert("Erro: ID da entrada não localizado.");
        return;
    }

    const confirmar = confirm(
        `🚨 ATENÇÃO PIÃO!\n` +
        `Confirma o ESTORNO TOTAL da Nota Fiscal ID: ${entradaId}?\n` +
        `O estoque dos produtos desta entrada será subtraído automaticamente no MySQL.`
    );
    if (!confirmar) return;

    const token = typeof obterTokenSeguro === "function" ? obterTokenSeguro() : "";
    const headers = typeof montarHeaders === "function" ? montarHeaders() : { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const resposta = await fetch(`/api/entradas/estornar/${entradaId}`, {
            method: "POST",
            headers: headers
        });

        if (!resposta.ok) {
            const mensagemErro = await resposta.text();
            throw new Error(mensagemErro || "Erro ao processar estorno no servidor.");
        }

        alert("🚀 Sucesso! Entrada devolvida e estoque estornado com sucesso no MySQL.");

        const select = document.getElementById('selectNotaGerencial');
        if (select) {
            select.dispatchEvent(new Event('change'));
        }

    } catch (erro) {
        console.error("Erro no estorno:", erro);
        alert("Falha ao estornar: " + erro.message);
    }
}	

// 🔄 Abre a janela de seleção ao clicar no botão roxo do menu
function abrirPainelGerencial() {
    const modal = document.getElementById("modalSelecaoNotaDevolucao");
    if (modal) {
        modal.style.display = "block";
        console.log("Painel Seletivo de Notas aberto com sucesso!");
        if (typeof devolucaoEntrada === "function") {
            devolucaoEntrada(); 
        }
    } else {
        alert("Erro técnico: Não encontramos a div 'modalSelecaoNotaDevolucao' no HTML.");
    }
}

// ❌ Fecha a janela quando o usuário clica no botão "X"
function fecharModalDevolucao() {
    const modal = document.getElementById("modalSelecaoNotaDevolucao");
    if (modal) {
        modal.style.display = "none";
    }
}

// 🔍 BUSCA NO BANCO AS NOTAS ATIVAS (STATUS 1) E INJETA NO DROPDOWN
async function devolucaoEntrada() {
    const urlServidorAtual = window.urlServidor || "http://localhost:8080";
    const token = typeof obterTokenSeguro === "function" ? obterTokenSeguro() : "";
    
    const selectNota = document.getElementById("selectNotasAtivas");
    if (!selectNota) return;
    
    selectNota.innerHTML = '<option value="">-- Escolha uma Nota Fiscal --</option>';
    
    const areaItens = document.getElementById("areaItensNota");
    if (areaItens) areaItens.style.display = "none";

    try {
        const resposta = await fetch(`${urlServidorAtual}/api/entradas/ativas-resumo`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar notas do servidor.");
        const notas = await resposta.json();

        console.log("=== DADOS DO BANCO RECEBIDOS ===", notas);

        if (notas.length === 0) {
            console.log("Nenhuma nota ativa (Status 1) encontrada no banco de dados.");
            return;
        }

        notas.forEach(nota => {
            const option = document.createElement("option");
            option.value = nota.id; 
            
            const numNota = nota.numeroNota || nota.id || "S/N";
            
            let fornecedor = "Não informado";
            if (nota.nomeFornecedor) fornecedor = nota.nomeFornecedor;
            else if (nota.fornecedorNome) fornecedor = nota.fornecedorNome;
            else if (nota.fornecedor && nota.fornecedor.nome) fornecedor = nota.fornecedor.nome;
            else if (nota.fornecedor && nota.fornecedor.razaoSocial) fornecedor = nota.fornecedor.razaoSocial;
            
            option.text = `Nota ID: ${nota.id} (NF: ${numNota}) - Fornecedor: ${fornecedor}`;
            selectNota.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao listar notas para o painel:", erro);
    }
}

// ⚡ EVENTO: Dispara toda vez que o pião troca de nota no Dropdown da MODAL
async function buscarItensDaNotaSelecionada(idNota) {
    if (!idNota) {
        document.getElementById("areaItensNota").style.display = "none";
        return;
    }

    const token = typeof obterTokenSeguro === "function" ? obterTokenSeguro() : "";
    const tabelaItens = document.getElementById("corpoTabelaItensDevolucao");
    tabelaItens.innerHTML = "";

    try {
        const resposta = await fetch(`/api/entradas/${idNota}/itens`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar itens da nota.");
        const data = await resposta.json();

        const listaDeItens = Array.isArray(data) ? data : (data.itens || []);

        if (listaDeItens.length === 0) {
            tabelaItens.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:10px; color:#fff;">Nenhum produto nesta nota.</td></tr>`;
        }

        listaDeItens.forEach(item => {
            const idItem = item.id || item.produtoId;
            const nomeProd = item.produtoDescricao || item.nomeProduto || item.produtoNome || "Produto sem nome";
            const quantidade = item.quantidade || item.qtd || 0;

            const linha = `
                <tr style="border-bottom: 1px solid #25422e;">
                    <td style="padding:10px; text-align:center;"><input type="checkbox" class="check-produto-devolucao" value="${idItem}"></td>
                    <td style="padding:10px; color: #fff; font-weight: 500;">${nomeProd}</td>
                    <td style="padding:10px; color: #fff; text-align:center; font-weight: bold;">${quantidade}</td>
                </tr>
            `;
            tabelaItens.insertAdjacentHTML('beforeend', linha);
        });

        document.getElementById("areaItensNota").style.display = "block";

    } catch (erro) {
        alert("Erro ao buscar itens: " + erro.message);
    }
}

// 🚀 INTEGRADO: Executa o estorno da nota inteira usando o endpoint Java existente
async function processarLoteSelecionado() {
    const selectNota = document.getElementById("selectNotasAtivas");
    const entradaId = selectNota ? selectNota.value : null;

    if (!entradaId) {
        alert("Erro: ID da entrada não localizado.");
        return;
    }

    const confirmar = confirm(
        `🚨 CONFIRMAÇÃO DO ESTORNO TOTAL!\n` +
        `Deseja estornar totalmente os produtos da Nota ID: ${entradaId}?\n` +
        `O estoque do Cimento e demais itens será atualizado automaticamente no MySQL.`
    );
    if (!confirmar) return;

    const token = typeof obterTokenSeguro === "function" ? obterTokenSeguro() : "";
    const headers = typeof montarHeaders === "function" ? montarHeaders() : { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        // 🎯 Bate direto no @PostMapping("/estornar/{id}") mapeado no Java
        const resposta = await fetch(`/api/entradas/estornar/${entradaId}`, {
            method: "POST", 
            headers: headers
        });

        if (!resposta.ok) {
            const mensagemErro = await resposta.text();
            throw new Error(mensagemErro || "Erro ao estornar a entrada.");
        }

        alert("🚀 Sucesso absoluto, chefe! Entrada devolvida e estoque estornado com sucesso no MySQL.");
        fecharModalDevolucao();

    } catch (erro) {
        alert("Falha na operação: " + erro.message);
    }
}

function marcarTodosProdutos(master) {
    const checkboxes = document.querySelectorAll(".check-produto-devolucao");
    checkboxes.forEach(cb => cb.checked = master.checked);
}