package com.material.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "item_venda")
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com a venda pai (Muitos itens para uma Venda)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id", nullable = false)
    private Venda venda;

    // Relacionamento com o seu produto existente no banco de dados
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    // Precision 10 e Scale 3 permite salvar frações como quilos e metros (ex: 2.550 metros de fio)
    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidade;

    // Salva o preço praticado na hora exata da venda (evita que reajustes futuros alterem o histórico)
    @Column(name = "preco_praticado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoPraticado;

    // --- Construtores ---
    public ItemVenda() {
    }

    // --- Getters e Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Venda getVenda() { return venda; }
    public void setVenda(Venda venda) { this.venda = venda; }

    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }

    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }

    public BigDecimal getPrecoPraticado() { return precoPraticado; }
    public void setPrecoPraticado(BigDecimal precoPraticado) { this.precoPraticado = precoPraticado; }
}