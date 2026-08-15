package com.material.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.material.model.Cliente;
import com.material.model.Fornecedor;
import com.material.repository.ClienteRepository;
@Service
public class ClienteService {
	
	 @Autowired
	    private ClienteRepository clienteRepository;

	
	    public List<Cliente> listarTodos() {
	        return clienteRepository.findAll();
	    }

	    public Cliente salvar(Cliente cliente) {
	        return clienteRepository.save(cliente);
	        
	    }

	    public void excluir(Long id) {
	        clienteRepository.deleteById(id);
	    }

	    public Cliente buscarPorId(Long id) {
	        return clienteRepository.findById(id).orElse(null);
	    }
	}