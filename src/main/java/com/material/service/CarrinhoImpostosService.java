package com.material.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.material.dto.CarrinhoImpostosDTO;
import com.material.dto.EntradaImpostosDTO;
import com.material.model.Carrinho;
import com.material.model.CarrinhoImpostos;
import com.material.repository.CarrinhoImpostosRepository;
import com.material.repository.CarrinhoRepository;



@Service
public class CarrinhoImpostosService {
	
	
	 @Autowired
	    private CarrinhoImpostosRepository impostosRepository;

	    @Autowired
	    private CarrinhoRepository carrinhoRepository;

	    // 💾 Salva ou atualiza os impostos da nota — nunca duplica (1 nota = 1 registro de impostos)
	    @Transactional
	    public CarrinhoImpostos salvarOuAtualizar(Long carrinhoId, CarrinhoImpostosDTO dto) {
	        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
	                .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada: " + carrinhoId));

	        // Se já existe registro de impostos pra essa nota, reaproveita (evita duplicar)
	        CarrinhoImpostos impostos = impostosRepository.findByCarrinho_Id(carrinhoId)
	                .orElse(new CarrinhoImpostos());

	        impostos.setCarrinho(carrinho);
	        impostos.setBaseCalculoIcms(dto.getBaseCalculoIcms());
	        impostos.setValorIcms(dto.getValorIcms());
	        impostos.setBaseCalculoIcmsSt(dto.getBaseCalculoIcmsSt());
	        impostos.setValorIcmsSt(dto.getValorIcmsSt());
	        impostos.setValorTotalProdutos(dto.getValorTotalProdutos());
	        impostos.setValorFrete(dto.getValorFrete());
	        impostos.setValorSeguro(dto.getValorSeguro());
	        impostos.setValorDesconto(dto.getValorDesconto());
	        impostos.setOutrasDespesasAcessorias(dto.getOutrasDespesasAcessorias());
	        impostos.setValorIpi(dto.getValorIpi());
	        impostos.setValorTotalNota(dto.getValorTotalNota());

	        return impostosRepository.save(impostos);
	    }

	    public CarrinhoImpostos buscarPorCarrinho(Long carrinhoId) {
	        return impostosRepository.findByCarrinho_Id(carrinhoId)
	                .orElseThrow(() -> new RuntimeException("Nenhum imposto lançado para essa nota ainda."));
	    }
	}

	
	
	
	
