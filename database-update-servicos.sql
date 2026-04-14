ALTER TABLE servicos
    ADD COLUMN unidade VARCHAR(20) NOT NULL DEFAULT 'UN' AFTER descricao,
    ADD COLUMN quantidade DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER unidade,
    ADD COLUMN preco_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER quantidade;

UPDATE servicos
SET
    unidade = COALESCE(NULLIF(unidade, ''), 'UN'),
    quantidade = CASE
        WHEN quantidade IS NULL OR quantidade = 0 THEN 1
        ELSE quantidade
    END,
    preco_unitario = CASE
        WHEN preco_unitario IS NULL OR preco_unitario = 0 THEN valor_previsto
        ELSE preco_unitario
    END,
    valor_previsto = ROUND(
        CASE
            WHEN (CASE WHEN quantidade IS NULL OR quantidade = 0 THEN 1 ELSE quantidade END) > 0
                THEN (CASE WHEN preco_unitario IS NULL OR preco_unitario = 0 THEN valor_previsto ELSE preco_unitario END)
                     * (CASE WHEN quantidade IS NULL OR quantidade = 0 THEN 1 ELSE quantidade END)
            ELSE valor_previsto
        END,
        2
    );
