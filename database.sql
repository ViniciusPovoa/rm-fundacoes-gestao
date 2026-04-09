-- ============================================================================
-- RM FUNDAÇÕES - SISTEMA DE GESTÃO DE OBRAS
-- Banco de Dados MySQL - Modelo Relacional Completo
-- ============================================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS rm_fundacoes;
USE rm_fundacoes;

-- ============================================================================
-- TABELA: CLIENTES
-- ============================================================================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    documento VARCHAR(20) UNIQUE,
    endereco TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_documento (documento),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: OBRAS
-- ============================================================================
CREATE TABLE obras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cliente_id INT NOT NULL,
    localizacao TEXT,
    data_inicio DATE,
    data_fim DATE,
    status ENUM('planejamento', 'em_andamento', 'finalizada') DEFAULT 'planejamento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: SERVIÇOS
-- ============================================================================
CREATE TABLE servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_previsto DECIMAL(12, 2) NOT NULL DEFAULT 0,
    valor_realizado DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
    INDEX idx_obra_id (obra_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: DESPESAS
-- ============================================================================
CREATE TABLE despesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT NOT NULL,
    tipo ENUM('material', 'mao_de_obra', 'equipamento', 'outro') NOT NULL,
    descricao TEXT,
    valor DECIMAL(12, 2) NOT NULL,
    data DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
    INDEX idx_obra_id (obra_id),
    INDEX idx_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: RECEITAS
-- ============================================================================
CREATE TABLE receitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
    INDEX idx_obra_id (obra_id),
    INDEX idx_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: EQUIPAMENTOS
-- ============================================================================
CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    custo_uso DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: EQUIPAMENTOS_OBRAS (Relacionamento M:N)
-- ============================================================================
CREATE TABLE equipamentos_obras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    obra_id INT NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
    UNIQUE KEY unique_equipamento_obra (equipamento_id, obra_id),
    INDEX idx_obra_id (obra_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DADOS DE EXEMPLO
-- ============================================================================

-- Inserir clientes de exemplo
INSERT INTO clientes (nome, telefone, email, documento, endereco) VALUES
('Construtora Silva LTDA', '(11) 3000-0001', 'contato@construtora-silva.com.br', '12.345.678/0001-90', 'Rua das Flores, 100, São Paulo - SP'),
('João da Silva', '(11) 98765-4321', 'joao@email.com', '123.456.789-10', 'Avenida Paulista, 1000, São Paulo - SP'),
('Empresa de Construção XYZ', '(21) 3333-3333', 'contato@xyz.com.br', '98.765.432/0001-10', 'Rua Principal, 500, Rio de Janeiro - RJ');

-- Inserir obras de exemplo
INSERT INTO obras (nome, cliente_id, localizacao, data_inicio, data_fim, status) VALUES
('Fundação Prédio Comercial', 1, 'Rua das Flores, 100, São Paulo - SP', '2024-01-15', '2024-06-30', 'em_andamento'),
('Estacas Residencial', 2, 'Avenida Paulista, 1000, São Paulo - SP', '2024-02-01', '2024-05-15', 'em_andamento'),
('Sondagem de Solo', 3, 'Rua Principal, 500, Rio de Janeiro - RJ', '2024-03-01', '2024-04-30', 'finalizada');

-- Inserir serviços de exemplo
INSERT INTO servicos (obra_id, tipo, descricao, valor_previsto, valor_realizado) VALUES
(1, 'Estaca Hélice Contínua', 'Execução de 50 estacas hélice contínua', 150000.00, 145000.00),
(1, 'Sondagem', 'Sondagem de solo para análise geotécnica', 25000.00, 24000.00),
(2, 'Estaca Raiz', 'Execução de 30 estacas raiz', 90000.00, 88000.00),
(3, 'Sondagem Profunda', 'Sondagem profunda até 50 metros', 35000.00, 35000.00);

-- Inserir despesas de exemplo
INSERT INTO despesas (obra_id, tipo, descricao, valor, data) VALUES
(1, 'material', 'Aço para armação', 45000.00, '2024-01-20'),
(1, 'mao_de_obra', 'Mão de obra - 20 dias', 30000.00, '2024-02-01'),
(1, 'equipamento', 'Aluguel de equipamento - 30 dias', 15000.00, '2024-02-15'),
(2, 'material', 'Cimento e agregados', 25000.00, '2024-02-05'),
(2, 'mao_de_obra', 'Mão de obra - 15 dias', 22000.00, '2024-02-10'),
(3, 'equipamento', 'Aluguel de sonda de perfuração', 20000.00, '2024-03-05');

-- Inserir receitas de exemplo
INSERT INTO receitas (obra_id, valor, data, descricao) VALUES
(1, 80000.00, '2024-02-01', 'Adiantamento cliente'),
(1, 100000.00, '2024-04-01', 'Pagamento parcial'),
(2, 50000.00, '2024-02-15', 'Adiantamento cliente'),
(2, 60000.00, '2024-04-15', 'Pagamento parcial'),
(3, 35000.00, '2024-04-01', 'Pagamento completo');

-- Inserir equipamentos de exemplo
INSERT INTO equipamentos (nome, tipo, custo_uso) VALUES
('Escavadeira CAT 320', 'Escavadeira', 5000.00),
('Sonda de Perfuração', 'Sonda', 8000.00),
('Betoneira 400L', 'Betoneira', 1500.00),
('Compressor de Ar', 'Compressor', 2000.00),
('Grua Móvel 50T', 'Grua', 12000.00);

-- Inserir equipamentos vinculados a obras
INSERT INTO equipamentos_obras (equipamento_id, obra_id, data_inicio, data_fim) VALUES
(1, 1, '2024-01-15', '2024-06-30'),
(2, 3, '2024-03-01', '2024-04-30'),
(3, 1, '2024-01-15', '2024-06-30'),
(4, 2, '2024-02-01', '2024-05-15'),
(5, 1, '2024-02-01', '2024-04-30');

-- ============================================================================
-- VIEWS ÚTEIS PARA CÁLCULOS FINANCEIROS
-- ============================================================================

-- View: Resumo Financeiro por Obra
CREATE VIEW vw_resumo_financeiro_obras AS
SELECT 
    o.id,
    o.nome,
    c.nome as cliente_nome,
    o.status,
    COALESCE(SUM(CASE WHEN d.id IS NOT NULL THEN d.valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN r.id IS NOT NULL THEN r.valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN r.id IS NOT NULL THEN r.valor ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN d.id IS NOT NULL THEN d.valor ELSE 0 END), 0) as lucro_prejuizo
FROM obras o
LEFT JOIN clientes c ON o.cliente_id = c.id
LEFT JOIN despesas d ON o.id = d.obra_id
LEFT JOIN receitas r ON o.id = r.obra_id
GROUP BY o.id, o.nome, c.nome, o.status;

-- View: Resumo Geral de Financeiro
CREATE VIEW vw_resumo_geral_financeiro AS
SELECT 
    COUNT(DISTINCT o.id) as total_obras,
    SUM(CASE WHEN o.status = 'em_andamento' THEN 1 ELSE 0 END) as obras_em_andamento,
    SUM(CASE WHEN o.status = 'finalizada' THEN 1 ELSE 0 END) as obras_finalizadas,
    COALESCE(SUM(d.valor), 0) as total_despesas_geral,
    COALESCE(SUM(r.valor), 0) as total_receitas_geral,
    COALESCE(SUM(r.valor), 0) - COALESCE(SUM(d.valor), 0) as lucro_total
FROM obras o
LEFT JOIN despesas d ON o.id = d.obra_id
LEFT JOIN receitas r ON o.id = r.obra_id;
