package com.material.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.material.model.OrigemSistema;
import com.material.repository.OrigemSistemaRepository;

@CrossOrigin("*") 
@RestController
@RequestMapping("/api/origemsistema")
public class OrigemSistemaController {
	
	@Autowired
	private OrigemSistemaRepository origemsistemaRepository;

	@GetMapping
	public ResponseEntity<List<OrigemSistema>> listar() {
		return ResponseEntity.ok(origemsistemaRepository.findAll());
	}

	@PostMapping
	@Transactional
	public ResponseEntity<OrigemSistema> cadastrar(@RequestBody OrigemSistema origemsistema) {
		// ⚡ REGRA DE OURO: Se este cadastro for a origem física ativa, desmarca as outras
		if (origemsistema.getOrigemSistema() != null && origemsistema.getOrigemSistema()) {
			desmarcarOutrasOrigens(null);
		}
		
		return ResponseEntity.ok(origemsistemaRepository.save(origemsistema));
	}

	@PutMapping("/{id}")
	@Transactional
	public ResponseEntity<OrigemSistema> atualizar(
			@PathVariable Long id,
			@RequestBody OrigemSistema fornecedorDados) {

		return origemsistemaRepository.findById(id)
				.map(origemsistema -> {

					// CPF/CNPJ NÃO ALTERA - permanece o que já está no banco

					origemsistema.setNome(fornecedorDados.getNome());
					origemsistema.setInscricaoEstadual(fornecedorDados.getInscricaoEstadual());
					origemsistema.setEmail(fornecedorDados.getEmail());
					origemsistema.setTelefone(fornecedorDados.getTelefone());
					origemsistema.setCep(fornecedorDados.getCep());
					origemsistema.setUf(fornecedorDados.getUf());
					origemsistema.setLogradouro(fornecedorDados.getLogradouro());
					origemsistema.setNumero(fornecedorDados.getNumero());
					origemsistema.setComplemento(fornecedorDados.getComplemento());
					origemsistema.setBairro(fornecedorDados.getBairro());
					origemsistema.setCidade(fornecedorDados.getCidade());
					origemsistema.setUnidadeAtiva(fornecedorDados.getUnidadeAtiva());
					
					// ⚡ ATUALIZAÇÃO DA ORIGEM: Atualiza o status vindo da tela
					origemsistema.setOrigemSistema(fornecedorDados.getOrigemSistema());

					// ⚡ REGRA DE OURO: Se foi alterado para ser a origem ativa, limpa os outros
					if (origemsistema.getOrigemSistema() != null && origemsistema.getOrigemSistema()) {
						desmarcarOutrasOrigens(id);
					}

					OrigemSistema atualizado = origemsistemaRepository.save(origemsistema);
					return ResponseEntity.ok(atualizado);
				})
				.orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> excluir(@PathVariable Long id) {
		OrigemSistema origem = origemsistemaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Origem Sistema não encontrado"));

		origemsistemaRepository.delete(origem);
		return ResponseEntity.noContent().build();
	}

	/**
	 * ⚡ MÉTODO AUXILIAR: Varre o banco de dados desmarcando qualquer outra linha 
	 * que estivesse configurada como origem ativa do sistema.
	 */
	private void desmarcarOutrasOrigens(Long idAtual) {
		List<OrigemSistema> listaCompleta = origemsistemaRepository.findAll();
		for (OrigemSistema os : listaCompleta) {
			// Se for cadastro novo (idAtual é null) ou se for um ID diferente do que estamos editando
			if (idAtual == null || !os.getId().equals(idAtual)) {
				if (os.getOrigemSistema() != null && os.getOrigemSistema()) {
					os.setOrigemSistema(false);
					origemsistemaRepository.save(os);
				}
			}
		}
	}
}