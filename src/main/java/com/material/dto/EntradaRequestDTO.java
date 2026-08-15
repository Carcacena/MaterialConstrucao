package com.material.dto;

import java.time.LocalDate;
import java.util.List;

public class EntradaRequestDTO {
    private String numeroNota;
    private String serie;
    private String chaveAcesso;
    private LocalDate dataRecebimento;
    private Long fornecedorId;
    private List<ItemEntradaDTO> itens;

    // Getters e Setters
    public String getNumeroNota() { return numeroNota; }
    public void setNumeroNota(String numeroNota) { this.numeroNota = numeroNota; }
    public String getSerie() { return serie; }
    public void setSerie(String serie) { this.serie = serie; }
    public String getChaveAcesso() { return chaveAcesso; }
    public void setChaveAcesso(String chaveAcesso) { this.chaveAcesso = chaveAcesso; }
    public LocalDate getDataRecebimento() { return dataRecebimento; }
    public void setDataRecebimento(LocalDate dataRecebimento) { this.dataRecebimento = dataRecebimento; }
    public Long getFornecedorId() { return fornecedorId; }
    public void setFornecedorId(Long fornecedorId) { this.fornecedorId = fornecedorId; }
    public List<ItemEntradaDTO> getItens() { return itens; }
    public void setItens(List<ItemEntradaDTO> itens) { this.itens = itens; }
}