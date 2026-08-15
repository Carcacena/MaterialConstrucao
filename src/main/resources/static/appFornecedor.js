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
    carregarFornecedores();
    const form = document.getElementById("formFornecedor");
    if (form) {
        form.addEventListener("submit", cadastrarFornecedor);
    }
    bloquearFormulario(true);
});

function bloquearFormulario(status) {
    const nomeInput = document.getElementById("nome");
    const enderecoInput = document.getElementById("endereco");
    const btnSalvar = document.getElementById("btnSalvar");
    const formContainer = document.getElementById("formFornecedor");
    
    if (nomeInput) nomeInput.disabled = status;
    if (enderecoInput) enderecoInput.disabled = status;
    if (btnSalvar) btnSalvar.disabled = status;
    if (formContainer) {
        formContainer.style.opacity = status ? "0.5" : "1";
    }
}

function acionarIncluir() {
    fornecedorSelecionadoId = null;
    const form = document.getElementById("formFornecedor");
    if (form) form.reset();
    document.getElementById("tituloFormulario").textContent = "Cadastrar Fornecedor";
    document.getElementById("btnSalvar").textContent = "Salvar Fornecedor";
    document.querySelectorAll("#tabelaFornecedores tr").forEach(r => r.classList.remove("selecionado"));
    bloquearFormulario(false);
    const nomeInput = document.getElementById("nome");
    if (nomeInput) nomeInput.focus();
}

async function carregarFornecedores() {
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    try {
        const response = await fetch("/fornecedores", {
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
            throw new Error("Erro ao buscar fornecedores");
        }

        const fornecedores = await response.json();
        renderizarTabelaFornecedores(fornecedores); // 🌟 Agora ela existe!
        
    } catch (error) {
        console.error("Erro no processamento:", error);
    }
}

// 🌟 NOVA FUNÇÃO: Desenha as linhas no HTML e ativa a seleção do clique
function renderizarTabelaFornecedores(fornecedores) {

    const tbody = document.getElementById("tabelaFornecedores");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (fornecedores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center;">
                    Nenhum fornecedor cadastrado.
                </td>
            </tr>
        `;
        return;
    }

    fornecedores.forEach(forn => {

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
                .querySelectorAll("#tabelaFornecedores tr")
                .forEach(r => r.classList.remove("selecionado"));

            tr.classList.add("selecionado");

            fornecedorSelecionadoId = forn.id;
        });

        tbody.appendChild(tr);
    });
}
async function cadastrarFornecedor(event) { 
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
    const SamplefornecedorDados = {
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

    const url = fornecedorSelecionadoId ? `${API_URL}/fornecedores/${fornecedorSelecionadoId}` : `${API_URL}/fornecedores`; 
    const metodo = fornecedorSelecionadoId ? "PUT" : "POST"; 

    try { 
        const response = await fetch(url, { 
            method: metodo, 
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${tokenPuro}` 
            }, 
            body: JSON.stringify(SamplefornecedorDados) // ✨ Enviando o objeto correto
        }); 

        if (response.ok) { 
            alert(fornecedorSelecionadoId ? "Fornecedor alterado com sucesso!" : "Fornecedor cadastrado com sucesso!"); 
            acionarIncluir(); 
            carregarFornecedores(); 
        } else { 
            alert("Erro ao salvar fornecedor."); 
        } 
    } catch (e) { 
        console.error("Erro na requisição:", e); 
    } 
}
function acionarAlterar() {
    if (!fornecedorSelecionadoId) {
        alert("Por favor, clique em um fornecedor na tabela primeiro para selecioná-lo!");
        return;
    }
    const linhaSelecionada = document.querySelector("#tabelaFornecedores tr.selecionado");
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
	        "Alterar Fornecedor";

	    document.getElementById("btnSalvar").textContent =
	        "Atualizar Fornecedor";

	    document.getElementById("nome").focus();
	}
}
async function acionarExcluir() {
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    if (!fornecedorSelecionadoId) {
        alert("Por favor, clique em um fornecedor na tabela primeiro para selecioná-lo!");
        return;
    }
    if (confirm("Tem certeza que deseja excluir o fornecedor selecionado?")) {
        try {
            const response = await fetch(`${API_URL}/fornecedores/${fornecedorSelecionadoId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${tokenPuro}` // 🌟 Corrigido com tokenPuro
                }
            });
            if (response.ok) {
                alert("Fornecedor excluído com sucesso!");
                acionarIncluir(); 
                carregarFornecedores();
            } else {
                alert("Erro ao excluir fornecedor.");
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
