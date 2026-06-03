CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    nome VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO usuarios (username, nome, password_hash, ativo)
VALUES ('romulo', 'Rômulo', '$2y$10$lebIClXLe4sV9OaAnsZYAO2.U.vC2k.pA5n0ARg1GbUwpHb9ewHvm', 1)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    password_hash = VALUES(password_hash),
    ativo = VALUES(ativo);
