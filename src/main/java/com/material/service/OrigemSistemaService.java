package com.material.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.material.model.OrigemSistema;
import com.material.repository.OrigemSistemaRepository;

@Service
public class OrigemSistemaService {
	
	
    @Autowired
    private OrigemSistemaRepository repository; // 💡 Pente fino: Mantido apenas um repositório limpo

    // 🌟 NOVO MÉTODO COMPROMISSO: Busca sempre os dados da empresa única (ID 1) para os relatórios
    public OrigemSistema obterDadosEmpresa() {
        return repository.findById(1L).orElse(new OrigemSistema());
    }

    public List<OrigemSistema> listarTodos() {
        return repository.findAll();
    }

    public OrigemSistema salvar(OrigemSistema origemsistema) {
        // 💡 Trava Inteligente: Força a salvar sempre no ID 1 para o cliente nunca duplicar a própria empresa
        origemsistema.setId(1L); 
        return repository.save(origemsistema);
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