package com.material.repository;

import com.material.model.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    
    // 🔍 Filtra no MySQL apenas os rascunhos em standby (Status 1) de um cliente específico
    List<Carrinho> findByClienteIdAndStatus(Long clienteId, Integer status);
    
    // 🗑️ Método automático do Spring Data para limpar os rascunhos de um cliente por ID
    void deleteByClienteId(Long clienteId);
}