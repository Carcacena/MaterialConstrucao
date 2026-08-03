CREATE TABLE venda (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    data_venda DATETIME NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL, -- EX: 'DINHEIRO', 'PIX', 'CREDIARIO'
    CONSTRAINT fk_venda_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT fk_venda_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
