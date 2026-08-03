INSERT INTO `produto` (`id`, `nome`, `fornecedor_id`, `a_granel`, `preco_custo`, `preco_venda`, `data_validade`, `qte_entrada`, `estoque_atual`) 
VALUES (1, 'Chuveiro tradição 220v', 1, FALSE, 80.00, 120.00, '2026-08-15', 10, 10); 
-- Exemplo: Entraram 10 chuveiros e o estoque atual é 10

INSERT INTO `produto` (`id`, `nome`, `fornecedor_id`, `a_granel`, `preco_custo`, `preco_venda`, `data_validade`, `qte_entrada`, `estoque_atual`) 
VALUES (2, 'Geladeira 220', 2, FALSE, 1800.00, 2500.00, NULL, 5, 5); 
-- Exemplo: Entraram 5 geladeiras e o estoque atual é 5

INSERT INTO `produto` (`id`, `nome`, `fornecedor_id`, `a_granel`, `preco_custo`, `preco_venda`, `data_validade`, `qte_entrada`, `estoque_atual`) 
VALUES (3, 'Parafuso 3/8 sextavado', 3, TRUE, 0.10, 0.35, NULL, 500, 500); 
-- Exemplo: Entraram 500 parafusos a granel e o estoque atual é 500