package com.material.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "conta_corrente")
public class ContaCorrente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vinculado ao Cliente. Pode ser NULL se for uma venda rápida de balcão à vista
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    // Vinculado à venda que gerou a movimentação (opcional, para rastreabilidade)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id")
    private Venda venda;

    @Column(name = "data_movimentacao", nullable = false)
    private LocalDateTime dataMovimentacao;

    // Salva o tipo: 'ENTRADA' (Dinheiro entrando na loja) ou 'SAIDA' (Pagamento/Fiado)
    @Column(name = "tipo_movimentacao", nullable = false, length = 10)
    private String tipoMovimentacao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false, length = 255)
    private String descricao;

    // --- Construtores ---
    public ContaCorrente() {
    }

    // --- Getters e Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Venda getVenda() { return venda; }
    public void setVenda(Venda venda) { this.venda = venda; }

    public LocalDateTime getDataMovimentacao() { return dataMovimentacao; }
    public void setDataMovimentacao(LocalDateTime dataMovimentacao) { this.dataMovimentacao = dataMovimentacao; }

    public String getTipoMovimentacao() { return tipoMovimentacao; }
    public void setTipoMovimentacao(String tipoMovimentacao) { this.tipoMovimentacao = tipoMovimentacao; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}