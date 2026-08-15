CREATE TABLE produto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    fornecedor_id BIGINT NOT NULL,
    a_granel BOOLEAN NOT NULL DEFAULT FALSE,
    preco_custo DECIMAL(10, 2),
    preco_venda DECIMAL(10, 2),
    data_validade DATE,
    CONSTRAINT fk_produto_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id)
);