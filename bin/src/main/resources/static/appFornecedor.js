const API_URL = "http://localhost:8080";
let ClienteSelecionadoId = null;

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
    const enderecoInput = document.getElementById("endereco");
    const btnSalvar = document.getElementById("btnSalvar");
    const formContainer = document.getElementById("formCliente");
    
    if (nomeInput) nomeInput.disabled = status;
    if (enderecoInput) enderecoInput.disabled = status;
    if (btnSalvar) btnSalvar.disabled = status;
    if (formContainer) {
        formContainer.style.opacity = status ? "0.5" : "1";
    }
}

function acionarIncluir() {
    ClienteSelecionadoId = null;
    const form = document.getElementById("formCliente");
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
        const response = await fetch("/Clientes", {
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
            throw new Error("Erro ao buscar Clientes");
        }

        const Clientes = await response.json();
        renderizarTabelaClientes(Clientes); // 🌟 Agora ela existe!
        
    } catch (error) {
        console.error("Erro no processamento:", error);
    }
}

// 🌟 NOVA FUNÇÃO: Desenha as linhas no HTML e ativa a seleção do clique
function renderizarTabelaClientes(Clientes) {
    const tbody = document.getElementById("tabelaClientes");
    if (!tbody) return;
    
    tbody.innerHTML = ""; // Limpa a tabela

    if (Clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Nenhum Cliente cadastrado.</td></tr>`;
        return;
    }

    Clientes.forEach(forn => {
        const tr = document.createElement("tr");
        
        // Guarda os dados na linha para a função Alterar ler depois
        tr.dataset.id = forn.id;
        tr.dataset.nome = forn.nome;
        tr.dataset.endereco = forn.endereco || "";

        tr.innerHTML = `
            <td>${forn.id}</td>
            <td>${forn.nome}</td>
            <td>${forn.endereco || "Não informado"}</td>
        `;

        // 🔥 MOTOR DE SELEÇÃO: Ao clicar na linha, marca ela e guarda o ID
        tr.addEventListener("click", () => {
            document.querySelectorAll("#tabelaClientes tr").forEach(r => r.classList.remove("selecionado"));
            tr.classList.add("selecionado");
            ClienteSelecionadoId = forn.id;
        });

        tbody.appendChild(tr);
    });
}

async function cadastrarCliente(event) {
    if (event) event.preventDefault();
    
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    const nomeForn = document.getElementById("nome").value;
    const enderecoForn = document.getElementById("endereco").value;
    const ClienteDados = { nome: nomeForn, endereco: enderecoForn };

    const url = ClienteSelecionadoId ? `${API_URL}/Clientes/${ClienteSelecionadoId}` : `${API_URL}/Clientes`;
    const metodo = ClienteSelecionadoId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenPuro}` // 🌟 Corrigido com tokenPuro
            },
            body: JSON.stringify(ClienteDados)
        });

        if (response.ok) {
            alert(ClienteSelecionadoId ? "Cliente alterado com sucesso!" : "Cliente cadastrado com sucesso!");
            acionarIncluir(); 
            carregarClientes();
        } else {
            alert("Erro ao salvar Cliente.");
        }
    } catch (e) {
        console.error(e);
    }
}

function acionarAlterar() {
    if (!ClienteSelecionadoId) {
        alert("Por favor, clique em um Cliente na tabela primeiro para selecioná-lo!");
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

async function acionarExcluir() {
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    if (!ClienteSelecionadoId) {
        alert("Por favor, clique em um Cliente na tabela primeiro para selecioná-lo!");
        return;
    }
    if (confirm("Tem certeza que deseja excluir o Cliente selecionado?")) {
        try {
            const response = await fetch(`${API_URL}/Clientes/${ClienteSelecionadoId}`, {
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
                alert("Erro ao excluir Cliente.");
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