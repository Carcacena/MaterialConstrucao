CREATE TABLE entrada_impostos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entrada_id BIGINT NOT NULL UNIQUE,
    transportadora_id BIGINT NULL, -- ID do fornecedor PJ que está atuando como transportadora
    base_calculo_icms DECIMAL(12,2),
    valor_icms DECIMAL(12,2),
    base_calculo_icms_st DECIMAL(12,2),
    valor_icms_st DECIMAL(12,2),
    valor_total_produtos DECIMAL(12,2),
    valor_frete DECIMAL(12,2),
    valor_seguro DECIMAL(12,2),
    valor_desconto DECIMAL(12,2),
    outras_despesas_acessorias DECIMAL(12,2),
    valor_ipi DECIMAL(12,2),
    valor_total_nota DECIMAL(12,2),
    
    -- Vínculo com a tabela mestre do pedido
    CONSTRAINT fk_entrada_impostos_entrada 
        FOREIGN KEY (entrada_id) REFERENCES entrada(id),
        
    -- Vínculo do Redefines: Aponta para a tabela correta de fornecedroc/parceiros
    CONSTRAINT fk_entrada_impostos_transportadora 
        FOREIGN KEY (transportadora_id) REFERENCES fornecedor(id) -- ⚠️ Ajuste 'fornecedor' para o nome real da sua tabela
);