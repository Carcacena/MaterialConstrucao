package com.material.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String endereco;

    // 🎯 ADICIONE ESTES DOIS MÉTODOS QUE ESTAVAM FALTANDO:
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Seus métodos atuais (mantenha como estão)
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
}