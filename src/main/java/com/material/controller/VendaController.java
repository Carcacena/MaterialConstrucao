package com.material.controller;

import com.material.model.Venda;
import com.material.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    // 🎯 Endpoint para salvar uma nova venda vinda do Front-end
    @PostMapping
    public ResponseEntity<Venda> realizarVenda(@RequestBody Venda venda) {
        Venda novaVenda = vendaService.salvarVenda(venda);
        return new ResponseEntity<>(novaVenda, HttpStatus.CREATED);
    }

    // 🎯 Endpoint para listar o histórico de todas as vendas no painel
    @GetMapping
    public ResponseEntity<List<Venda>> listarTodas() {
        List<Venda> vendas = vendaService.buscarTodas();
        return ResponseEntity.ok(vendas);
    }

    // 🎯 Endpoint para buscar uma venda específica pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Venda> buscarPorId(@PathVariable Long id) {
        return vendaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}