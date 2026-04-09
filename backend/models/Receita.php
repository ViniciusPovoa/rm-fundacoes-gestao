<?php
require_once __DIR__ . '/BaseModel.php';

class Receita extends BaseModel {
    protected $table = 'receitas';

    public function create($data) {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::create($data);
    }

    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::update($id, $data);
    }

    public function getReceitasPorObra($obra_id) {
        try {
            $sql = "SELECT * FROM receitas WHERE obra_id = ? ORDER BY data DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar receitas da obra: ' . $e->getMessage());
        }
    }

    public function getTotalReceitasPorObra($obra_id) {
        try {
            $sql = "SELECT SUM(valor) as total FROM receitas WHERE obra_id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            $result = $stmt->fetch();
            return $result['total'] ?? 0;
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular total de receitas: ' . $e->getMessage());
        }
    }
}
?>
