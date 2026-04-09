<?php
require_once __DIR__ . '/BaseModel.php';

class Obra extends BaseModel {
    protected $table = 'obras';

    public function getAll($orderBy = 'nome ASC') {
        return parent::getAll($orderBy);
    }

    public function create($data) {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::create($data);
    }

    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::update($id, $data);
    }

    public function getObrasComCliente() {
        try {
            $sql = "SELECT o.*, c.nome as cliente_nome 
                    FROM obras o 
                    JOIN clientes c ON o.cliente_id = c.id 
                    ORDER BY o.nome ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar obras com cliente: ' . $e->getMessage());
        }
    }

    public function getObraComCliente($id) {
        try {
            $sql = "SELECT o.*, c.nome as cliente_nome, c.email as cliente_email, c.telefone as cliente_telefone
                    FROM obras o 
                    JOIN clientes c ON o.cliente_id = c.id 
                    WHERE o.id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar obra: ' . $e->getMessage());
        }
    }

    public function getObrasPorCliente($cliente_id) {
        try {
            $sql = "SELECT * FROM obras WHERE cliente_id = ? ORDER BY nome ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$cliente_id]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar obras do cliente: ' . $e->getMessage());
        }
    }

    public function getObrasPorStatus($status) {
        try {
            $sql = "SELECT o.*, c.nome as cliente_nome 
                    FROM obras o 
                    JOIN clientes c ON o.cliente_id = c.id 
                    WHERE o.status = ? 
                    ORDER BY o.nome ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$status]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar obras por status: ' . $e->getMessage());
        }
    }
}
?>
