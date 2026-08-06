package com.material.service;

import com.material.model.Carrinho;
import com.material.model.Produto;
import com.material.repository.CarrinhoRepository;
import com.material.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class CarrinhoService {

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    // 🔍 Camada de serviço que lê os detalhes do pedido completo trazidos com JOIN FETCH do banco
    public List<Carrinho> listarItensStandby(String numeroPedido) {
        // 🔥 CORRIGIDO: Agora chama a query personalizada que injeta o Cliente e o Produto juntos!
        return carrinhoRepository.buscarPedidoComRelacionamentos(numeroPedido);
    }

    // 🟢 Grava o rascunho temporário no MySQL enquanto o cliente pensa
    public Carrinho salvarItemNoCarrinho(Carrinho carrinho) {
        carrinho.setStatus(1); // Garante o Status 1: Em Andamento / Standby
        return carrinhoRepository.save(carrinho);
    }

    // 🔴 Limpa a tabela temporária de um cupom específico (Precisa do @Transactional)
    @Transactional
    public void limparCarrinhoDoPedido(String numeroPedido) {
        carrinhoRepository.deleteByNumeroPedido(numeroPedido);
    }

    // 💸 CONSOLIDA A VENDA: Baixa estoque, vincula o cliente real e muda o status para FATURADO (Status 2)
    @Transactional
    public void faturarCarrinhoDoPedido(String numeroPedido, Long clienteIdDefinitivo) {
        // 1. Busca os itens em standby específicos DESSE número de pedido
        List<Carrinho> itensStandby = carrinhoRepository.findByNumeroPedidoAndStatus(numeroPedido, 1);
        if (itensStandby.isEmpty()) {
            throw new RuntimeException("Erro: Não há nenhum item pendente para faturamento para este pedido.");
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

            // 5. VÍNCULO DO CLIENTE DEFINITIVO: Acopla o cliente que está fechando a compra
            com.material.model.Cliente clienteDefinitivo = new com.material.model.Cliente();
            clienteDefinitivo.setId(clienteIdDefinitivo);
            item.setCliente(clienteDefinitivo);

            // 6. Muda o status do item para 2 (Faturado/Concluído) para tirá-lo do standby
            item.setStatus(2);
            carrinhoRepository.save(item);
        }
    }

    public List<Carrinho> pesquisarPedidosPorPeriodo(
            LocalDate dataInicio, 
            LocalDate dataFim
    ) {
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.plusDays(1).atStartOfDay().minusNanos(1);
        return carrinhoRepository.findByDataCriacaoBetweenOrderByDataCriacaoDesc(inicio, fim);
    }

    public List<Carrinho> pesquisarTodosItensDoPedido(String numeroPedido) {
        return carrinhoRepository.findByNumeroPedidoOrderByIdAsc(numeroPedido);
    }

    // 🔴 Deleta um único item do carrinho usando o repositório existente
    @Transactional
    public void excluirItemPorId(Long id) {
        carrinhoRepository.deleteById(id);
    }
}