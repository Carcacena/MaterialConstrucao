package com.material.controller;

import com.material.dto.ProdutoDTO;
import com.material.model.Fornecedor;
import com.material.model.Produto;
import com.material.repository.FornecedorRepository;
import com.material.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @PostMapping
    public ResponseEntity<Produto> cadastrar(@RequestBody ProdutoDTO dto) {
        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setFornecedor(fornecedor);

        return ResponseEntity.ok(produtoRepository.save(produto));
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        return ResponseEntity.ok(produtoRepository.findAll());
    }
    
   
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody ProdutoDTO dto) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
                
        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));

        produto.setNome(dto.getNome());
        produto.setFornecedor(fornecedor);
        
        return ResponseEntity.ok(produtoRepository.save(produto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
                
        produtoRepository.delete(produto);
        return ResponseEntity.noContent().build();
    }
    
    
    
    
    
    
    
    
    
}