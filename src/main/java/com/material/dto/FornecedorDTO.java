package com.material.dto;

import java.util.List;

public class FornecedorDTO {
	  private Long id;
	    private String nome;
	    private String endereco;
	
	    public FornecedorDTO(Long id, String login, String perfil, int tipo) {
	        this.id = id;
	        this.nome = nome;
	        this.endereco = endereco;
	       
	    }

		public String getNome() {
			return nome;
		}

		public void setNome(String nome) {
			this.nome = nome;
		}

		public String getEndereco() {
			return endereco;
		}

		public void setEndereco(String endereco) {
			this.endereco = endereco;
		}

	   

	   
	}


