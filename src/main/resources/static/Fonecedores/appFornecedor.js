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
            window.location.href = "/login.html"; // ⚡ Corrigido com barra
            return;
        }

        if (!response.ok) {
            throw new Error("Erro ao buscar fornecedores");
        }

        const fornecedores = await response.json();
        renderizarTabelaFornecedores(fornecedores);

    } catch (error) {
        console.error("Erro no processamento:", error);
    }
}
// 🌟 FUNÇÃO CORRIGIDA: Alinhada estritamente com as 4 colunas visíveis da sua tela
function renderizarTabelaFornecedores(fornecedores) {
    const tbody = document.getElementById("tabelaFornecedores");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (fornecedores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Nenhum fornecedor cadastrado.
                </td>
            </tr>
        `;
        return;
    }

    // ⚡ Atualize o trecho de renderização para bater com as 12 colunas do HTML
    fornecedores.forEach(forn => {
        const tr = document.createElement("tr");

        // Mantém o dataset completo para a função Alterar funcionar perfeitamente
        tr.dataset.id = forn.id;
        tr.dataset.nome = forn.nome;
        tr.dataset.cnpj = forn.cnpj || "";
        tr.dataset.inscricaoEstadual = forn.inscricaoEstadual || "";
        tr.dataset.telefone = forn.telefone || "";
        tr.dataset.email = forn.email || "";
        tr.dataset.cep = forn.cep || "";
        tr.dataset.uf = forn.uf || "";
        tr.dataset.logradouro = forn.logradouro || "";
        tr.dataset.numero = forn.numero || "";
        tr.dataset.bairro = forn.bairro || "";
        tr.dataset.cidade = forn.cidade || "";
        tr.dataset.complemento = forn.complemento || "";

        // 🌟 A MÁGICA DO ALINHAMENTO: 12 tags <td> na ordem exata do seu <th>
        tr.innerHTML = `
	        <td>${forn.id}</td>
	        <td>${forn.nome || ""}</td>
	        <td>${forn.cnpj || "Não informado"}</td>
	        <td>${forn.inscricaoEstadual || "ISENTO"}</td>
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
            document.querySelectorAll("#tabelaFornecedores tr").forEach(r => r.classList.remove("selecionado"));
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
    const documentoMascarado = document.getElementById("documento").value;
    const documentoLimpo = documentoMascarado.replace(/\D/g, ""); // 🧼 Dado limpo para o Java

    // ⚡ INCLUSÃO: Captura a Inscrição Estadual (Pode levar o número com traço ou a palavra "ISENTO")
    const inscricaoEstadualForn = document.getElementById("inscricaoEstadual").value;

    const emailForn = document.getElementById("email").value;
    const telefoneForn = document.getElementById("telefone").value;

    // 🧼 REGRA DE OURO: Limpa o ponto e traço do CEP para enviar estritamente os 8 números puros exigidos pelo Java!
    const cepMascarado = document.getElementById("cep").value;
    const cepLimpo = cepMascarado.replace(/\D/g, "");

    const logradouroForn = document.getElementById("logradouro").value;
    const numeroForn = document.getElementById("numero").value;
    const complementoForn = document.getElementById("complemento").value;
    const bairroForn = document.getElementById("bairro").value;
    const cidadeForn = document.getElementById("cidade").value;
    const ufForn = document.getElementById("uf").value;

    // 📦 Criação do objeto perfeitamente alinhado com o Fornecedor.java de 13 colunas
    const fornecedorDados = {
        nome: nomeForn,
        cnpj: documentoLimpo, // Envia 11 ou 14 dígitos puros
        inscricaoEstadual: inscricaoEstadualForn, // ⚡ Enviando o novo campo mapeado!
        email: emailForn,
        telefone: telefoneForn,
        cep: cepLimpo, // Envia exatamente 8 números puros
        logradouro: logradouroForn,
        numero: numeroForn,
        complemento: complementoForn,
        bairro: bairroForn,
        cidade: cidadeForn,
        uf: ufForn
    };

    // ⚡ Ajuste de rota com barra absoluta para estabilidade local e nuvem
    const url = fornecedorSelecionadoId ? `/fornecedores/${fornecedorSelecionadoId}` : `/fornecedores`;
    const metodo = fornecedorSelecionadoId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenPuro}`
            },
            body: JSON.stringify(fornecedorDados)
        });

        if (response.ok) {
            alert(fornecedorSelecionadoId ? "✅ Fornecedor alterado com sucesso!" : "✅ Fornecedor cadastrado com sucesso!");
            acionarIncluir();
            carregarFornecedores();
        } else {
            const textoErro = await response.text();
            alert("❌ Erro ao salvar fornecedor:\n" + textoErro);
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        alert("❌ Erro de rede ao tentar se conectar ao servidor.");
    }
}

function acionarAlterar() {
    if (!fornecedorSelecionadoId) {
        alert("⚠️ Por favor, clique em um fornecedor na tabela primeiro para selecioná-lo!");
        return;
    }
    const linhaSelecionada = document.querySelector("#tabelaFornecedores tr.selecionado");
    if (linhaSelecionada) {
        bloquearFormulario(false);

        document.getElementById("id").value = linhaSelecionada.dataset.id || "";
        document.getElementById("nome").value = linhaSelecionada.dataset.nome || "";
        document.getElementById("email").value = linhaSelecionada.dataset.email || "";
        document.getElementById("telefone").value = linhaSelecionada.dataset.telefone || "";
        document.getElementById("cep").value = linhaSelecionada.dataset.cep || "";
        document.getElementById("uf").value = linhaSelecionada.dataset.uf || "";
        document.getElementById("logradouro").value = linhaSelecionada.dataset.logradouro || "";
        document.getElementById("numero").value = linhaSelecionada.dataset.numero || "";
        document.getElementById("complemento").value = linhaSelecionada.dataset.complemento || "";
        document.getElementById("bairro").value = linhaSelecionada.dataset.bairro || "";
        document.getElementById("cidade").value = linhaSelecionada.dataset.cidade || "";

        // 📇 Captura o documento puro do dataset
       
		// 📇 CPF/CNPJ - somente exibição para conferência no ALTERAR
		const docPuro = linhaSelecionada.dataset.cnpj || "";

		const inputDoc = document.getElementById("documento");

		// Exibe o CPF/CNPJ selecionado
		inputDoc.value = docPuro;

		// Aplica a máscara para aparecer bonito
		aplicarMascaraDocumento(inputDoc);

		// Bloqueia: pode conferir, mas não alterar
		inputDoc.disabled = true;
		
		
		
		// const docPuro = linhaSelecionada.dataset.cnpj || "";
       // const inputDoc = document.getElementById("documento");
       // inputDoc.value = docPuro;

        // 🌟 AUTOMACÃO IH: Identifica se é CPF ou CNPJ pelo tamanho e marca o rádio certo
       // if (docPuro.length <= 11) {
       //     document.querySelector('input[name="tipoPessoa"][value="CPF"]').checked = true;
      //  } else {
       //     document.querySelector('input[name="tipoPessoa"][value="CNPJ"]').checked = true;
      //  }
	  if (docPuro.length <= 11) {

	      document.querySelector(
	          'input[name="tipoPessoa"][value="CPF"]'
	      ).checked = true;

	  } else {

	      document.querySelector(
	          'input[name="tipoPessoa"][value="CNPJ"]'
	      ).checked = true;
	  }
	  
	  
	  
	  
	  

        // Executa as regras de rótulo e comportamento de tela (ativa/inativa IE)
        ajustarTipoFormulario();
		// DEPOIS coloca o documento
		inputDoc.value = docPuro;

		// DEPOIS aplica máscara
		aplicarMascaraDocumento(inputDoc);

		// FINALMENTE bloqueia
		inputDoc.disabled = true;
		
		
		
		
		
		
		
		
		

        // 🏢 Carrega a Inscrição Estadual pós-ajuste de tela
        const inputIE = document.getElementById("inscricaoEstadual");
        if (inputIE) {
            inputIE.value = linhaSelecionada.dataset.inscricaoEstadual || "";
            // Aplica a máscara se não for "ISENTO"
            if (inputIE.value !== "ISENTO") aplicarMascaraIE(inputIE);
        }

        // ⚡ MÁGICA VISUAL: Força a formatação imediata das máscaras na tela
        aplicarMascaraDocumento(inputDoc);
        aplicarMascaraCEP(document.getElementById("cep"));
        aplicarMascaraTelefone(document.getElementById("telefone"));
		
		// 🔒 CPF/CNPJ é chave: no ALTERAR apenas exibe
		inputDoc.disabled = true;

		// 🔒 Também não permite trocar Física ↔ Jurídica
		document.querySelectorAll('input[name="tipoPessoa"]').forEach(radio => {
		    radio.disabled = true;
		});
		

        document.getElementById("tituloFormulario").textContent = "Alterar Fornecedor";
       
		 document.getElementById("btnSalvar").textContent = "Atualizar Fornecedor";
        document.getElementById("nome").focus();
    }
}

async function acionarExcluir() {
    const tokenPuro = obterTokenPuro();
    if (!tokenPuro) return;

    if (!fornecedorSelecionadoId) {
        alert("⚠️ Por favor, clique em um fornecedor na tabela primeiro para selecioná-lo!");
        return;
    }
    if (confirm("❓ Tem certeza que deseja excluir o fornecedor selecionado?")) {
        try {
            // ⚡ Ajustado para rota absoluta estável
            const response = await fetch(`/fornecedores/${fornecedorSelecionadoId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${tokenPuro}`
                }
            });
            if (response.ok) {
                alert("✅ Fornecedor excluído com sucesso!");
                acionarIncluir();
                carregarFornecedores();
            } else {
                alert("❌ Erro ao excluir fornecedor.");
            }
        } catch (e) {
            console.error(e);
        }
    }
}

// ⚡ 5. MÁSCARA DE TELEFONE AVANÇADA (055-41-99895-9399)
function aplicarMascaraTelefone(input) {
    if (!input) return;
    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 3) valor = valor.replace(/^(\d{3})(\d)/, "$1-$2");
    if (valor.length > 5) valor = valor.replace(/^(\d{3})-(\d{2})(\d)/, "$1-$2-$3");
    if (valor.length > 10) valor = valor.replace(/^(\d{3})-(\d{2})-(\d{5})(\d)/, "$1-$2-$3-$4");

    input.value = valor;
}

// ⚡ 6. MÁSCARA DE CEP AVANÇADA (80.820-080)
function aplicarMascaraCEP(input) {
    if (!input) return;
    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    if (valor.length > 5) valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2-$3");

    input.value = valor;
}

function ajustarTipoFormulario() {
    const tipo = document.querySelector('input[name="tipoPessoa"]:checked').value;
    const label = document.getElementById("label-documento");
    const inputDoc = document.getElementById("documento");
    const inputIE = document.getElementById("inscricaoEstadual");

    inputDoc.value = "";

    if (tipo === "CNPJ") {
        label.innerText = "CNPJ (Apenas números)";
        inputDoc.placeholder = "Ex: 12.345.678/0001-99";
        inputDoc.maxLength = 18;

        inputIE.value = "";
        inputIE.disabled = false;
        inputIE.placeholder = "Ex: 99999999-99";
        inputIE.maxLength = 11; // ⚡ Força o tamanho correto com o traço
    } else {
        label.innerText = "CPF (Apenas números)";
        inputDoc.placeholder = "Ex: 123.456.789-00";
        inputDoc.maxLength = 14;

        // Crava ISENTO automático e bloqueia o campo para Pessoa Física
        inputIE.value = "ISENTO";
        inputIE.disabled = true;
    }
}

// ⚡ 1. Máscara dinâmica para Documento (CPF ou CNPJ)
function aplicarMascaraDocumento(input) {
    let valor = input.value.replace(/\D/g, "");
    const tipo = document.querySelector('input[name="tipoPessoa"]:checked').value;

    if (tipo === "CNPJ") {
        if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
        if (valor.length > 5) valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        if (valor.length > 8) valor = valor.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
        if (valor.length > 12) valor = valor.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3\/$4-$5");
    } else {
        if (valor.length > 3) valor = valor.replace(/^(\d{3})(\d)/, "$1.$2");
        if (valor.length > 6) valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        if (valor.length > 9) valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    }
    input.value = valor;
}

// ⚡ 2. Máscara de Inscrição Estadual (99999999-99)
function aplicarMascaraIE(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor.length > 8) {
        valor = valor.replace(/^(\d{8})(\d)/, "$1-$2");
    }
    input.value = valor;
}

// ⚡ 3. Máscara de CEP (80.820-080) - LIBERTADA E ISOLADA GLOBALMENTE!
function aplicarMascaraCEP(input) {
    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    if (valor.length > 5) valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2-$3");

    input.value = valor;
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
            window.location.href = '/menu.html'; // ⚡ Corrigido com barra absoluta!
        }
    }
});






