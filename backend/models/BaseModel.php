<?php
require_once __DIR__ . '/../config/Database.php';

/**
 * Classe Base para Modelos
 * Fornece métodos comuns de CRUD para todas as entidades
 */
abstract class BaseModel {
    protected $db;
    protected $table;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    /**
     * Buscar todos os registros
     */
    public function getAll($orderBy = 'id DESC') {
        try {
            $sql = "SELECT * FROM {$this->table} ORDER BY {$orderBy}";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar registros: ' . $e->getMessage());
        }
    }

    /**
     * Buscar um registro por ID
     */
    public function getById($id) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar registro: ' . $e->getMessage());
        }
    }

    /**
     * Criar um novo registro
     */
    public function create($data) {
        try {
            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute(array_values($data));
            
            return $this->db->lastInsertId();
        } catch (Exception $e) {
            throw new Exception('Erro ao criar registro: ' . $e->getMessage());
        }
    }

    /**
     * Atualizar um registro
     */
    public function update($id, $data) {
        try {
            $setClause = implode(', ', array_map(function($key) {
                return "{$key} = ?";
            }, array_keys($data)));
            
            $values = array_values($data);
            $values[] = $id;
            
            $sql = "UPDATE {$this->table} SET {$setClause} WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            
            return $stmt->execute($values);
        } catch (Exception $e) {
            throw new Exception('Erro ao atualizar registro: ' . $e->getMessage());
        }
    }

    /**
     * Deletar um registro
     */
    public function delete($id) {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$id]);
        } catch (Exception $e) {
            throw new Exception('Erro ao deletar registro: ' . $e->getMessage());
        }
    }

    /**
     * Buscar registros com filtro
     */
    public function findBy($column, $value) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE {$column} = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$value]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar registros: ' . $e->getMessage());
        }
    }

    /**
     * Buscar um registro com filtro
     */
    public function findOneBy($column, $value) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE {$column} = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$value]);
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar registro: ' . $e->getMessage());
        }
    }

    /**
     * Contar registros
     */
    public function count() {
        try {
            $sql = "SELECT COUNT(*) as total FROM {$this->table}";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetch();
            return $result['total'] ?? 0;
        } catch (Exception $e) {
            throw new Exception('Erro ao contar registros: ' . $e->getMessage());
        }
    }
}
?>
