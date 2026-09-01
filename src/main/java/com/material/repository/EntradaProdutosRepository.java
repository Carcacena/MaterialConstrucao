package com.material.repository;

import com.material.model.EntradaProdutos; // 🎯 Garanta que o caminho do seu modelo está certo!
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // 🚀 ESSALINHA É CRUCIAL PARA O VERMELHO SUMIR!

@Repository
public interface EntradaProdutosRepository extends JpaRepository<EntradaProdutos, Long> {
    
    // 🎯 Ensina o Spring a buscar todos os itens vinculados ao ID da entrada
    List<EntradaProdutos> findByEntradaId(Long entradaId);
}