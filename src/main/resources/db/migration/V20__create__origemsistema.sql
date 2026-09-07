CREATE TABLE origemsistema (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    inscricao_estadual VARCHAR(15) NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(80) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    -- ⚡ INCLUSÃO: Alinhado com o 'private Boolean unidadeAtiva = true;' do Java
    unidade_ativa BOOLEAN NOT NULL DEFAULT TRUE 
);
