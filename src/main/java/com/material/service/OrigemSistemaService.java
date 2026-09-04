package com.material.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.material.model.OrigemSistema;
import com.material.repository.OrigemSistemaRepository;

@Service
public class OrigemSistemaService {
	
	@Autowired
    private OrigemSistemaRepository origemsistemaRepository;

    @Autowired
    private OrigemSistemaRepository repository;

    public List<OrigemSistema> listarTodos() {
        return origemsistemaRepository.findAll();
    }

    public OrigemSistema salvar(OrigemSistema origemsistema) {
        return origemsistemaRepository.save(origemsistema);
    }
    public OrigemSistema atualizar(Long id, OrigemSistema atualizado) {
        return repository.findById(id).map(origemsistema -> {
            origemsistema.setNome(atualizado.getNome());
            origemsistema.setCnpj(atualizado.getCnpj());
            origemsistema.setInscricaoEstadual(atualizado.getInscricaoEstadual());
            origemsistema.setEmail(atualizado.getEmail());
            origemsistema.setTelefone(atualizado.getTelefone());
            origemsistema.setCep(atualizado.getCep());
            origemsistema.setLogradouro(atualizado.getLogradouro());
            origemsistema.setNumero(atualizado.getNumero());
            origemsistema.setComplemento(atualizado.getComplemento());
            origemsistema.setBairro(atualizado.getBairro());
            origemsistema.setCidade(atualizado.getCidade());
            origemsistema.setUf(atualizado.getUf());
            return repository.save(origemsistema);
        }).orElseThrow(() -> new RuntimeException("Origem Sistema não encontrado com o ID: " + id));
    }
    
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Origem Sistema não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }

}
