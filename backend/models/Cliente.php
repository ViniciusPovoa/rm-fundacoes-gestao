<?php
require_once __DIR__ . '/BaseModel.php';

class Cliente extends BaseModel {
    protected $table = 'clientes';

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

    public function getClientesComObras() {
        try {
            $sql = "SELECT c.*, COUNT(o.id) as total_obras 
                    FROM clientes c 
                    LEFT JOIN obras o ON c.id = o.cliente_id 
                    GROUP BY c.id 
                    ORDER BY c.nome ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar clientes com obras: ' . $e->getMessage());
        }
    }
}
?>
