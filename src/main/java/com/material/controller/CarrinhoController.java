package com.material.controller;

import com.material.model.Carrinho;
import com.material.service.CarrinhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/carrinho")
public class CarrinhoController {

    @Autowired
    private CarrinhoService carrinhoService;
    // 💸 4. CONFIRMAR FATURAMENTO (POST) - Consolida a venda e dá baixa no estoque do MySQL
    @PostMapping("/faturar/cliente/{clienteId}")
    public ResponseEntity<String> faturarCarrinho(@PathVariable Long clienteId) {
        try {
            // Chama a lógica vitoriosa do Service que calcula a baixa (10 - 1 = 9) e salva no banco
            carrinhoService.faturarCarrinhoDoCliente(clienteId);
            return ResponseEntity.ok("Venda faturada com sucesso no Spring Boot, piá!");
        } catch (RuntimeException e) {
            // Se faltar estoque ou der erro, o Java avisa o front-end de forma segura
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    
    
    

    // 🔍 1. LISTAR ITENS EM STANDBY (GET) - Mostra o carrinho atual do cliente na tela
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Carrinho>> listarItens(@PathVariable Long clienteId) {
        return ResponseEntity.ok(carrinhoService.listarItensStandby(clienteId));
    }

    // 🟢 2. SALVAR ITEM NO STANDBY (POST) - Quando clica em Incluir no balcão
    @PostMapping
    public ResponseEntity<Carrinho> adicionarItem(@RequestBody Carrinho carrinho) {
        return ResponseEntity.ok(carrinhoService.salvarItemNoCarrinho(carrinho));
    }

    // 🔴 3. LIMPAR CARRINHO (DELETE) - Quando cancela o cupom no balcão
    @DeleteMapping("/cliente/{clienteId}")
    public ResponseEntity<Void> limparCarrinho(@PathVariable Long clienteId) {
        carrinhoService.limparCarrinhoDoCliente(clienteId);
        return ResponseEntity.noContent().build();
    }
}