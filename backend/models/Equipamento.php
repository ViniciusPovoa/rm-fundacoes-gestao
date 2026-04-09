<?php
require_once __DIR__ . '/BaseModel.php';

class Equipamento extends BaseModel {
    protected $table = 'equipamentos';

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

    public function getEquipamentosPorObra($obra_id) {
        try {
            $sql = "SELECT e.*, eo.data_inicio, eo.data_fim 
                    FROM equipamentos e 
                    JOIN equipamentos_obras eo ON e.id = eo.equipamento_id 
                    WHERE eo.obra_id = ? 
                    ORDER BY e.nome ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar equipamentos da obra: ' . $e->getMessage());
        }
    }

    public function getEquipamentosDisponiveis() {
        try {
            $sql = "SELECT * FROM equipamentos ORDER BY nome ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar equipamentos disponíveis: ' . $e->getMessage());
        }
    }
}
?>
