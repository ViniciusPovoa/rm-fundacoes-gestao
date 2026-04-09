<?php
require_once __DIR__ . '/BaseModel.php';

class Servico extends BaseModel {
    protected $table = 'servicos';

    public function create($data) {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::create($data);
    }

    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::update($id, $data);
    }

    public function getServicosPorObra($obra_id) {
        try {
            $sql = "SELECT * FROM servicos WHERE obra_id = ? ORDER BY tipo ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar serviços da obra: ' . $e->getMessage());
        }
    }

    public function getTotalServicosPorObra($obra_id) {
        try {
            $sql = "SELECT 
                    SUM(valor_previsto) as total_previsto,
                    SUM(valor_realizado) as total_realizado
                    FROM servicos 
                    WHERE obra_id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            return $stmt->fetch();
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular total de serviços: ' . $e->getMessage());
        }
    }
}
?>
