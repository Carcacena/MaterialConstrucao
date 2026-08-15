package com.material.controller;

import com.material.dto.EntradaRequestDTO;
import com.material.model.Entrada;
import com.material.service.EntradaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/entradas")
public class EntradaController {

    @Autowired
    private EntradaService entradaService;

    @PostMapping
    public ResponseEntity<?> criarEntrada(@Valid @RequestBody EntradaRequestDTO entradaRequestDTO) {
        try {
       //     Entrada novaEntrada = entradaService.registrarEntrada(entradaRequestDTO);
       //     return ResponseEntity.status(HttpStatus.CREATED).body(novaEntrada);
        	
        	        Entrada novaEntrada = entradaService.registrarEntrada(entradaRequestDTO);
        	        return ResponseEntity.status(HttpStatus.CREATED).body(novaEntrada);
        
    } catch (RuntimeException e) {
            // Retorna o erro amigável se o produto ou fornecedor não existirem
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao processar a entrada de estoque.");
        }
    }
}
    
