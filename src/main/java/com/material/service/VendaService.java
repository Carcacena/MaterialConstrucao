package com.material.service;

import com.material.model.Venda;
import com.material.model.ItemVenda;
import com.material.model.Produto;
import com.material.model.ContaCorrente;
import com.material.repository.VendaRepository;
import com.material.repository.ProdutoRepository;
import com.material.repository.ContaCorrenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ContaCorrenteRepository contaCorrenteRepository;

    @Transactional
    public Venda salvarVenda(Venda venda) {
        venda.setDataVenda(LocalDateTime.now());
        BigDecimal totalCalculadoVenda = BigDecimal.ZERO;

        if (venda.getItens() == null || venda.getItens().isEmpty()) {
            throw new IllegalArgumentException("Erro: Não é possível processar uma venda sem itens.");
        }

        for (ItemVenda item : venda.getItens()) {
            Produto produtoDb = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RuntimeException("Produto ID " + item.getProduto().getId() + " não localizado."));

            item.setPrecoPraticado(produtoDb.getPrecoVenda());
            item.setVenda(venda);

            BigDecimal subtotalItem = item.getQuantidade().multiply(item.getPrecoPraticado());
            totalCalculadoVenda = totalCalculadoVenda.add(subtotalItem);

            // ⚡ ROTINA DE BAIXA DE ESTOQUE COMPILADA E ATIVADA:
            if (produtoDb.getEstoque().compareTo(item.getQuantidade()) < 0) {
                // Nota do Maestro: Opcional colocar um aviso de estoque negativo se o balcão permitir vender sem saldo física
            }
            
            // Subtrai a quantidade vendida do estoque atual do produto
            produtoDb.setEstoque(produtoDb.getEstoque().subtract(item.getQuantidade()));
            produtoRepository.save(produtoDb); // Grava a atualização do registro do produto
        }

        venda.setValorTotal(totalCalculadoVenda);
        Venda vendaSalva = vendaRepository.save(venda);

        // Fluxo de Caixa Automático (Lançamento na Conta Corrente)
        ContaCorrente lancamentoFinanceiro = new ContaCorrente();
        lancamentoFinanceiro.setCliente(vendaSalva.getCliente());
        lancamentoFinanceiro.setVenda(vendaSalva);
        lancamentoFinanceiro.setDataMovimentacao(vendaSalva.getDataVenda());
        lancamentoFinanceiro.setValor(vendaSalva.getValorTotal());

        if ("CREDIARIO".equalsIgnoreCase(vendaSalva.getFormaPagamento())) {
            lancamentoFinanceiro.setTipoMovimentacao("SAIDA"); 
            lancamentoFinanceiro.setDescricao("Venda a Prazo (No Caderno) - Cupom #" + vendaSalva.getId());
        } else {
            lancamentoFinanceiro.setTipoMovimentacao("ENTRADA"); 
            lancamentoFinanceiro.setDescricao("Venda à Vista (" + vendaSalva.getFormaPagamento() + ") - Cupom #" + vendaSalva.getId());
        }

        contaCorrenteRepository.save(lancamentoFinanceiro);

        return vendaSalva;
    }

    public List<Venda> buscarTodas() {
        return vendaRepository.findAll();
    }

    public Optional<Venda> buscarPorId(Long id) {
        return vendaRepository.findById(id);
    }
}