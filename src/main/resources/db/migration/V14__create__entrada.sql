-- 1. Cria o cabeçalho ligado ao Fornecedor
CREATE TABLE entrada (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_nota VARCHAR(20) NOT NULL,
    serie VARCHAR(5),
    chave_acesso VARCHAR(44) NOT NULL,
    data_recebimento DATE NOT NULL,
    fornecedor_id BIGINT NOT NULL,
    CONSTRAINT fk_entrada_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id)
);