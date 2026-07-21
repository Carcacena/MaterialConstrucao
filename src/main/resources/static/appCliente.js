const API_URL = "http://localhost:8080";
const token = localStorage.getItem("token");
let clienteSelecionadoId = null;

if (!token) {
    window.location.href = "login.html";
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

async function carregarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
            const clientes = await response.json();
            
            // 🎯 LOG DE INSPEÇÃO: Mostra os dados exatos vindos do Java no seu Console F12
            console.log("CLIENTES RECEBIDOS DO BANCO:", clientes);
            
            const tabelaCorpo = document.getElementById("tabelaClientes");
            if (tabelaCorpo) {
                tabelaCorpo.innerHTML = "";
                
                clientes.forEach(cli => {
                    const tr = document.createElement("tr");
                    
                    // 🎯 CORREÇÃO CRÍTICA: Forçando id, nome e endereco tudo em letras minúsculas
                    tr.dataset.id = cli.id; 
                    tr.dataset.nome = cli.nome;
                    tr.dataset.endereco = cli.endereco;
                    
                    tr.innerHTML = `
                        <td>${cli.id}</td> <!-- 👈 Precisa ser obrigatoriamente cli.id minúsculo -->
                        <td>${cli.nome}</td>
                        <td>${cli.endereco ? cli.endereco : 'Não informado'}</td>
                    `;
                    
                    tr.addEventListener("click", () => {
                        document.querySelectorAll("#tabelaClientes tr").forEach(r => r.classList.remove("selecionado"));
                        tr.classList.add("selecionado");
                        clienteSelecionadoId = cli.id; // 👈 Mapeado em minúsculo para a seleção funcionar
                    });
                    tabelaCorpo.appendChild(tr);
                });
            }
        }
    } catch (e) { console.error("Erro na requisição de clientes:", e); }
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