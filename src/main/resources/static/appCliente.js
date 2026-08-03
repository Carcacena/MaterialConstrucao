// 🌍 O sistema detecta sozinho onde está rodando e define a API correta (Local vs Railway) 
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:8080" : window.location.origin; 

// 🧠 CONTROLES DE ESCOPO GLOBAL DO MAINFRAME
let clienteSelecionadoId = null;

// 🔑 Captura o token tratando variações de aspas e formatos do console F12 
const dadosLoginString = localStorage.getItem("token"); 
let token = null; 
if (dadosLoginString) { 
  const limpo = dadosLoginString.trim().replace(/^"+|"+$/g, ''); 
  if (limpo.startsWith("{")) { 
    try { 
      const objetoLogin = JSON.parse(limpo); 
      token = objetoLogin.token || objetoLogin; 
    } catch (e) { 
      token = limpo; 
    } 
  } else { 
    token = limpo; 
  } 
} 

// Inicializador da página
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

// 👥 CARREGAR E RENDERIZAR NA TABELA DO CRUD
async function carregarClientes() { 
  try { 
    const response = await fetch(`${API_URL}/clientes`, { 
      method: "GET", 
      headers: { "Authorization": `Bearer ${token}` } 
    }); 

    // 🔥 CORREÇÃO CIRÚRGICA: Aponta agora para a tabela real do seu HTML
    const tabela = document.getElementById("tabelaClientes"); 
    if (!tabela) return; 

    tabela.innerHTML = ""; // Limpa os registros antigos antes da carga

    if (response.ok) { 
      const clientes = await response.json(); 
      
      if (clientes.length === 0) {
        tabela.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #bdc3c7;">Nenhum cliente cadastrado.</td></tr>`;
        return;
      }

      clientes.forEach(c => { 
        const tr = document.createElement("tr");
        tr.className = "item-linha";
        
        // Armazena os dados na linha para o gatilho da Alteração/Exclusão
        tr.dataset.id = c.id;
        tr.dataset.nome = c.nome;
        tr.dataset.endereco = c.endereco || "Não Informado";

        tr.innerHTML = `
          <td><strong>${c.id}</strong></td>
          <td>${c.nome}</td>
          <td>${c.endereco || '<small style="color:#7f8c8d;">S/Endereço</small>'}</td>
        `;

        // 🖱️ GATILHO DE CLIQUE: Seleciona o cliente na tabela igual ao COBOL
        tr.addEventListener("click", () => {
          document.querySelectorAll("#tabelaClientes tr").forEach(r => r.classList.remove("selecionado"));
          tr.classList.add("selecionado");
          clienteSelecionadoId = c.id; // Alimenta o ponteiro global
          console.log(`Cliente selecionado ID: ${clienteSelecionadoId}`);
        });

        tabela.appendChild(tr); 
      }); 
    } else { 
      tabela.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #c0392b;">Erro de resposta do Spring Boot (${response.status}).</td></tr>`;
    } 
  } catch (e) { 
    console.error("Erro ao carregar clientes:", e); 
    const tabela = document.getElementById("tabelaClientes");
    if (tabela) {
      tabela.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #c0392b;">Falha de comunicação com a API.</td></tr>`;
    }
  } 
} 

// 💾 GRAVAR / ATUALIZAR REGISTRO NO MYSQL VIA SPRING BOOT
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
      alert(clienteSelecionadoId ? "Cliente alterado com sucesso!" : "Cliente cadastrado com sucesso!"); 
      document.getElementById("formCliente").reset(); 
      bloquearFormulario(true); 
      carregarClientes(); // Atualiza a tabela na hora!
    } else { 
      alert("Erro ao salvar cliente no Spring Boot."); 
    } 
  } catch (e) { 
    console.error(e); 
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
    } catch (e) { 
      console.error(e); 
    } 
  } 
} 

// ⌨️ MOTOR DE ATALHOS DE TECLADO UNIFICADO E CORRIGIDO (ALT + LETRA)
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