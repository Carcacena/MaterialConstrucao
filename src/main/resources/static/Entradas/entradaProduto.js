// 🌟 Carrega os fornecedores do banco assim que a página abre
async function carregarFornecedores() {
    const selectFornecedor = document.getElementById('fornecedorId');
    selectFornecedor.innerHTML = '<option value="">Carregando fornecedores...</option>';

    try {
        const response = await fetch('/api/fornecedores', {
            method: 'GET',
            headers: montarHeaders()
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar fornecedores: ' + response.status);
        }

        const fornecedores = await response.json();

        selectFornecedor.innerHTML = '<option value="">Selecione o Fornecedor...</option>';
        fornecedores.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = `${f.nome} (ID: ${f.id})`;
            selectFornecedor.appendChild(opt);
        });

    } catch (erro) {
        console.error('Erro ao carregar fornecedores:', erro);
        selectFornecedor.innerHTML = '<option value="">Erro ao carregar fornecedores</option>';
    }
}

// 🌟 Dispara assim que a página termina de carregar
carregarFornecedores();


async function carregarProdutosPorFornecedor() {
    const fornecedorId = document.getElementById('fornecedorId').value;
    const selectProduto = document.getElementById('selectProduto');

    if (!fornecedorId) {
        selectProduto.innerHTML = '<option value="">Selecione o Fornecedor primeiro...</option>';
        return;
    }

    selectProduto.innerHTML = '<option value="">Carregando produtos...</option>';

    try {
        const response = await fetch('/produtos', {
            method: 'GET',
            headers: montarHeaders()
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar produtos: ' + response.status);
        }

        const todosProdutos = await response.json();

        const produtosFiltrados = todosProdutos.filter(p =>
            p.fornecedor && Number(p.fornecedor.id) === Number(fornecedorId)
        );

        if (produtosFiltrados.length === 0) {
            selectProduto.innerHTML = '<option value="">Nenhum produto cadastrado para este fornecedor</option>';
            return;
        }

        selectProduto.innerHTML = '<option value="">Escolha o Produto...</option>';
        produtosFiltrados.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nome} (ID: ${p.id})`;
            selectProduto.appendChild(opt);
        });

    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        selectProduto.innerHTML = '<option value="">Erro ao carregar produtos</option>';
    }
}

async function salvarEntrada() {

    const elNota = document.getElementById('numeroNota');
    const elSerie = document.getElementById('serie');
    const elChave = document.getElementById('chaveAcesso');
    const elData = document.getElementById('dataRecebimento');
    const elForn = document.getElementById('fornecedorId');

    if (!elNota || !elSerie || !elChave || !elData || !elForn) {
        alert("❌ Erro interno: Elementos do formulário HTML não foram encontrados.");
        return;
    }

    const numeroNota = elNota.value;
    const serie = elSerie.value;
    const chaveAcesso = elChave.value;
    const dataRecebimento = elData.value;
    const fornecedorId = elForn.value;

    if (!numeroNota || !chaveAcesso || !dataRecebimento ||
        !fornecedorId || itensNota.length === 0) {

        alert(
            "⚠️ Erro de Validação:\n" +
            "Por favor, preencha o cabeçalho da nota e insira pelo menos um item no grid."
        );
        return;
    }

    const payloadFiscal = {
        numeroNota: numeroNota,
        serie: serie,
        chaveAcesso: chaveAcesso,
        dataRecebimento: dataRecebimento,
        fornecedorId: parseInt(fornecedorId),
        itens: itensNota
    };

    try {

        // 1. GRAVA A ENTRADA E OS ITENS
        const response = await fetch('/api/entradas', {
            method: 'POST',
            headers: montarHeaders(),
            body: JSON.stringify(payloadFiscal)
        });

        if (!response.ok) {
            const textoErro = await response.text();

            alert(
                '❌ O Servidor Java recusou o registro:\n' +
                textoErro
            );
            return;
        }

        // 2. PEGA A ENTRADA QUE O JAVA ACABOU DE GRAVAR
        const entradaSalva = await response.json();

        if (!entradaSalva || !entradaSalva.id) {
            throw new Error(
                "A entrada foi gravada, mas o servidor não retornou o ID."
            );
        }

        console.log("Entrada gravada. ID:", entradaSalva.id);

        // 3. GARANTE QUE O TOTAL DA NOTA ESTÁ ATUALIZADO
        calcularTotalNota();

        const pegarValor = (id) => {
            const campo = document.getElementById(id);
            return campo ? (parseFloat(campo.value) || 0) : 0;
        };

        // 4. MONTA EXATAMENTE O EntradaImpostosDTO
        const impostos = {
            baseCalculoIcms: pegarValor("baseCalculoIcms"),
            valorIcms: pegarValor("valorIcms"),
            baseCalculoIcmsSt: pegarValor("baseCalculoIcmsSt"),
            valorIcmsSt: pegarValor("valorIcmsSt"),
            valorTotalProdutos: pegarValor("valorTotalProdutos"),
            valorFrete: pegarValor("valorFrete"),
            valorSeguro: pegarValor("valorSeguro"),
            valorDesconto: pegarValor("valorDesconto"),
            outrasDespesasAcessorias: pegarValor("outrasDespesasAcessorias"),
            valorIpi: pegarValor("valorIpi"),
            valorTotalNota: pegarValor("valorTotalNota")
        };

        console.log("Impostos enviados:", impostos);

        // 5. GRAVA OS IMPOSTOS LIGADOS À ENTRADA CRIADA
        const responseImpostos = await fetch(
            `/api/entradas/${entradaSalva.id}/impostos`,
            {
                method: 'POST',
                headers: montarHeaders(),
                body: JSON.stringify(impostos)
            }
        );

        if (!responseImpostos.ok) {
            const erroImpostos = await responseImpostos.text();

            alert(
                "⚠️ A Nota Fiscal foi gravada, mas houve erro ao gravar os impostos:\n" +
                erroImpostos
            );
            return;
        }

        // 6. SOMENTE AGORA ENCERRA A OPERAÇÃO
        alert(
            '✅ Sucesso Total!\n' +
            'Nota Fiscal, estoque e impostos gravados no banco local.'
        );

        window.location.href = '/menu/menu.html';

    } catch (error) {

        console.error('Erro ao gravar a entrada:', error);

        alert(
            '❌ Erro ao processar a entrada:\n' +
            error.message
        );
    }
}

// CONTROLE DO MENU: Abre ou fecha ao clicar
function alternarMenuSuspenso() {
    const menu = document.getElementById("menuSuspensoAcoes");
    menu.style.display = (menu.style.display === "none" || menu.style.display === "") ? "block" : "none";
}

function fecharMenuSuspenso() {
    document.getElementById("menuSuspensoAcoes").style.display = "none";
}

// Fecha se clicar fora dele
window.addEventListener("click", function(event) {
    const menu = document.getElementById("menuSuspensoAcoes");
    if (!event.target.closest('.btn-salvar') && menu && menu.style.display === "block") {
        fecharMenuSuspenso();
    }
});

// AÇÃO 1: Limpa completamente a tela (Cancelar)
function limparTelaEntradaCompleta() {
    if (confirm("Deseja realmente limpar todos os campos digitados?")) {
        document.getElementById("numeroNota").value = "";
        document.getElementById("serie").value = "";
        document.getElementById("chaveAcesso").value = "";
        document.getElementById("fornecedorId").value = "";
        document.getElementById('dataRecebimento').valueAsDate = new Date();
        document.getElementById("selectProduto").innerHTML = '<option value="">Selecione o Fornecedor primeiro...</option>';
        document.getElementById("qtdEntrada").value = "1";
        document.getElementById("precoCusto").value = "";

        // Limpa os campos ocultos do quadro de impostos
        const camposImpostos = ["baseCalculoIcms", "valorIcms", "baseCalculoIcmsSt", "valorIcmsSt", "valorTotalProdutos", "valorFrete", "valorSeguro", "valorDesconto", "outrasDespesasAcessorias", "valorIpi", "valorTotalNota"];
        camposImpostos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.value = "";
        });

        // Limpa o grid de itens
        itensNota = [];
        const tbody = document.getElementById("tabelaItens").querySelector("tbody");
        if (tbody) tbody.innerHTML = "";
        
        alert("Tela limpa com sucesso!");
    }
}

// AÇÃO 2: Dispara a devolução lógica (Muda para Status 2 e retira do estoque)
async function dispararDevolucaoEntradaPorNumero() {
    const numeroNotaParaEstornar = prompt("Digite o NÚMERO exato da Nota Fiscal que deseja DEVOLVER:");
    if (!numeroNotaParaEstornar) return;
	 const prosseguir = confirm(`⚠️ ALERTA DE ESTORNO DE ESTOQUE:\n\nEsta ação localizará a Nota nº ${numeroNotaParaEstornar} no MySQL, SUBTRAIRÁ as quantidades do estoque e mudará o status da nota para DEVOLVIDO (Status 2).\n\nDeseja continuar?`);
    
    if (prosseguir) {
        try {
            // Usa a sua função nativa de cabeçalhos com token JWT
            const headersSeguros = montarHeaders();

			// ⚡ CORREÇÃO DO FETCH: Adicione a barra '/' antes de 'api/'
			const response = await fetch(
			    `/api/entradas/devolver-nota/${numeroNotaParaEstornar}`,
			    {
			        method: "PUT",
			        headers: headersSeguros
			    }
			);   if (!response.ok) {
                const erroTexto = await response.text();
                throw new Error(erroTexto || "Ocorreu um erro no processamento do Java.");
            }

            alert(`✅ Sucesso! A nota ${numeroNotaParaEstornar} agora está como DEVOLVIDA (Status 2) e o estoque foi corrigido.`);
            location.reload(); // Recarrega a página limpa

        } catch (erro) {
            console.error("Erro no estorno:", erro);
            alert("❌ Falha na Devolução: " + erro.message);
        }
    }
}




