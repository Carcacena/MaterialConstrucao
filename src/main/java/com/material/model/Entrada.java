package com.material.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entrada")
public class Entrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_nota", nullable = false, length = 20)
    private String numeroNota;

    @Column(length = 5)
    private String serie;

    @Column(name = "chave_acesso", nullable = false, length = 44)
    private String chaveAcesso;

    @Column(name = "data_recebimento", nullable = false)
    private LocalDate dataRecebimento;

    // 🌟 AFINADO: Agora aponta direto para a Entidade Fornecedor que você enviou
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    // 🌟 RELACIONAMENTO MESTRE/DETALHE: Uma Nota para Vários Itens
    @OneToMany(mappedBy = "entrada", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntradaProdutos> itens = new ArrayList<>();

    
    public void setItens(List<EntradaProdutos> novosItens) {
        this.itens.clear(); // Limpa mantendo a mesma referência de coleção interna
        if (novosItens != null) {
            // Vincula de volta cada item para manter a integridade bidirecional
            for (EntradaProdutos item : novosItens) {
                item.setEntrada(this); 
            }
            this.itens.addAll(novosItens); // Adiciona os novos elementos com segurança
        }
    }
    
    
    
    
    // ======================
    // GETTERS E SETTERS
    // ======================
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroNota() {
        return numeroNota;
    }

    public void setNumeroNota(String numeroNota) {
        this.numeroNota = numeroNota;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public LocalDate getDataRecebimento() {
        return dataRecebimento;
    }

    public void setDataRecebimento(LocalDate dataRecebimento) {
        this.dataRecebimento = dataRecebimento;
    }

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public List<EntradaProdutos> getItens() {
        return itens;
    }

   
}