-- 💰 IMPOSTOS DA SAÍDA - VERSÃO SANEADA (LOGÍSTICA INTEGRADA)
-- RELACIONAMENTO DIRETO COM CARRINHO E REDEFINES DE CLIENTE
-- =========================================================================

CREATE TABLE carrinho_impostos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    carrinho_id BIGINT NOT NULL UNIQUE,
    
    -- 🌟 NOVO: Chave 2 do Redefines (ID do cliente PJ que está atuando como transportadora)
    transportadora_id BIGINT NULL,

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

    -- Vínculo com a tabela mestre do pedido
    CONSTRAINT fk_carrinho_impostos_carrinho
        FOREIGN KEY (carrinho_id)
        REFERENCES carrinho(id),

    -- 🌟 Vínculo do Redefines: Aponta para a tabela cliente reaproveitando a estrutura mestre
    CONSTRAINT fk_carrinho_impostos_transportadora
        FOREIGN KEY (transportadora_id)
        REFERENCES cliente(id)
);