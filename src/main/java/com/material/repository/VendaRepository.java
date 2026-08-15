package com.material.repository;

import com.material.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {
    // Herdando o JpaRepository, o Spring já cria automaticamente o CRUD básico (save, findById, delete)
}