<?php
require_once __DIR__ . '/BaseModel.php';

class EquipamentoObra extends BaseModel {
    protected $table = 'equipamentos_obras';

    public function create($data) {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::create($data);
    }

    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::update($id, $data);
    }

    public function getEquipamentosObraDetalhado($obra_id) {
        try {
            $sql = "SELECT eo.*, 
                           e.nome AS equipamento_nome, 
                           e.tipo AS equipamento_tipo, 
                           e.custo_uso AS equipamento_custo_uso 
                    FROM equipamentos_obras eo 
                    JOIN equipamentos e ON eo.equipamento_id = e.id 
                    WHERE eo.obra_id = ? 
                    ORDER BY e.nome ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar equipamentos da obra: ' . $e->getMessage());
        }
    }

    public function verificarVinculo($equipamento_id, $obra_id) {
        try {
            $sql = "SELECT * FROM equipamentos_obras WHERE equipamento_id = ? AND obra_id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$equipamento_id, $obra_id]);
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception('Erro ao verificar vínculo: ' . $e->getMessage());
        }
    }
}
?>
