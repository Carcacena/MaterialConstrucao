package com.material.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "fornecedor")
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String endereco;

    //@OneToMany(mappedBy = "fornecedor", cascade = CascadeType.ALL)
    //@JsonBackReference // 👈 Corta o loop reverso do JSON
    @OneToMany(mappedBy = "fornecedor", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore 
    private List<Produto> produtos;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public List<Produto> getProdutos() { return produtos; }
    public void setProdutos(List<Produto> produtos) { this.produtos = produtos; }
}