package com.material.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.material.model.Fornecedor;
import com.material.model.OrigemSistema;

import com.material.repository.OrigemSistemaRepository;

@CrossOrigin("*") // 👈 Adicionado para liberar o acesso do JavaScript local
@RestController
@RequestMapping("/api/origemsistema")

public class OrigemSistemaController {
	
	 @Autowired
	    private OrigemSistemaRepository origemsistemaRepository;

	    @GetMapping
	    public ResponseEntity<List<OrigemSistema>> listar() {
	        return ResponseEntity.ok(origemsistemaRepository.findAll());
	    }

	    @PostMapping
	    public ResponseEntity<OrigemSistema> cadastrar(@RequestBody OrigemSistema origemsistema) {
	        return ResponseEntity.ok(origemsistemaRepository.save(origemsistema));
	    }

	    @PutMapping("/{id}")
	    public ResponseEntity<OrigemSistema> atualizar(
	            @PathVariable Long id,
	            @RequestBody Fornecedor fornecedorDados) {

	        return origemsistemaRepository.findById(id)
	        		  .map(origemsistema-> {

	                    // CPF/CNPJ NÃO ALTERA - permanece o que já está no banco

	        			  origemsistema.setNome(fornecedorDados.getNome());
	        			  origemsistema.setInscricaoEstadual(fornecedorDados.getInscricaoEstadual());
	        			  origemsistema.setEmail(fornecedorDados.getEmail());
	        			  origemsistema.setTelefone(fornecedorDados.getTelefone());
	        			  origemsistema.setCep(fornecedorDados.getCep());
	        			  origemsistema.setUf(fornecedorDados.getUf());
	        			  origemsistema.setLogradouro(fornecedorDados.getLogradouro());
	        			  origemsistema.setNumero(fornecedorDados.getNumero());
	        			  origemsistema.setComplemento(fornecedorDados.getComplemento());
	        			  origemsistema.setBairro(fornecedorDados.getBairro());
	        			  origemsistema.setCidade(fornecedorDados.getCidade());

	                OrigemSistema atualizado =
	                            origemsistemaRepository.save(origemsistema);

	                    return ResponseEntity.ok(atualizado);
	                })
	                .orElse(ResponseEntity.notFound().build());
	    }
	    
	   

	    @DeleteMapping("/{id}")
	    public ResponseEntity<Void> excluir(@PathVariable Long id) {
	        Object fornecedor = origemsistemaRepository.findById(id)
	                .orElseThrow(() -> new RuntimeException("Origem Sistema não encontrado"));

	        origemsistemaRepository.delete((OrigemSistema) fornecedor);
	        return ResponseEntity.noContent().build();
	    }
	}


