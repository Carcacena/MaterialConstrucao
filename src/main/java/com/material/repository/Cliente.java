package com.material.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.material.*;
import com.material.model.Fornecedor;
import com.material.model.Usuario;

	
	

public interface Cliente extends JpaRepository<Usuario, Long> {

    Fornecedor findByLogin(String login);

}


