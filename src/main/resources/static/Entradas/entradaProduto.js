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

    if (!numeroNota || !chaveAcesso || !dataRecebimento || !fornecedorId || itensNota.length === 0) {
        alert("⚠️ Erro de Validação:\nPor favor, preencha o cabeçalho da nota e insira pelo menos um item no grid.");
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
	        // 🚀 CORREÇÃO 1: Rota limpa, saindo direto da raiz para a API do Java!
	        const response = await fetch('/api/entradas', {
	            method: 'POST',
	            headers: montarHeaders(),
	            body: JSON.stringify(payloadFiscal)
	        });

	        if (response.ok) {
	            alert('✅ Sucesso Total!\nNota Fiscal gravada e estoque incrementado no banco local.');
	            // 🚀 CORREÇÃO 2: Aponta para a pasta nova do seu menu corrigido!
	            window.location.href = '/menu/menu.html';
	        } else {
	            const textoErro = await response.text();
	            alert('❌ O Servidor Java recusou o registro:\n' + textoErro);
	        }
    } catch (error) {
        console.error('Erro de conexão física:', error);
        alert('❌ Erro de Rede: Verifique se o seu servidor Spring Boot local não caiu.');
    }
    // 💡 REMOVIDO: O redirecionamento solto que estava aqui no final foi apagado 
    // para que a tela não mude caso ocorra um erro de validação ou de rede.
}








