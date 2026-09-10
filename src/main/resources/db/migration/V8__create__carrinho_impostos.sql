-- ==========================================================
-- 💰 IMPOSTOS DA SAÍDA
-- RELACIONAMENTO DIRETO COM CARRINHO
-- ==========================================================

CREATE TABLE carrinho_impostos (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    carrinho_id BIGINT NOT NULL UNIQUE,

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

    valor_total_pedido DECIMAL(12,2),

    CONSTRAINT fk_carrinho_impostos_carrinho
        FOREIGN KEY (carrinho_id)
        REFERENCES carrinho(id)
);