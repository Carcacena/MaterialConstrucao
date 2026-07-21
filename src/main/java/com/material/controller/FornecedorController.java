package com.material.controller;

import com.material.model.Fornecedor;
import com.material.repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fornecedores")
public class FornecedorController {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    // 📦 LISTAR TODOS OS FORNECEDORES (GET) - Esse você já tinha!
    @GetMapping
    public ResponseEntity<List<Fornecedor>> listar() {
        return ResponseEntity.ok(fornecedorRepository.findAll());
    }

    // 🟢 CADASTRAR NOVO FORNECEDOR (POST) - ADICIONADO
    @PostMapping
    public ResponseEntity<Fornecedor> cadastrar(@RequestBody Fornecedor fornecedor) {
        return ResponseEntity.ok(fornecedorRepository.save(fornecedor));
    }

    // 🔵 ATUALIZAR FORNECEDOR EXISTENTE (PUT) - ADICIONADO
    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(@PathVariable Long id, @RequestBody Fornecedor fornecedorDados) {
        return fornecedorRepository.findById(id)
            .map(fornecedor -> {
                fornecedor.setNome(fornecedorDados.getNome());
                fornecedor.setEndereco(fornecedorDados.getEndereco());
                Fornecedor atualizado = fornecedorRepository.save(fornecedor);
                return ResponseEntity.ok(atualizado);
            })
            .orElse(ResponseEntity.notFound().build()); // Retorna 404 limpo se o ID não existir!
    }
    // 🔴 EXCLUIR FORNECEDOR DO BANCO (DELETE) - ADICIONADO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));

        fornecedorRepository.delete(fornecedor);
        return ResponseEntity.noContent().build();
    }
}