const API_URL = "https://materialconstrucao-production.up.railway.app/";
const token = localStorage.getItem("token");
let produtosSelecionadoId = null;

if (!token) {
    window.location.href = "login.html";
}





// 🔐 CAPTURA O TOKEN EXATO CONFORME ESTRUTURA DO SEU CONSOLE F12
const dadosLoginString = localStorage.getItem("token");
let token = null;

if (dadosLoginString) {
    try {
        const dadosLogin = JSON.parse(dadosLoginString);
        token = dadosLogin.token; 
    } catch (e) {
        token = dadosLoginString;
    }
}

let produtoSelecionadoId = null;

if (!token) {
    window.location.href = "login.html";
}

// 🌐 DISPARA O CARREGAMENTO QUANDO A TELA ABRE
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarProdutos();
    document.getElementById("formProduto").addEventListener("submit", cadastrarProduto);
    bloquearFormulario(true);
});

// 🛠️ AUXILIAR DE CONTROLE DOS CAMPOS
function bloquearFormulario(status) {
    document.getElementById("nomeProduto").disabled = status;
    document.getElementById("selecionaCliente").disabled = status;
    document.getElementById("tipoProduto").disabled = status;
    document.getElementById("dataValidade").disabled = status;
    document.getElementById("precoCusto").disabled = status;
    document.getElementById("precoVenda").disabled = status;
    document.getElementById("btnSalvar").disabled = status;
    document.getElementById("formProduto").style.opacity = status ? "0.5" : "1";
}

// 🧮 CÁLCULO DINÂMICO DE MARGEM
function calcularMargem() {
    const custo = parseFloat(document.getElementById("precoCusto").value) || 0;
    const venda = parseFloat(document.getElementById("precoVenda").value) || 0;
    let margem = 0;
    if (custo > 0) {
        margem = ((venda - custo) / custo) * 100;
    }
    document.getElementById("valorMargem").textContent = margem.toFixed(2);
}

// 🟢 BOTÃO INCLUIR DO MENU
function acionarIncluir() {
    produtoSelecionadoId = null;
    document.getElementById("formProduto").reset();
    document.getElementById("tituloFormulario").innerText = "Cadastrar Produto";
    document.getElementById("valorMargem").textContent = "0.00";
    document.querySelectorAll(".produto-item").forEach(r => r.classList.remove("selecionado"));
    bloquearFormulario(false);
    document.getElementById("nomeProduto").focus();
}

// 💾 SALVAR / ALTERAR PRODUTO
async function cadastrarProduto(event) {
    event.preventDefault();
    const produtoDados = {
        nome: document.getElementById("nomeProduto").value,
        ClienteId: parseInt(document.getElementById("selecionaCliente").value),
        aGranel: document.getElementById("tipoProduto").value === "true",
        precoCusto: parseFloat(document.getElementById("precoCusto").value),
        precoVenda: parseFloat(document.getElementById("precoVenda").value),
        dataValidade: document.getElementById("dataValidade").value || null
    };
    const url = produtoSelecionadoId ? `${API_URL}/produtos/${produtoSelecionadoId}` : `${API_URL}/produtos`;
    const metodo = produtoSelecionadoId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(produtoDados)
        });

        if (response.ok) {
            alert(produtoSelecionadoId ? "Produto alterado!" : "Produto cadastrado!");
            document.getElementById("formProduto").reset();
            document.getElementById("valorMargem").textContent = "0.00";
            bloquearFormulario(true);
            carregarProdutos();
        } else {
            alert("Erro ao salvar produto.");
        }
    } catch (e) { console.error(e); }
}
// 🏢 BUSCAR Clientes DO MYSQL PARA O SELECT
async function carregarClientes() {
    try {
        const response = await fetch(`${API_URL}/Clientes`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        console.log("GET /Clientes status:", response.status);
        
        if (response.ok) {
            const Clientes = await response.json();
            console.log("Clientes carregados:", Clientes);
            const select = document.getElementById("selecionaCliente");
            if (select) {
                select.innerHTML = '<option value="">Selecione...</option>';
                Clientes.forEach(f => {
                    const opt = document.createElement("option");
                    opt.value = f.id;
                    opt.textContent = f.nome;
                    select.appendChild(opt);
                });
            }
        } else {
            console.error("Erro na resposta de Clientes:", response.status);
        }
    } catch (e) { console.error("Falha ao carregar Clientes:", e); }
}

// 📦 BUSCAR PRODUTOS E MONTAR OS BLOCOS COLAPSÁVEIS (ÁRVORE)
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const produtos = await response.json();
            const container = document.getElementById("containerClientesProdutos");
            if (!container) return;
            container.innerHTML = "";

            const agrupado = {};
            produtos.forEach(prod => {
                const ClienteNome = prod.Cliente ? prod.Cliente.nome : "Sem Cliente";
                if (!agrupado[ClienteNome]) agrupado[ClienteNome] = [];
                agrupado[ClienteNome].push(prod);
            });

            Object.keys(agrupado).forEach(ClienteName => {
                const divGrupo = document.createElement("div");
                divGrupo.style.marginBottom = "10px";

                const btnHeader = document.createElement("button");
                btnHeader.className = "Cliente-header";
                btnHeader.innerHTML = `📁 <strong>${ClienteName}</strong> (${agrupado[ClienteName].length})`;

                const divProdutosList = document.createElement("div");
                divProdutosList.className = "produtos-lista";
                divProdutosList.style.display = "none";

                btnHeader.addEventListener("click", () => {
                    divProdutosList.style.display = divProdutosList.style.display === "none" ? "block" : "none";
                });

                agrupado[ClienteName].forEach(prod => {
                    const item = document.createElement("div");
                    item.className = "produto-item";

                    if (prod.dataValidade) {
                        const hoje = new Date();
                        const validade = new Date(prod.dataValidade);
                        const diferencaDias = (validade - hoje) / (1000 * 60 * 60 * 24);
                        if (diferencaDias >= 0 && diferencaDias <= 30) {
                            item.style.cssText = "background-color: rgba(255, 0, 0, 0.15) !important; border-left: 4px solid #ff4d4d; color: #ff9999;";
                        }
                    }

                    const tipoLabel = prod.aGranel ? "[Granel]" : "[Unid]";
                    const validadeLabel = prod.dataValidade ? ` | Val: ${new Date(prod.dataValidade).toLocaleDateString('pt-BR')}` : "";
                    const margem = prod.precoCusto > 0 ? (((prod.precoVenda - prod.precoCusto) / prod.precoCusto) * 100).toFixed(0) : "0";

                    item.innerHTML = `
                        <span>📦 <strong>${prod.id}</strong> - ${prod.nome} <small style="color: #ff9800;">${tipoLabel}</small></span>
                        <span>Cust: R$ ${prod.precoCusto.toFixed(2)} | Vend: R$ ${prod.precoVenda.toFixed(2)} | <strong>Lucro: ${margem}%</strong>${validadeLabel}</span>
                    `;

                    item.dataset.id = prod.id;
                    item.dataset.nome = prod.nome;
                    item.dataset.Clienteid = prod.Cliente ? prod.Cliente.id : "";
                    item.dataset.agranel = prod.aGranel;
                    item.dataset.precocusto = prod.precoCusto;
                    item.dataset.precovenda = prod.precoVenda;
                    item.dataset.datavalidade = prod.dataValidade || "";

                    item.addEventListener("click", (e) => {
                        e.stopPropagation();
                        document.querySelectorAll(".produto-item").forEach(r => r.classList.remove("selecionado"));
                        item.classList.add("selecionado");
                        produtoSelecionadoId = parseInt(prod.id);
                    });

                    divProdutosList.appendChild(item);
                });

                divGrupo.appendChild(btnHeader);
                divGrupo.appendChild(divProdutosList);
                container.appendChild(divGrupo);
            });
        }
    } catch (e) { console.error(e); }
}

// 🔵 BOTÃO ALTERAR (PUXA OS DADOS DA ÁRVORE PARA OS INPUTS)
function acionarAlterar() {
    if (!produtoSelecionadoId) {
        alert("Clique em um produto dentro de um Cliente para selecioná-lo!");
        return;
    }
    const item = document.querySelector(".produto-item.selecionado");
    if (item) {
        bloquearFormulario(false);
        document.getElementById("nomeProduto").value = item.dataset.nome;
        document.getElementById("selecionaCliente").value = item.dataset.Clienteid;
        document.getElementById("tipoProduto").value = item.dataset.agranel;
        document.getElementById("precoCusto").value = item.dataset.precocusto;
        document.getElementById("precoVenda").value = item.dataset.precovenda;
        document.getElementById("dataValidade").value = item.dataset.datavalidade;
        calcularMargem();
        document.getElementById("nomeProduto").focus();
    }
}


// 🔴 BOTÃO EXCLUIR (Corrigido para a rota certa)
async function acionarExcluir() {
    if (!produtoSelecionadoId) {
        alert("Selecione um produto primeiro!");
        return;
    }
    if (confirm("Deseja excluir o produto selecionado?")) {
        try {
            // Mudado de /routes/ para /produtos/ 🚀
            const response = await fetch(`${API_URL}/produtos/${produtoSelecionadoId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Produto excluído com sucesso!");
                document.getElementById("formProduto").reset();
                document.getElementById("valorMargem").textContent = "0.00";
                bloquearFormulario(true);
                carregarProdutos();
            } else { alert("Erro ao excluir produto."); }
        } catch (e) { console.error(e); }
    }
}
























