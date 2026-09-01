package com.material.repository;

import com.material.model.Entrada;
import com.material.dto.EntradaPeriodoDTO; // Importa o DTO que criamos
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EntradaRepository extends JpaRepository<Entrada, Long> {

    // 🎯 QUERY MASTER: Busca as entradas por período, traz o nome do Fornecedor e junta com o valor total da nota!
    @Query("SELECT new com.material.dto.EntradaPeriodoDTO(e.id, e.numeroNota, e.dataRecebimento, f.nome, i.valorTotalNota) " +
           "FROM Entrada e " +
           "JOIN e.fornecedor f " + // Relacionamento com Fornecedor na sua entidade Entrada
           "LEFT JOIN EntradaImpostos i ON i.entrada.id = e.id " + // Link com a tabela de impostos/totais
           "WHERE e.dataRecebimento BETWEEN :inicio AND :fim " +
           "ORDER BY e.dataRecebimento DESC")
    List<EntradaPeriodoDTO> buscarEntradasPorPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}