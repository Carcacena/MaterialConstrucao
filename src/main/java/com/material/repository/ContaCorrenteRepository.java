package com.material.repository;

import com.material.model.ContaCorrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContaCorrenteRepository extends JpaRepository<ContaCorrente, Long> {
    
    // Método customizado útil para o financeiro: busca todo o histórico de um cliente específico
    List<ContaCorrente> findByClienteIdOrderByDataMovimentacaoDesc(Long clienteId);
}