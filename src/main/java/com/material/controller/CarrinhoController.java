package com.material.controller; 

import com.material.model.Carrinho; 
import com.material.service.CarrinhoService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.http.HttpStatus; 
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List; 
import java.time.LocalDate;
@CrossOrigin("*") 
@RestController 
@RequestMapping("/carrinho") 
public class CarrinhoController { 

    @Autowired 
    private CarrinhoService carrinhoService; 

    // 💸 4. CONFIRMAR FATURAMENTO (POST) - Consolida a venda do pedido e vincula o cliente final
    @PostMapping("/faturar/pedido/{numeroPedido}/cliente/{clienteId}") 
    public ResponseEntity<String> faturarCarrinho(@PathVariable String numeroPedido, @PathVariable Long clienteId) { 
        try { 
            // Executa a baixa de estoque cirúrgica baseada estritamente no pedido aberto
            carrinhoService.faturarCarrinhoDoPedido(numeroPedido, clienteId); 
            return ResponseEntity.ok("Venda faturada com sucesso no Spring Boot, piá!"); 
        } catch (RuntimeException e) { 
            return ResponseEntity.badRequest().body(e.getMessage()); 
        } 
    } 

    // 🔍 1. LISTAR ITENS EM STANDBY (GET) - Filtra os itens da tela da direita pelo número do pedido
    @GetMapping("/pedido/{numeroPedido}") // 🔥 Verifique se a rota bate com o JS (sem o "/pesquisa")
    public ResponseEntity<List<Carrinho>> listarItens(@PathVariable String numeroPedido) {
        List<Carrinho> itens = carrinhoService.listarItensStandby(numeroPedido);
        
        // Proteção: Se a lista vier nula, retorna uma lista vazia com status 200 em vez de estourar Erro 500
        if (itens == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        
        return ResponseEntity.ok(itens);
    }

    // 🟢 2. SALVAR ITEM NO STANDBY (POST) - Quando move o produto para a direita
    @PostMapping 
    public ResponseEntity<Carrinho> adicionarItem(@RequestBody Carrinho carrinho) { 
        return ResponseEntity.ok(carrinhoService.salvarItemNoCarrinho(carrinho)); 
    } 

    // 🔴 3. LIMPAR CARRINHO INTEGRAL (DELETE) - Quando o operador aborta o cupom inteiro
    @DeleteMapping("/pedido/{numeroPedido}") 
    public ResponseEntity<Void> limparCarrinho(@PathVariable String numeroPedido) { 
        carrinhoService.limparCarrinhoDoPedido(numeroPedido); 
        return ResponseEntity.noContent().build(); 
    } 

    @GetMapping("/pesquisa/periodo")
    public ResponseEntity<List<Carrinho>> pesquisarPorPeriodo(
            @RequestParam LocalDate dataInicio,
            @RequestParam LocalDate dataFim
    ) {
        return ResponseEntity.ok(
                carrinhoService.pesquisarPedidosPorPeriodo(
                        dataInicio,
                        dataFim
                )
        );
    }

    @GetMapping("/pesquisa/pedido/{numeroPedido}")
    public ResponseEntity<List<Carrinho>> pesquisarPedidoCompleto(
            @PathVariable String numeroPedido
    ) {
        return ResponseEntity.ok(
                carrinhoService.pesquisarTodosItensDoPedido(
                        numeroPedido
                )
        );
    } 
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // 🎯 5. DELETAR UM UNICO ITEM DO CARRINHO (Botão X da Linha)
    @DeleteMapping("/item/{id}") 
    public ResponseEntity<Void> excluirItemDoCarrinho(@PathVariable Long id) { 
        try { 
            carrinhoService.excluirItemPorId(id); 
            return ResponseEntity.ok().build(); 
        } catch (Exception e) { 
            System.err.println("Erro ao deletar item do cupom: " + e.getMessage()); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); 
        } 
    } 
}