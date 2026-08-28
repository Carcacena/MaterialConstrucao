// 🌟 Carrega os Clientes do banco assim que a página abre
async function carregarClientes() {
    const selectCliente = document.getElementById('ClienteId');
    selectCliente.innerHTML = '<option value="">Carregando Clientes...</option>';

    try {
        const response = await fetch('/Clientes', {
            method: 'GET',
            headers: montarHeaders()
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar Clientes: ' + response.status);
        }

        const Clientes = await response.json();

        selectCliente.innerHTML = '<option value="">Selecione o Cliente...</option>';
        Clientes.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = `${f.nome} (ID: ${f.id})`;
            selectCliente.appendChild(opt);
        });

    } catch (erro) {
        console.error('Erro ao carregar Clientes:', erro);
        selectCliente.innerHTML = '<option value="">Erro ao carregar Clientes</option>';
    }
}

// 🌟 Dispara assim que a página termina de carregar
carregarClientes();


async function carregarProdutosPorCliente() {
    const ClienteId = document.getElementById('ClienteId').value;
    const selectProduto = document.getElementById('selectProduto');

    if (!ClienteId) {
        selectProduto.innerHTML = '<option value="">Selecione o Cliente primeiro...</option>';
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
            p.Cliente && Number(p.Cliente.id) === Number(ClienteId)
        );

        if (produtosFiltrados.length === 0) {
            selectProduto.innerHTML = '<option value="">Nenhum produto cadastrado para este Cliente</option>';
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
    const elForn = document.getElementById('ClienteId');

    if (!elNota || !elSerie || !elChave || !elData || !elForn) {
        alert("❌ Erro interno: Elementos do formulário HTML não foram encontrados.");
        return;
    }

    const numeroNota = elNota.value;
    const serie = elSerie.value;
    const chaveAcesso = elChave.value;
    const dataRecebimento = elData.value;
    const ClienteId = elForn.value;

    if (!numeroNota || !chaveAcesso || !dataRecebimento || !ClienteId || itensNota.length === 0) {
        alert("⚠️ Erro de Validação:\nPor favor, preencha o cabeçalho da nota e insira pelo menos um item no grid.");
        return;
    }

    const payloadFiscal = {
        numeroNota: numeroNota,
        serie: serie,
        chaveAcesso: chaveAcesso,
        dataRecebimento: dataRecebimento,
        ClienteId: parseInt(ClienteId),
        itens: itensNota
    };

    try {
        const response = await fetch('/api/entradas', {
            method: 'POST',
            headers: montarHeaders(),
            body: JSON.stringify(payloadFiscal)
        });

        if (response.ok) {
            alert('✅ Sucesso Total!\nNota Fiscal gravada e estoque incrementado no banco local.');
            // ⚡ CORREÇÃO: Adicionada a barra inicial '/' para evitar o erro 404
            window.location.href = '/menu.html';
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









