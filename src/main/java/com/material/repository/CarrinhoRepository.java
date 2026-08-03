package com.material.repository; 

import com.material.model.Carrinho; 
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository; 
import java.util.List; 

@Repository 
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> { 

    // 🔍 NEW: Filtra no MySQL os itens de um PEDIDO específico que estão em standby (Status 1)
    List<Carrinho> findByNumeroPedidoAndStatus(String numeroPedido, Integer status); 

    // 🗑️ NEW: Remove do rascunho os itens vinculados a um número de pedido específico
    void deleteByNumeroPedido(String numeroPedido);
}