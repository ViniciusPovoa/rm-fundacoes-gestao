<?php
/**
 * Classe de Conexão com o Banco de Dados MySQL
 * Utiliza PDO para conexão segura e preparada
 */
class Database {
    private $host = 'localhost';
    private $db = 'rm_fundacoes';
    private $user = 'rm_fundacoes';
    private $password = '123456';
    private $charset = 'utf8mb4';
    private $pdo;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db};charset={$this->charset}";
            $this->pdo = new PDO($dsn, $this->user, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            die(json_encode(['error' => 'Erro ao conectar ao banco de dados: ' . $e->getMessage()]));
        }
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function query($sql) {
        return $this->pdo->query($sql);
    }

    public function prepare($sql) {
        return $this->pdo->prepare($sql);
    }

    public function execute($stmt, $params = []) {
        try {
            return $stmt->execute($params);
        } catch (PDOException $e) {
            throw new Exception('Erro ao executar query: ' . $e->getMessage());
        }
    }

    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    public function commit() {
        return $this->pdo->commit();
    }

    public function rollBack() {
        return $this->pdo->rollBack();
    }
}
?>
