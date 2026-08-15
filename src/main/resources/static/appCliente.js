const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : window.location.origin;
// Helper para pegar o token limpo do LocalStorage em qualquer função

function obterTokenPuro() {
    const dadosUsuarioBrutos = localStorage.getItem("token");
    if (!dadosUsuarioBrutos) {
        window.location.href = "login.html";
        return null;
    }
    try {
        const dadosUsuario = JSON.parse(dadosUsuarioBrutos);
        return dadosUsuario.token; // 🔑 Retorna puramente o texto "ey..." do JWT
    } catch (e) {
        console.error("Erro ao ler token do localStorage:", e);
        window.location.href = "login.html";
        return null;
    }
}

// Redireciona logo de cara se não houver dados no LocalStorage
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    const form = document.getElementById("formCliente");
    if (form) {
        form.addEventListener("submit", cadastrarCliente);
    }
    bloquearFormulario(true);
});

function bloquearFormulario(status) {
    const nomeInput = document.getElementById("nome");
  //  const enderecoInput = document.getElementById("endereco");
    const btnSalvar = document.getElementById("btnSalvar");
    const formContainer = document.getElementById("formCliente");
    
    if (nomeInput) nomeInput.disabled = status;
   // if (enderecoInput) enderecoInput.disabled = status;
    if (btnSalvar) btnSalvar.disabled = status;
    if (formContainer) {
        formContainer.style.opacity = status ? "0.5" : "1";
    }
}

function acionarIncluir() {
    clienteSelecionadoId = null;
    const form = document.getElementById("cliente");
    if (form) form.reset();
    document.getElementById("tituloFormulario").textContent = "Cadastrar Cliente";
    document.getElementById("btnSalvar").textContent = "Salvar Cliente";
    document.querySelectorAll("#tabelaClientes tr").forEach(r => r.classList.remove("selecionado"));
    bloquearFormulario(false);
    const nomeInput = document.getElementById("nome");
    if (nomeInput) nomeInput.focus();
}

async function carregarClientes() {
	 const tokenPuro = obterTokenPuro();
	    if (!tokenPuro) return;

	    try {
	        const response = await fetch("/clientes", {
	            method: "GET",
	            headers: {
	                "Authorization": `Bearer ${tokenPuro}`,
	                "Content-Type": "application/json"
	            }
	        });

	        if (response.status === 401 || response.status === 403) {
	            alert("Sessão expirada. Por favor, faça login novamente, piá!");
	            window.location.href = "login.html";
	            return;
	        }

	        if (!response.ok) {
	            throw new Error("Erro ao buscar clientes");
	        }

	        const clientes = await response.json();
	        renderizarTabelaClientes(clientes); // 🌟 Agora ela existe!
	        
	    } catch (error) {
	        console.error("Erro no processamento:", error);
	    }
	}

// 🌟 NOVA FUNÇÃO: Desenha as linhas no HTML e ativa a seleção do clique
function renderizarTabelaClientes(clientes) {

    const tbody = document.getElementById("tabelaClientes");
	    if (!tbody) return;

	    tbody.innerHTML = "";

	    if (clientes.length === 0) {
	        tbody.innerHTML = `
	            <tr>
	                <td colspan="11" style="text-align:center;">
	                    Nenhum cliente cadastrado.
	                </td>
	            </tr>
	        `;
	        return;
	    }

	    clientes.forEach(forn => {

	        const tr = document.createElement("tr");

	        // Guarda os dados para Alterar
	        tr.dataset.id = forn.id;
	        tr.dataset.nome = forn.nome;
	        tr.dataset.cnpj = forn.cnpj || "";
	        tr.dataset.telefone = forn.telefone || "";
	        tr.dataset.email = forn.email || "";
	        tr.dataset.cep = forn.cep || "";
	        tr.dataset.uf = forn.uf || "";
	        tr.dataset.logradouro = forn.logradouro || "";
	        tr.dataset.numero = forn.numero || "";
	        tr.dataset.bairro = forn.bairro || "";
	        tr.dataset.cidade = forn.cidade || "";

	        tr.innerHTML = `
	            <td>${forn.id}</td>
	            <td>${forn.nome || ""}</td>
	            <td>${forn.cnpj || "Não informado"}</td>
	            <td>${forn.telefone || "Não informado"}</td>
	            <td>${forn.email || "Não informado"}</td>
	            <td>${forn.cep || ""}</td>
	            <td>${forn.uf || ""}</td>
	            <td>${forn.logradouro || ""}</td>
	            <td>${forn.numero || ""}</td>
	            <td>${forn.bairro || ""}</td>
	            <td>${forn.cidade || ""}</td>
	        `;

	        tr.addEventListener("click", () => {

	            document
	                .querySelectorAll("#tabelaClientes tr")
	                .forEach(r => r.classList.remove("selecionado"));

	         
					tr.classList.add("selecionado");

					          clienteSelecionadoId = forn.id;
					      
	        });

	        tbody.appendChild(tr);
	    });
	}
async function cadastrarCliente(event) { 
    if (event) event.preventDefault(); 
    
    const tokenPuro = obterTokenPuro(); 
    if (!tokenPuro) return; 

    // Captura dos valores do HTML
    const nomeForn = document.getElementById("nome").value; 
    const cnpjForn = document.getElementById("cnpj").value; 
    const emailForn = document.getElementById("email").value; 
    const telefoneForn = document.getElementById("telefone").value; 
    const cepForn = document.getElementById("cep").value; 
    const logradouroForn = document.getElementById("logradouro").value; 
    const numeroForn = document.getElementById("numero").value; 
    const complementoForn = document.getElementById("complemento").value; 
    const bairroForn = document.getElementById("bairro").value; 
    const cidadeForn = document.getElementById("cidade").value; 
    const ufForn = document.getElementById("uf").value; 

    // ✨ CORREÇÃO: Criação do objeto com todos os dados capturados
    const SampleclienteDados = {
        nome: nomeForn,
        cnpj: cnpjForn,
        email: emailForn,
        telefone: telefoneForn,
        cep: cepForn,
        logradouro: logradouroForn,
        numero: numeroForn,
        complemento: complementoForn,
        bairro: bairroForn,
        cidade: cidadeForn,
        uf: ufForn
    };

    const url = clienteSelecionadoId ? `${API_URL}/clientes/${clienteSelecionadoId}` : `${API_URL}/clientes`; 
    const metodo = clienteSelecionadoId ? "PUT" : "POST"; 

    try { 
        const response = await fetch(url, { 
            method: metodo, 
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${tokenPuro}` 
            }, 
            body: JSON.stringify(SampleclienteDados) // ✨ Enviando o objeto correto
        }); 

        if (response.ok) { 
            alert(clienteSelecionadoId ? "Cliente alterado com sucesso!" : "Cliente cadastrado com sucesso!"); 
            acionarIncluir(); 
            carregarClientes(); 
        } else { 
            alert("Erro ao salvar cliente."); 
        } 
    } catch (e) { 
        console.error("Erro na requisição:", e); 
    } 
}
function acionarAlterar() {
    if (!clienteSelecionadoId) {
        alert("Por favor, clique em um cliente na tabela primeiro para selecioná-lo!");
        return;
    }
    const linhaSelecionada = document.querySelector("#tabelaClientes tr.selecionado");
	if (linhaSelecionada) {

	    bloquearFormulario(false);

	    document.getElementById("id").value =
	        linhaSelecionada.dataset.id || "";

	    document.getElementById("nome").value =
	        linhaSelecionada.dataset.nome || "";

	    document.getElementById("cnpj").value =
	        linhaSelecionada.dataset.cnpj || "";

	    document.getElementById("email").value =
	        linhaSelecionada.dataset.email || "";

	    document.getElementById("telefone").value =
	        linhaSelecionada.dataset.telefone || "";

	    document.getElementById("cep").value =
	        linhaSelecionada.dataset.cep || "";

	    document.getElementById("uf").value =
	        linhaSelecionada.dataset.uf || "";

	    document.getElementById("logradouro").value =
	        linhaSelecionada.dataset.logradouro || "";

	    document.getElementById("numero").value =
	        linhaSelecionada.dataset.numero || "";

	    document.getElementById("complemento").value =
	        linhaSelecionada.dataset.complemento || "";

	    document.getElementById("bairro").value =
	        linhaSelecionada.dataset.bairro || "";

	    document.getElementById("cidade").value =
	        linhaSelecionada.dataset.cidade || "";

	    document.getElementById("tituloFormulario").textContent =
	        "Alterar Cliente";

	    document.getElementById("btnSalvar").textContent =
	        "Atualizar Cliente";

	    document.getElementById("nome").focus();
	}
	
}
async function acionarExcluir() {
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    if (!clienteSelecionadoId) {
        alert("Por favor, clique em um cliente na tabela primeiro para selecioná-lo!");
        return;
    }
    if (confirm("Tem certeza que deseja excluir o cliente selecionado?")) {
        try {
            const response = await fetch(`${API_URL}/clientes/${clienteSelecionadoId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${tokenPuro}` // 🌟 Corrigido com tokenPuro
                }
            });
            if (response.ok) {
                alert("Cliente excluído com sucesso!");
                acionarIncluir(); 
                carregarClientes();
            } else {
                alert("Erro ao excluir cliente.");
            }
        } catch (e) {
            console.error(e);
        }
    }
}

// ⌨️ MOTOR DE ATALHOS DE TECLADO INTERATIVO (ALT + LETRA)
document.addEventListener("keydown", (event) => {
    if (event.altKey) {
        const tecla = event.key.toLowerCase();
        if (tecla === 'i') {
            event.preventDefault();
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