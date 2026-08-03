package com.material.controller;

import com.material.model.Cliente;
import com.material.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    // 🟢 CADASTRAR NOVO CLIENTE (POST)
    @PostMapping
    public ResponseEntity<Cliente> cadastrar(@RequestBody Cliente cliente) {
        // Salva o cliente vindo direto do JSON do front-end
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    // 📦 LISTAR TODOS OS CLIENTES (GET)
    @GetMapping
    public ResponseEntity<List<Cliente>> listar() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

    // 🔵 ATUALIZAR CLIENTE EXISTENTE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @RequestBody Cliente clienteDados) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // Atualiza os atributos simples mapeados na Entidade
        cliente.setNome(clienteDados.getNome());
        cliente.setEndereco(clienteDados.getEndereco());

        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    // 🔴 EXCLUIR CLIENTE DO BANCO (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        clienteRepository.delete(cliente);
        return ResponseEntity.noContent().build();
    }
}