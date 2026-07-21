const API_URL = "http://localhost:8080";
const token = localStorage.getItem("token");
let fornecedorSelecionadoId = null;

if (!token) {
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

// 🎯 FUNÇÃO RENOMEADA: Agora usa acionarIncluir para casar com o HTML
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
    try {
        const response = await fetch(`${API_URL}/fornecedores`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const fornecedores = await response.json();
            const tabelaCorpo = document.getElementById("tabelaFornecedores");
            if (tabelaCorpo) {
                tabelaCorpo.innerHTML = "";
                fornecedores.forEach(forn => {
                    const tr = document.createElement("tr");
                    tr.dataset.id = forn.id;
                    tr.dataset.nome = forn.nome;
                    tr.dataset.endereco = forn.endereco;
                    
                    tr.innerHTML = `
                        <td>${forn.id}</td>
                        <td>${forn.nome}</td>
                        <td>${forn.endereco ? forn.endereco : 'Não informado'}</td>
                    `;
                    
                    tr.addEventListener("click", () => {
                        document.querySelectorAll("#tabelaFornecedores tr").forEach(r => r.classList.remove("selecionado"));
                        tr.classList.add("selecionado");
                        fornecedorSelecionadoId = forn.id;
                    });
                    tabelaCorpo.appendChild(tr);
                });
            }
        }
    } catch (e) { console.error(e); }
}

async function cadastrarFornecedor(event) {
    if (event) event.preventDefault();
    const nomeForn = document.getElementById("nome").value;
    const enderecoForn = document.getElementById("endereco").value;

    const fornecedorDados = { nome: nomeForn, endereco: enderecoForn };
    const url = fornecedorSelecionadoId ? `${API_URL}/fornecedores/${fornecedorSelecionadoId}` : `${API_URL}/fornecedores`;
    const metodo = fornecedorSelecionadoId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(fornecedorDados)
        });

        if (response.ok) {
            alert(fornecedorSelecionadoId ? "Fornecedor alterado com sucesso!" : "Fornecedor cadastrado com sucesso!");
            acionarIncluir(); // 🎯 Chama o formulário limpo e bloqueia o balcão
            carregarFornecedores();
        } else {
            alert("Erro ao salvar fornecedor.");
        }
    } catch (e) { console.error(e); }
}

function acionarAlterar() {
    if (!fornecedorSelecionadoId) {
        alert("Por favor, clique em um fornecedor na tabela primeiro para selecioná-lo!");
        return;
    }
    const linhaSelecionada = document.querySelector("#tabelaFornecedores tr.selecionado");
    if (linhaSelecionada) {
        bloquearFormulario(false);
        document.getElementById("nome").value = linhaSelecionada.dataset.nome;
        document.getElementById("endereco").value = linhaSelecionada.dataset.endereco;
        document.getElementById("tituloFormulario").textContent = "Alterar Fornecedor";
        document.getElementById("btnSalvar").textContent = "Atualizar Fornecedor";
        document.getElementById("nome").focus();
    }
}

async function acionarExcluir() {
    if (!fornecedorSelecionadoId) {
        alert("Por favor, clique em um fornecedor na tabela primeiro para selecioná-lo!");
        return;
    }
    if (confirm("Tem certeza que deseja excluir o fornecedor selecionado?")) {
        try {
            const response = await fetch(`${API_URL}/fornecedores/${fornecedorSelecionadoId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Fornecedor excluído com sucesso!");
                acionarIncluir(); // 🎯 Reseta e trava a tela
                carregarFornecedores();
            } else {
                alert("Erro ao excluir fornecedor.");
            }
        } catch (e) { console.error(e); }
    }
}

// ⌨️ MOTOR DE ATALHOS DE TECLADO INTERATIVO (ALT + LETRA)
document.addEventListener("keydown", (event) => {
    if (event.altKey) {
        const tecla = event.key.toLowerCase();
        if (tecla === 'i') {
            event.preventDefault();
            acionarIncluir(); // 🎯 Chamada atualizada com o nome correto
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