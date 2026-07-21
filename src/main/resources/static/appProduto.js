const API_URL = "http://localhost:8080";
const token = localStorage.getItem("token");
let produtoSelecionadoId = null;

if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarFornecedores();
    carregarProdutos();
    document.getElementById("formProduto").addEventListener("submit", cadastrarProduto);
    
    // 🔒 Bloqueia o formulário assim que a página abre
    bloquearFormulario(true);
});

// 🛠️ FUNÇÃO AUXILIAR PARA BLOQUEAR / LIBERAR CAMPOS
function bloquearFormulario(status) {
    document.getElementById("nome").disabled = status;
    document.getElementById("fornecedorId").disabled = status;
    document.getElementById("btnSalvar").disabled = status;
    
    // Altera a opacidade para dar o feedback visual de bloqueado
    const formContainer = document.getElementById("formProduto");
    if (status) {
        formContainer.style.opacity = "0.5";
    } else {
        formContainer.style.opacity = "1";
    }
}

// 🟢 AÇÃO DE INCLUIR (Acionada pelo botão INCLUIR do painel)
function acionarIncluir() {
    produtoSelecionadoId = null;
    document.getElementById("formProduto").reset();
    document.getElementById("tituloFormulario").textContent = "Cadastrar Produto";
    document.getElementById("btnSalvar").textContent = "Salvar Produto";
    
    // Remove qualquer seleção da tabela
    document.querySelectorAll("#tabelaProdutos tr").forEach(r => r.classList.remove("selecionado"));
    
    // 🔓 LIBERA OS CAMPOS PARA O USUÁRIO TRABALHAR!
    bloquearFormulario(false);
    document.getElementById("nome").focus(); // Joga o cursor direto no campo Nome
}

// 💾 SALVAR NOVO PRODUTO
async function cadastrarProduto(event) {
    event.preventDefault();
    const nomeProd = document.getElementById("nome").value;
    const selectFornecedorId = document.getElementById("fornecedorId").value;

    const produtoDados = {
        nome: nomeProd,
        fornecedorId: parseInt(selectFornecedorId)
    };

    const url = produtoSelecionadoId ? `${API_URL}/produtos/${produtoSelecionadoId}` : `${API_URL}/produtos`;
    const metodo = produtoSelecionadoId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(produtoDados)
        });

        if (response.ok) {
            alert(produtoSelecionadoId ? "Produto alterado com sucesso!" : "Produto cadastrado com sucesso!");
            
            // 🔒 Volta a bloquear o formulário após salvar com sucesso
            document.getElementById("formProduto").reset();
            bloquearFormulario(true);
            
            carregarProdutos();
        } else {
            alert("Erro ao salvar produto.");
        }
    } catch (e) { console.error(e); }
}

// 🏢 BUSCAR FORNECEDORES
async function carregarFornecedores() {
    try {
        const response = await fetch(`${API_URL}/fornecedores`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const fornecedores = await response.json();
            const select = document.getElementById("fornecedorId");
            if (select) {
                select.innerHTML = '<option value="">Selecione...</option>';
                fornecedores.forEach(f => {
                    const opt = document.createElement("option");
                    opt.value = f.id;
                    opt.textContent = f.nome;
                    select.appendChild(opt);
                });
            }
        }
    } catch (e) { console.error(e); }
}

// 📦 BUSCAR PRODUTOS CADASTRADOS
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const produtos = await response.json();
            const tabelaCorpo = document.getElementById("tabelaProdutos");
            if (tabelaCorpo) {
                tabelaCorpo.innerHTML = "";
                produtos.forEach(prod => {
                    const tr = document.createElement("tr");
                    tr.dataset.id = prod.id;
                    tr.dataset.nome = prod.nome;
                    tr.dataset.fornecedorid = prod.fornecedor ? prod.fornecedor.id : "";
                    
                    tr.innerHTML = `
                        <td>${prod.id}</td>
                        <td>${prod.nome}</td>
                        <td>${prod.fornecedor ? prod.fornecedor.nome : 'Não informado'}</td>
                    `;
                    
                    tr.addEventListener("click", () => {
                        document.querySelectorAll("#tabelaProdutos tr").forEach(r => r.classList.remove("selecionado"));
                        tr.classList.add("selecionado");
                        produtoSelecionadoId = prod.id;
                    });
                    
                    tabelaCorpo.appendChild(tr);
                });
            }
        }
    } catch (e) { console.error(e); }
}

// 🔵 AÇÃO DE ALTERAR (Libera o formulário com os dados carregados)
function acionarAlterar() {
    if (!produtoSelecionadoId) {
        alert("Por favor, clique em um produto na tabela primeiro para selecioná-lo!");
        return;
    }
    const linhaSelecionada = document.querySelector("#tabelaProdutos tr.selecionado");
    if (linhaSelecionada) {
        // 🔓 Libera os campos para edição
        bloquearFormulario(false);
        
        document.getElementById("nome").value = linhaSelecionada.dataset.nome;
        document.getElementById("fornecedorId").value = linhaSelecionada.dataset.fornecedorid;
        document.getElementById("tituloFormulario").textContent = "Alterar Produto";
        document.getElementById("btnSalvar").textContent = "Atualizar Produto";
        document.getElementById("nome").focus();
    }
}

// 🔴 AÇÃO DE EXCLUIR
async function acionarExcluir() {
    if (!produtoSelecionadoId) {
        alert("Por favor, clique em um produto na tabela primeiro para selecioná-lo!");
        return;
    }
    if (confirm("Tem certeza que deseja excluir o produto selecionado?")) {
        try {
            const response = await fetch(`${API_URL}/produtos/${produtoSelecionadoId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Produto excluído com sucesso!");
                document.getElementById("formProduto").reset();
                bloquearFormulario(true);
                carregarProdutos();
            } else {
                alert("Erro ao excluir produto.");
            }
        } catch (e) { console.error(e); }
    }
}