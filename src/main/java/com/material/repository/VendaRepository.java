package com.material.repository;

import com.material.model.Venda;
import com.material.dto.EntradaPeriodoDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {

    // 🎯 RESOLVIDO COM SQL NATIVO: Evita o conflito de validação do CAST e faz o JOIN perfeito no MySQL
    @Query(value = "SELECT new com.material.dto.EntradaPeriodoDTO(" +
                   "v.id, " +
                   "CONCAT(v.id, ''), " + // Conversão limpa de ID para String sem quebrar o Hibernate
                   "CAST(v.dataVenda AS localdate), " + // Converte LocalDateTime para LocalDate esperado pelo DTO
                   "c.nome, " +
                   "v.valorTotal) " +
                   "FROM Venda v " +
                   "JOIN v.cliente c " +
                   "WHERE v.dataVenda BETWEEN :inicio AND :fim " +
                   "ORDER BY v.dataVenda DESC")
    List<EntradaPeriodoDTO> buscarVendasPorPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);
}