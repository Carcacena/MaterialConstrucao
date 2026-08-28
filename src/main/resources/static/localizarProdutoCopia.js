// 🌳 MOTOR EXCLUSIVO DO COMPONENTE: LOCALIZAR PRODUTO
async function inicializarComponenteArvore(apiUrl, tokenJWT) {
    try {
        const response = await fetch(`${apiUrl}/produtos`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokenJWT}`
            }
        });

        if (response.ok) {
            const produtos = await response.json();
            const container = document.getElementById("containerArvoreVendas");
            if (!container) return;
            container.innerHTML = "";

            // Atualiza o contador de itens no topo do catálogo
            const txtContador = document.getElementById("contadorProdutosCatalogo");
            if (txtContador) txtContador.textContent = produtos.length;

            // 🔄 ESTRATÉGIA COBOL/JAVA: Agrupa os registros pelo NOME da Categoria (Geladeira, Chuveiro...)
            const agrupado = {};
            produtos.forEach(p => {
                const chave = p.nome.trim();
                if (!agrupado[chave]) agrupado[chave] = [];
                agrupado[chave].push(p);
            });

            // 🔤 Ordenação Alfabética perfeita da Mesa de Negociação
            const chavesOrdenadas = Object.keys(agrupado).sort((a, b) => a.localeCompare(b));

            // Constrói a árvore genealógica na tela
            chavesOrdenadas.forEach(nomeProduto => {
                const divGrupo = document.createElement("div");
                divGrupo.style.marginBottom = "8px";

                // O Pai (A Categoria)
                const btnPai = document.createElement("button");
                btnPai.className = "Cliente-header";
                btnPai.innerHTML = `📁 <strong>${nomeProduto}</strong> (${agrupado[nomeProduto].length})`;

                // O bloco dos Filhos (As Marcas) - Começa colapsado/fechado
                const divFilhos = document.createElement("div");
                divFilhos.className = "produtos-lista";
                divFilhos.style.display = "none";

                // Efeito Abre/Fecha ao clicar na pasta pai
                btnPai.addEventListener("click", () => {
                    divFilhos.style.display = divFilhos.style.display === "none" ? "block" : "none";
                });

                // Varre os filhos expondo os custos e margens de lucro para barganha
                agrupado[nomeProduto].forEach(prod => {
                    const itemFilho = document.createElement("div");
                    itemFilho.className = "produto-item";

                    const marca = prod.Cliente ? prod.Cliente.nome : "Sem Marca";
                    const precoVendaShow = prod.precoVenda || 0;
                    const precoCustoShow = prod.precoCusto || 0;
                    const margem = precoCustoShow > 0 ? (((precoVendaShow - precoCustoShow) / precoCustoShow) * 100).toFixed(0) : "0";

                    // 🏷️ Corrigido o caractere corrompido do emoji
                    itemFilho.innerHTML = `
                        <div class="w-100 d-flex justify-content-between">
                            <span>🏷️ Marca: <strong>${marca}</strong></span>
                            <span class="badge bg-success">R$ ${precoVendaShow.toFixed(2)}</span>
                        </div>
                        <div style="font-size: 11px; color: #bdc3c7; margin-top: 2px;">
                            Custo: R$ ${precoCustoShow.toFixed(2)} | <strong style="color: #ff9800;">Margem: ${margem}%</strong>
                        </div>
                    `;

                    // Clique na marca seleciona o produto na Mesa de Negociação
                    itemFilho.addEventListener("click", () => {
                        document.querySelectorAll(".produto-item").forEach(r => r.classList.remove("selecionado"));
                        itemFilho.classList.add("selecionado");

                        // 🧠 RECONHECIMENTO DA IH: Atualiza o rodapé e acende o botão Mover
                        const txtTitulo = document.getElementById("textoSelecionadoTitulo");
                        const txtDetalhes = document.getElementById("textoSelecionadoDetalhes");
                        if (txtTitulo) txtTitulo.innerHTML = `📦 ${nomeProduto}`;
                        if (txtDetalhes) txtDetalhes.innerHTML = `Marca: ${marca} | Preço Balcão: R$ ${precoVendaShow.toFixed(2)}`;

                        // Captura e injeta os metadados diretamente no botão Mover
                        const btnMover = document.getElementById("btnMoverParaCupom");
                        if (btnMover) {
                            btnMover.style.display = "inline-block";
                            btnMover.dataset.id = prod.id;
                            btnMover.dataset.nome = `${nomeProduto} (${marca})`;
                            btnMover.dataset.precovenda = precoVendaShow;
                            btnMover.dataset.precocusto = precoCustoShow;
                        }

                        // Joga o foco na caixa de quantidade para o jogo rápido
                        const inputQtd = document.getElementById("inputQuantidade");
                        if (inputQtd) inputQtd.focus();
                    });

                    divFilhos.appendChild(itemFilho);
                });

                divGrupo.appendChild(btnPai);
                divGrupo.appendChild(divFilhos);
                container.appendChild(divGrupo);
            });
        }
    } catch (e) {
        console.error("Erro na carga da árvore modular:", e);
    }
}

// ⚡ O DISPARADOR DO MOTOR DO BALCÃO: Aciona a transferência para o cupom da direita
function acionarMoverProduto() {
    const btnMover = document.getElementById("btnMoverParaCupom");

    // 🛡️ BLINDAGEM: Evita que o código quebre se o botão for acionado sem produto selecionado
    if (!btnMover || !btnMover.dataset.id) {
        alert("Atenção, piá! Selecione um produto na árvore antes de mover.");
        return;
    }

    // Resgata os dados que o clique da árvore injetou no botão
    const id = btnMover.dataset.id;
    const nome = btnMover.dataset.nome;
    const precoVenda = parseFloat(btnMover.dataset.precovenda) || 0;
    const precoCusto = parseFloat(btnMover.dataset.precocusto) || 0;

    // Captura a quantidade digitada pelo operador na barra de localização
    const quantidade = parseFloat(document.getElementById("inputQuantidade").value) || 1;

    if (quantidade <= 0) {
        alert("Atenção, piá! A quantidade de lançamento deve ser maior que zero.");
        return;
    }

    // 📦 Invoca o módulo do cupom passando o pacote estruturado
    if (typeof adicionarProdutoAoCupom === "function") {
        adicionarProdutoAoCupom(id, nome, quantidade, precoVenda, precoCusto);

        // Reseta a tela para o próximo lançamento (Jogo Rápido!)
        document.getElementById("inputQuantidade").value = "1";

        const txtTitulo = document.getElementById("textoSelecionadoTitulo");
        const txtDetalhes = document.getElementById("textoSelecionadoDetalhes");
        if (txtTitulo) txtTitulo.innerText = "Nenhum produto selecionado";
        if (txtDetalhes) txtDetalhes.innerText = "Clique em um item da árvore para iniciar o lançamento.";

        btnMover.style.display = "none";
        // Limpa os metadados antigos para o próximo clique vir limpo
        delete btnMover.dataset.id;

        document.querySelectorAll(".produto-item").forEach(r => r.classList.remove("selecionative", "selecionado"));
    } else {
        console.error("Erro: A função adicionarProdutoAoCupom() não foi declarada no módulo do cupom.");
    }
}