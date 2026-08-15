package com.material.repository;

import com.material.model.EntradaImpostos;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EntradaImpostosRepository extends JpaRepository<EntradaImpostos, Long> {
    Optional<EntradaImpostos> findByEntradaId(Long entradaId);
}