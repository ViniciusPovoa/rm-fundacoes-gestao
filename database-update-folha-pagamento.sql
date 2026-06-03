CREATE TABLE IF NOT EXISTS folha_pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referencia CHAR(7) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    salario_base DECIMAL(12, 2) NOT NULL DEFAULT 0,
    metros_perfurados DECIMAL(12, 2) NOT NULL DEFAULT 0,
    valor_por_metro DECIMAL(12, 2) NOT NULL DEFAULT 0,
    valor_producao DECIMAL(12, 2) NOT NULL DEFAULT 0,
    movimentacao_diaria DECIMAL(12, 2) NOT NULL DEFAULT 0,
    dias_movimentacao INT NOT NULL DEFAULT 0,
    valor_movimentacao DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_folha DECIMAL(12, 2) NOT NULL DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_referencia (referencia),
    INDEX idx_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
