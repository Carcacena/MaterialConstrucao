CREATE TABLE entrada_impostos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entrada_id BIGINT NOT NULL UNIQUE, 
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
    FOREIGN KEY (entrada_id) REFERENCES entrada(id)
);