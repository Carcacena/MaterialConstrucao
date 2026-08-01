package com.material.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "carrinho")
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento Pai e Filho com a tabela de Clientes
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    // Relacionamento Pai e Filho com a tabela de Produtos
    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidade;

    @Column(name = "preco_praticado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoPraticado;

    @Column(nullable = false)
    private Integer status = 1; // 1 = Em Andamento, 2 = Cancelado, 3 = Finalizado

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    // --- GETTERS E SETTERS (Padrão para o Hibernate ler os dados) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }

    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }

    public BigDecimal getPrecoPraticado() { return precoPraticado; }
    public void setPrecoPraticado(BigDecimal precoPraticado) { this.precoPraticado = precoPraticado; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}