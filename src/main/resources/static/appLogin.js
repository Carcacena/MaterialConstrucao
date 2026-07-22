async function logar() {
    const login = document.getElementById("login").value;
	const token = localStorage.getItem("token");
    const senha = document.getElementById("senha").value;

   // const response = await fetch("http://localhost:8080/auth/login", {
	const response = await fetch(`${API_URL}/auth/login`, {	
	

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },
		
        body: JSON.stringify({
            login: login,
            senha: senha
        })
    });

	if (response.ok) {

	    const token = await response.text();

	    localStorage.setItem("token", token);

	    sessionStorage.setItem("tipo", "0");

	    console.log("TIPO SALVO:");
	    console.log(sessionStorage.getItem("tipo"));

	    window.location.href = "menu.html";

	} else {

	    alert("Login inválido");
	}
	}

	async function logar(event) {
	    // Evita que a página recarregue ao submeter o formulário
	    if (event) event.preventDefault(); 

	    const login = document.getElementById("login").value;
	    const senha = document.getElementById("senha").value;

	    // CONFIGURAÇÃO AUTOMÁTICA DA URL:
	    // Se estiver no Railway, usa o link da nuvem. Se estiver local na porta 5500 (Live Server), aponta para o Spring (8080)
	    let API_URL = window.location.origin;
	    if (API_URL.includes("localhost:") && !API_URL.includes(":8080")) {
	        API_URL = "http://localhost:8080";
	    }

	    try {
	        const response = await fetch(`${API_URL}/auth/login`, {
	            method: "POST",
	            headers: { 
	                "Content-Type": "application/json" 
	            },
	            body: JSON.stringify({ login: login, senha: senha })
	        });

	        if (!response.ok) {
	            throw new Error("Login ou senha inválidos.");
	        }

	        // Lê o token como TEXTO PURO (conforme o padrão do seu backend)
	        const token = await response.text();
	        
	        // Salva as informações no navegador
	        localStorage.setItem("token", token);
	        sessionStorage.setItem("tipo", "0"); 
	        
	        console.log("Login efetuado com sucesso! Redirecionando...");
	        window.location.href = "menu.html";

	    } catch (error) {
	        console.error("Erro na autenticação:", error);
	        alert(error.message);
	    }
	}
