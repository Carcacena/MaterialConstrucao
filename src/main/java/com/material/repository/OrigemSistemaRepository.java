package com.material.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.material.model.OrigemSistema;

@Repository
public interface OrigemSistemaRepository extends JpaRepository<OrigemSistema, Long> { 

}

