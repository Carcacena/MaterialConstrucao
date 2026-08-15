CREATE TABLE carrinho ( 
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    numero_pedido VARCHAR(20) NOT NULL, -- 🔥 O coração do controle de cupons isolados! 
    cliente_id BIGINT NOT NULL, 
    produto_id BIGINT NOT NULL, 
    quantidade DECIMAL(10,3) NOT NULL, 
    preco_praticado DECIMAL(10,2) NOT NULL, 
    status INT NOT NULL DEFAULT 1, 
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_carrinho_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id), 
    CONSTRAINT fk_carrinho_produto FOREIGN KEY (produto_id) REFERENCES produto(id) 
);