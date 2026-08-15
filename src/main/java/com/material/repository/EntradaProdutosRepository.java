package com.material.repository;

import com.material.model.EntradaProdutos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntradaProdutosRepository extends JpaRepository<EntradaProdutos, Long> {
}