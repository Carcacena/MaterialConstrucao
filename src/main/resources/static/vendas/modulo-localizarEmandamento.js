// =========================================================================
// 🌳 MOTOR GENEALÓGICO DE BALCÃO: PRODUTO RAIZ ➡️ Cliente SUB-RAIZ
// =========================================================================

// 📦 BUSCA PRODUTOS DO BANCO DE DADOS
async function carregarProdutosPDV() {
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            listaProdutosGlobal = await response.json();
            montarArvoreVendasCentro();
        }
    } catch (e) {
        console.error("Erro ao carregar produtos:", e);
    }
}

// 🌳 RENDEREZAÇÃO PURA (CÓPIA DO LAYOUT ARVORECOLAPSADA.HTML)
function montarArvoreVendasCentro() {
    const container = document.getElementById("containerArvoreVendas");
    if (!container) return;
    container.innerHTML = "";

    // Atualiza contador do cabeçalho
    const txtContador = document.getElementById("contadorProdutosCatalogo");
    if (txtContador) txtContador.textContent = listaProdutosGlobal.length;

    // 🔄 1. Agrupa por PRODUTO RAIZ (Ex: Chuveiro, Cimento...)
    const hierarquia = {};
    listaProdutosGlobal.forEach(prod => {
        const raiz = prod.nome.trim().toUpperCase();
        if (!hierarquia[raiz]) hierarquia[raiz] = [];
        hierarquia[raiz].push(prod);
    });

    // 🔤 2. Ordena de A a Z
    const raizesOrdenadas = Object.keys(hierarquia).sort((a, b) => a.localeCompare(b));

    // 🔨 3. Monta a árvore na tela sem caixinhas (Texto Puro e Recuo)
    raizesOrdenadas.forEach(produtoRaiz => {
        const divGrupo = document.createElement("div");
        divGrupo.style.cssText = "margin-bottom: 6px; font-family: Arial, sans-serif;";

        // 📁 LINHA RAIZ (Pai - Nível João Alves Gouvêa)
        const divRaizRow = document.createElement("div");
        divRaizRow.style.cssText = "display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; color: white;";
        divRaizRow.innerHTML = `⚙️ <span style="font-weight: bold; font-size: 14px;">${produtoRaiz}</span> <span style="color: #ff9800; font-size: 11px;">(${hierarquia[produtoRaiz].length} marcas)</span>`;

        // Container dos Filhos (Sub-Raiz - Nível Ideliz, Vantuil...)
        const divSubRaizContainer = document.createElement("div");
        divSubRaizContainer.style.cssText = "display: none; padding-left: 24px; margin-top: 2px; border-left: 1px dashed rgba(255,255,255,0.15);";

        // Efeito abre/fecha ao clicar na linha do produto raiz
        divRaizRow.addEventListener("click", () => {
            divSubRaizContainer.style.display = divSubRaizContainer.style.display === "none" ? "block" : "none";
        });

        // Varre os Clientes daquele produto
        hierarquia[produtoRaiz].forEach(prod => {
            const ClienteNome = prod.Cliente ? prod.Cliente.nome : "Sem Marca";
            const tipoLabel = prod.aGranel ? "[Granel]" : "[Unid]";
            const precoVenda = prod.precoVenda || 0;
            const precoCusto = prod.precoCusto || 0;
            const margem = precoCusto > 0 ? (((precoVenda - precoCusto) / precoCusto) * 100).toFixed(0) : "0";
            const estoqueFormatado = prod.aGranel ? estoqueAtual.toFixed(3) : estoqueAtual.toFixed(0);

            // LINHA SUB-RAIZ (Filho com dados comerciais em linha limpa)
            const divItemFilho = document.createElement("div");
            divItemFilho.style.cssText = "padding: 6px 0; font-size: 13px; color: #ecf0f1; display: flex; flex-direction: column; gap: 4px;";

            // Texto da linha
            const divTextoLinha = document.createElement("div");
            divTextoLinha.style.cssText = "cursor: pointer; display: inline-block;";
            divTextoLinha.innerHTML = `🔹 <strong>${ClienteNome}</strong> <small style="color: #ff9800;">${tipoLabel}</small> - <span style="color: #5eff5e; font-weight: bold;">R$ ${precoVenda.toFixed(2)}</span> <small style="color: #bdc3c7; font-size: 11px;">(Margem: ${margem}%)</small>`;

            // 🎯 O MODELO DO PRINT: Menu de botões contextuais que nasce escondido logo abaixo do nome
            const divMenuBotoes = document.createElement("div");
            divMenuBotoes.style.cssText = "display: none; gap: 6px; padding-left: 15px; margin-top: 2px; margin-bottom: 4px;";
            divMenuBotoes.innerHTML = `
                <button class="btn" style="background: #27ae60; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;">Mover</button>
                <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled>Alterar</button>
                <button class="btn" style="background: #7f8c8d; color: white; font-size: 11px; padding: 2px 8px; border: none; border-radius: 3px; font-weight: bold; text-transform: uppercase;" disabled>Incluir</button>
            `;

            // Clique no texto do Cliente faz o menu de botões brotar logo abaixo dele (Igual ao print!)
            divTextoLinha.addEventListener("click", (evento) => {
                evento.stopPropagation(); // Impede o clique de fechar o pai
                document.querySelectorAll(".produtos-lista div[style*='display: flex']").forEach(m => m.style.display = "none");
                divMenuBotoes.style.style = "flex";
                divMenuBotoes.style.display = "flex";
            });

            // Ação do Botão Mover Contextual da linha
            const btnMoverLinha = divMenuBotoes.querySelector("button:nth-child(1)");
            btnMoverLinha.addEventListener("click", evento => {
                evento.stopPropagation();
                const inputQtd = document.getElementById("inputQuantidade");
                if (!inputQtd) return;
                const quantidadeInput = prod.aGranel ? parseFloat(inputQtd.value) : parseInt(inputQtd.value, 10);

                // Validações de Quantidade e Estoque antes de mover 
                if (isNaN(quantidadeInput) || quantidadeInput <= 0) {
                    alert("Atenção, piá! Informe uma quantidade válida maior que zero.");
                    return;
                }
                if (quantidadeInput > estoqueAtual) {
                    alert(`Estoque insuficiente.\nDisponível: ${estoqueFormatado}`);
                    return;
                }

                // Envia para o cupom 
                if (typeof adicionarProdutoAoCupom === "function") {
                    adicionarProdutoAoCupom(
                        prod.id,
                        `${produtoRaiz} (${ClienteNome})`,
                        quantidadeInput,
                        precoVenda,
                        precoCusto
                    );
                    inputQtd.value = "1";
                    divMenuBotoes.style.display = "none";
                }
            });

            divItemFilho.appendChild(divTextoLinha);
            divItemFilho.appendChild(divMenuBotoes);
            divSubRaizContainer.appendChild(divItemFilho);
        });

        divGrupo.appendChild(divRaizRow);
        divGrupo.appendChild(divSubRaizContainer);
        container.appendChild(divGrupo);
    });
}