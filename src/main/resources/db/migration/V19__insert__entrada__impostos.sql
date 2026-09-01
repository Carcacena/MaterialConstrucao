-- Garante que só tentará inserir impostos se a subquery encontrar o ID correspondente da nota
INSERT INTO entrada_impostos (
    entrada_id, base_calculo_icms, valor_icms, base_calculo_icms_st, valor_icms_st, 
    valor_total_produtos, valor_frete, valor_seguro, valor_desconto, 
    outras_despesas_acessorias, valor_ipi, valor_total_nota
) 
SELECT id, 400.00, 72.00, 0.00, 0.00, 400.00, 15.00, 0.00, 0.00, 0.00, 0.00, 415.00 
FROM entrada WHERE numero_nota = '000123' LIMIT 1;

INSERT INTO entrada_impostos (
    entrada_id, base_calculo_icms, valor_icms, base_calculo_icms_st, valor_icms_st, 
    valor_total_produtos, valor_frete, valor_seguro, valor_desconto, 
    outras_despesas_acessorias, valor_ipi, valor_total_nota
) 
SELECT id, 0.00, 0.00, 0.00, 0.00, 150.00, 0.00, 0.00, 0.00, 0.00, 0.00, 150.00 
FROM entrada WHERE numero_nota = '019996' LIMIT 1;