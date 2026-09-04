package com.material.service;

import com.material.dto.EntradaRequestDTO;
import com.material.dto.ItemEntradaDTO;
import com.material.model.Entrada;
import com.material.model.EntradaProdutos;
import com.material.model.Fornecedor;
import com.material.model.Produto;
import com.material.repository.EntradaRepository;
import com.material.repository.FornecedorRepository;
import com.material.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class EntradaService {
	
	 @Autowired
	    private EntradaRepository entradaRepository;

	    @Autowired
	    private FornecedorRepository fornecedorRepository;

	    @Autowired
	    private ProdutoRepository produtoRepository;

	    @Autowired
	    private EntradaMovimentoService entradaMovimentoService;
 
    @Transactional
    public Entrada registrarEntrada(EntradaRequestDTO dto) {
        // 1. Localiza o Fornecedor da Nota
        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com o ID: " + dto.getFornecedorId()));

        // 2. Instancia e salva o Cabeçalho PRIMEIRO para gerar o ID no banco
        Entrada entrada = new Entrada();
        entrada.setNumeroNota(dto.getNumeroNota());
        entrada.setSerie(dto.getSerie());
        entrada.setChaveAcesso(dto.getChaveAcesso());
        entrada.setDataRecebimento(dto.getDataRecebimento());
        entrada.setFornecedor(fornecedor);
        
        // 🌟 CORREÇÃO CRÍTICA: Salva o cabeçalho imediatamente para ter o ID disponível
        entrada = entradaRepository.saveAndFlush(entrada);

        List<EntradaProdutos> itensDaEntrada = new ArrayList<>();

        // 3. Processa cada item vindo do Postman/Tela
        for (ItemEntradaDTO itemDTO : dto.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado com o ID: " + itemDTO.getProdutoId()));

            // Instancia o relacionamento do item com a nota
            EntradaProdutos itemEntrada = new EntradaProdutos();
            itemEntrada.setEntrada(entrada); // 🌟 Aqui o ID da nota já existe e não é nulo!
            itemEntrada.setProduto(produto);
            itemEntrada.setQuantidade(itemDTO.getQuantidade());
            itemEntrada.setPrecoCusto(itemDTO.getPrecoCusto());
            itensDaEntrada.add(itemEntrada);

            // 4. ATUALIZAÇÃO DO ESTOQUE DO PRODUTO
            produto.setPrecoCusto(itemDTO.getPrecoCusto()); // Atualiza o custo com o valor da nota

            // No seu banco, aGranel usa '0' ou '1'. No Java tratamos como Boolean.
            if (Boolean.TRUE.equals(produto.getAGranel())) {
                BigDecimal qtdAdicionar = BigDecimal.valueOf(itemDTO.getQuantidade());
                produto.setEstoque(produto.getEstoque().add(qtdAdicionar));
            } else {
                produto.setQteEntrada(itemDTO.getQuantidade());
                produto.setEstoqueAtual(produto.getEstoqueAtual() + itemDTO.getQuantidade());
            }

            // Salva a atualização de estoque no produto
            produtoRepository.save(produto);
        }

        // Associa a lista de itens criados à entrada
        //entrada.setItens(itensDaEntrada);

        // Salva novamente para consolidar os itens (CascadeType.ALL cuidará de gravar na tabela entrada_produtos)
        //return entradaRepository.save(entrada);
        
        entrada.setItens(itensDaEntrada);

        Entrada entradaSalva = entradaRepository.save(entrada);

        // 📚 Guarda no histórico: STATUS 1 = ENTRADA
        entradaMovimentoService.registrarEntrada(entradaSalva);

        return entradaSalva;
        
        
        
        
        
        
        
    }
    
    @Transactional
    public Entrada devolverNota(String numeroNota) {

        // 1. Localiza a nota
        Entrada entrada = entradaRepository.findByNumeroNota(numeroNota)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Nota Fiscal nº " + numeroNota + " não encontrada."
                        ));

        // 2. Impede estorno duplicado
        if (Integer.valueOf(2).equals(entrada.getStatus())) {
            throw new RuntimeException(
                    "A Nota Fiscal nº " + numeroNota + " já foi devolvida."
            );
        }

        // 3. Percorre os produtos desta entrada
        for (EntradaProdutos item : entrada.getItens()) {

            Produto produto = item.getProduto();
            int quantidade = item.getQuantidade();

            // PRODUTO A GRANEL
            if (Boolean.TRUE.equals(produto.getAGranel())) {

                BigDecimal qtdDevolver =
                        BigDecimal.valueOf(quantidade);

                BigDecimal estoqueAtual =
                        produto.getEstoque() == null
                                ? BigDecimal.ZERO
                                : produto.getEstoque();

                if (estoqueAtual.compareTo(qtdDevolver) < 0) {
                    throw new RuntimeException(
                            "Estoque insuficiente para devolver o produto: "
                                    + produto.getNome()
                    );
                }

                produto.setEstoque(
                        estoqueAtual.subtract(qtdDevolver)
                );

            } else {

                // PRODUTO NORMAL
                if (produto.getEstoqueAtual() < quantidade) {
                    throw new RuntimeException(
                            "Estoque insuficiente para devolver o produto: "
                                    + produto.getNome()
                    );
                }

                produto.setEstoqueAtual(
                        produto.getEstoqueAtual() - quantidade
                );
            }

            produtoRepository.save(produto);
        }

        // 4. Marca a nota como devolvida
        entrada.setStatus(2);

        // 5. Preserva a entrada no histórico
        return entradaRepository.save(entrada);
    }
    
    
    
    
    
    
}