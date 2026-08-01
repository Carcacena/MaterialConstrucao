CREATE TABLE conta_corrente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT, -- Nulo para vendas rápidas sem identificar o cliente no balcão
    venda_id BIGINT,
    data_movimentacao DATETIME NOT NULL,
    tipo_movimentacao VARCHAR(10) NOT NULL, -- 'ENTRADA' (venda/recebimento) ou 'SAIDA' (pagamentos)
    valor DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(255) NOT NULL, -- Ex: 'Venda ref. Cupom #12' ou 'Recebimento de conta'
    CONSTRAINT fk_conta_financeira_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT fk_conta_financeira_venda FOREIGN KEY (venda_id) REFERENCES venda(id) ON DELETE SET NULL
);