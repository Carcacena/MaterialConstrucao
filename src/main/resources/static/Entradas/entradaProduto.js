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






