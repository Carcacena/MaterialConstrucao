-- 2. Tabela de Itens da Venda (Guarda os produtos, preços e as quantidades fracionadas)
CREATE TABLE item_venda (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    venda_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL, -- Suporta quilos, metros ou frações (ex: 2.50)
    preco_praticado DECIMAL(10,2) NOT NULL, -- Preço do produto fixado no momento da venda
    CONSTRAINT fk_item_venda_venda FOREIGN KEY (venda_id) REFERENCES venda(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_venda_produto FOREIGN KEY (produto_id) REFERENCES produto(id)
);