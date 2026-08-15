DROP PROCEDURE IF EXISTS AdicionarColunaEstoque;

DELIMITER //

CREATE PROCEDURE AdicionarColunaEstoque()
BEGIN
    -- Verifica se a coluna estoque NÃO existe na tabela produto
    IF NOT EXISTS (
        SELECT * 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'produto' 
          AND COLUMN_NAME = 'estoque'
    ) THEN
        -- Se não existir, executa a alteração com segurança
        ALTER TABLE produto ADD COLUMN estoque DECIMAL(10,3) NOT NULL DEFAULT 0.000;
    END IF;
END //

DELIMITER ;

-- Executa a rotina
CALL AdicionarColunaEstoque();

-- Limpa a rotina da memoria do banco
DROP PROCEDURE IF EXISTS AdicionarColunaEstoque;