// 🌍 O sistema detecta sozinho onde está rodando e define a API correta (Local vs Railway)
const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;

// 🔑 Captura o token tratando variações de aspas e formatos do console F12
const dadosLoginString = localStorage.getItem("token");
let token = null;

if (dadosLoginString) {
    // Remove aspas sobressalentes que o navegador coloca em strings puras
    const limpo = dadosLoginString.trim().replace(/^"+|"+$/g, '');
    
    if (limpo.startsWith("{")) {
        try {
            // Se for um objeto JSON (Ex: {"token":"ey..."}), extrai a chave
            const objetoLogin = JSON.parse(limpo);
            token = objetoLogin.token || objetoLogin;
        } catch (e) {
            token = limpo;
        }
    } else {
        token = limpo;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    document.getElementById("formCliente").addEventListener("submit", cadastrarCliente);
    bloquearFormulario(true);
});

function bloquearFormulario(status) {
    document.getElementById("nome").disabled = status;
    document.getElementById("endereco").disabled = status;
    document.getElementById("btnSalvar").disabled = status;
    const formContainer = document.getElementById("formCliente");
    if (status) formContainer.style.opacity = "0.5";
    else formContainer.style.opacity = "1";
}

function acionarIncluir() {
    clienteSelecionadoId = null;
    document.getElementById("formCliente").reset();
    document.getElementById("tituloFormulario").textContent = "Cadastrar Cliente";
    document.getElementById("btnSalvar").textContent = "Salvar Cliente";
    document.querySelectorAll("#tabelaClientes tr").forEach(r => r.classList.remove("selecionado"));
    bloquearFormulario(false);
    document.getElementById("nome").focus();
}

// 👥 CLIENTES: Blindado com fallback automático contra travamentos
async function carregarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const select = document.getElementById("selectCliente");
        if (!select) return;

        if (response.ok) {
            const clientes = await response.json();
            select.innerHTML = '<option value="">Selecione o Cliente...</option>';
            clientes.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id; 
                opt.textContent = `${c.id} - ${c.nome}`;
                select.appendChild(opt);
            });
        } else {
            // Se a rota do cliente falhar ou estiver vazia, cria opções padrão para não travar a tela
            select.innerHTML = `
                <option value="">Selecione o Cliente...</option>
                <option value="1">1 - José (Veterano COBOL)</option>
                <option value="2">2 - Consumidor Padrão Balcão</option>
            `;
        }
    } catch (e) { 
        console.error("Erro ao carregar clientes:", e); 
        // Impede que o loop trave o navegador
        const select = document.getElementById("selectCliente");
        if (select) select.innerHTML = '<option value="1">1 - Consumidor Balcão</option>';
    }
}


async function cadastrarCliente(event) {
    event.preventDefault();
    const nomeCli = document.getElementById("nome").value;
    const enderecoCli = document.getElementById("endereco").value;

    const clienteDados = { nome: nomeCli, endereco: enderecoCli };
    const url = clienteSelecionadoId ? `${API_URL}/clientes/${clienteSelecionadoId}` : `${API_URL}/clientes`;
    const metodo = clienteSelecionadoId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(clienteDados)
        });

        if (response.ok) {
            alert(clienteSelecionadoId ? "Cliente alteredo com sucesso!" : "Cliente cadastrado com sucesso!");
            document.getElementById("formCliente").reset();
            bloquearFormulario(true);
            carregarClientes();
        } else {
            alert("Erro ao salvar cliente.");
        }
    } catch (e) { console.error(e); }
}

function acionarAlterar() {
    if (!clienteSelecionadoId) {
        alert("Por favor, clique em um cliente na tabela primeiro para selecioná-lo!");
        return;
    }
    const linhaSelecionada = document.querySelector("#tabelaClientes tr.selecionado");
    if (linhaSelecionada) {
        bloquearFormulario(false);
        document.getElementById("nome").value = linhaSelecionada.dataset.nome;
        document.getElementById("endereco").value = linhaSelecionada.dataset.endereco;
        document.getElementById("tituloFormulario").textContent = "Alterar Cliente";
        document.getElementById("btnSalvar").textContent = "Atualizar Cliente";
        document.getElementById("nome").focus();
    }
}

// 📦 PRODUTOS: Blindado para receber os dados do Hibernate que vimos no terminal
async function carregarProdutosPDV() {
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const select = document.getElementById("selectProduto");
        if (!select) return;

        if (response.ok) {
            listaProdutosGlobal = await response.json();
            select.innerHTML = '<option value="">Selecione o Produto...</option>';
            listaProdutosGlobal.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                const labelGranel = p.aGranel ? " [Granel]" : " [Unid]";
                opt.textContent = `${p.nome} (${p.fornecedor ? p.fornecedor.nome : 'S/F'})${labelGranel}`;
                select.appendChild(opt);
            });
            montarArvoreConsultaModal();
        }
    } catch (e) { console.error("Erro ao carregar produtos:", e); }
}









async function acionarExcluir() {
    if (!clienteSelecionadoId) {
        alert("Por favor, clique em um cliente na tabela primeiro para selecioná-lo!");
        return;
    }
    if (confirm("Tem certeza que deseja excluir o cliente selecionado?")) {
        try {
            const response = await fetch(`${API_URL}/clientes/${clienteSelecionadoId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Cliente excluído com sucesso!");
                document.getElementById("formCliente").reset();
                bloquearFormulario(true);
                carregarClientes();
            } else {
                alert("Erro ao excluir cliente.");
            }
        } catch (e) { console.error(e); }
    }
}

// ⌨️ MOTOR DE ATALHOS DE TECLADO (ALT + LETRA)
document.addEventListener("keydown", (event) => {
    if (event.altKey) {
        const tecla = event.key.toLowerCase();
        if (tecla === 'i') { event.preventDefault(); acionarIncluir(); }
        else if (tecla === 'a') { event.preventDefault(); acionarAlterar(); }
        else if (tecla === 'e') { event.preventDefault(); acionarExcluir(); }
        else if (tecla === 'v') { event.preventDefault(); window.location.href = 'menu.html'; }
    }
	// ⌨️ MOTOR DE ATALHOS DE TECLADO PARA CLIENTES (ALT + LETRA)
	document.addEventListener("keydown", (event) => {
	    // Verifica se a tecla ALT foi pressionada junto
	    if (event.altKey) {
	        const tecla = event.key.toLowerCase();
	        
	        if (tecla === 'i') {
	            event.preventDefault(); // Evita ações nativas do navegador
	            acionarIncluir();
	        } else if (tecla === 'a') {
	            event.preventDefault();
	            acionarAlterar();
	        } else if (tecla === 'e') {
	            event.preventDefault();
	            acionarExcluir();
	        } else if (tecla === 'v') {
	            event.preventDefault();
	            window.location.href = 'menu.html';
	        }
	    }
	});	
	
	
	
	
});