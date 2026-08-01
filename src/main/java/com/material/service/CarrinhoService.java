package com.material.service;

import com.material.model.Carrinho;
import com.material.model.Produto;
import com.material.repository.CarrinhoRepository;
import com.material.repository.ProdutoRepository; // Injetado para dar a baixa no estoque
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CarrinhoService {

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private ProdutoRepository produtoRepository; // Injetado para gerenciar as quantidades

    // 🔍 Camada de serviço que lê o standby (Status 1)
    public List<Carrinho> listarItensStandby(Long clienteId) {
        return carrinhoRepository.findByClienteIdAndStatus(clienteId, 1);
    }

    // 🟢 Grava o rascunho temporário no MySQL enquanto o cliente pensa
    public Carrinho salvarItemNoCarrinho(Carrinho carrinho) {
        carrinho.setStatus(1); // Garante o Status 1: Em Andamento / Standby
        return carrinhoRepository.save(carrinho);
    }

    // 🔴 Limpa a tabela temporária (Precisa do @Transactional para o Spring liberar o Delete)
    @Transactional
    public void limparCarrinhoDoCliente(Long clienteId) {
        carrinhoRepository.deleteByClienteId(clienteId);
    }

    // 💸 NEW: Consolida a venda, baixa estoque e muda o status do rascunho para FATURADO (Status 2)
    @Transactional
    public void faturarCarrinhoDoCliente(Long clienteId) {
        // 1. Busca todos os itens em standby (Status 1) que vimos no log do seu Hibernate
        List<Carrinho> itensStandby = carrinhoRepository.findByClienteIdAndStatus(clienteId, 1);

        if (itensStandby.isEmpty()) {
            throw new RuntimeException("Erro: Não há nenhum item pendente para faturamento.");
        }

        // 2. Loop para processar produto por produto
        for (Carrinho item : itensStandby) {
            Produto produto = item.getProduto();

            if (produto == null) {
                throw new RuntimeException("Erro grave: Produto não vinculado ao item do carrinho.");
            }

            // 3. Regra de negócio: calcula a baixa do estoque (10 - 1 = 9)
           
            int novoEstoque = produto.getEstoqueAtual() - item.getQuantidade().intValue();
       
            if (novoEstoque < 0) {
                throw new RuntimeException("Estoque insuficiente no banco para o produto: " + produto.getNome());
            }

            // 4. Salva a nova quantidade real do produto no MySQL
            produto.setEstoqueAtual(novoEstoque);
            produtoRepository.save(produto);

            // 5. Muda o status do item para 2 (Faturado/Concluído) para tirá-lo do standby
            item.setStatus(2); 
            carrinhoRepository.save(item);
        }
    }
}