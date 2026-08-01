package com.material.service;

import com.material.model.Fornecedor;
import com.material.repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FornecedorService {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    public List<Fornecedor> listarTodos() {
        return fornecedorRepository.findAll();
    }

    public Fornecedor salvar(Fornecedor fornecedor) {
        return fornecedorRepository.save(fornecedor);
    }

    public void excluir(Long id) {
        fornecedorRepository.deleteById(id);
    }

    public Fornecedor buscarPorId(Long id) {
        return fornecedorRepository.findById(id).orElse(null);
    }
}