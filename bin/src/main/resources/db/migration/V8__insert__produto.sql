INSERT INTO `produto` (`id`, `nome`, `fornecedor_id`, `a_granel`, `preco_custo`, `preco_venda`, `data_validade`) 
VALUES (1, 'Chuveiro tradição 220v', 1, FALSE, 80.00, 120.00, '2026-08-15'); -- Exemplo de validade próxima

INSERT INTO `produto` (`id`, `nome`, `fornecedor_id`, `a_granel`, `preco_custo`, `preco_venda`, `data_validade`) 
VALUES (2, 'Geladeira 220', 2, FALSE, 1800.00, 2500.00, NULL); -- Eletro não tem validade (NULL)

INSERT INTO `produto` (`id`, `nome`, `fornecedor_id`, `a_granel`, `preco_custo`, `preco_venda`, `data_validade`) 
VALUES (3, 'Parafuso 3/8 sextavado', 3, TRUE, 0.10, 0.35, NULL); -- Exemplo a granel 