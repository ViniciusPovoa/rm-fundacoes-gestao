<?php
require_once __DIR__ . '/BaseModel.php';

class Despesa extends BaseModel {
    protected $table = 'despesas';

    public function create($data) {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::create($data);
    }

    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::update($id, $data);
    }

    public function getDespesasPorObra($obra_id) {
        try {
            $sql = "SELECT * FROM despesas WHERE obra_id = ? ORDER BY data DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar despesas da obra: ' . $e->getMessage());
        }
    }

    public function getTotalDespesasPorObra($obra_id) {
        try {
            $sql = "SELECT SUM(valor) as total FROM despesas WHERE obra_id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            $result = $stmt->fetch();
            return $result['total'] ?? 0;
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular total de despesas: ' . $e->getMessage());
        }
    }

    public function getDespesasPorTipo($obra_id, $tipo) {
        try {
            $sql = "SELECT * FROM despesas WHERE obra_id = ? AND tipo = ? ORDER BY data DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id, $tipo]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar despesas por tipo: ' . $e->getMessage());
        }
    }

    public function getTotalDespesasPorTipo($obra_id) {
        try {
            $sql = "SELECT tipo, SUM(valor) as total FROM despesas WHERE obra_id = ? GROUP BY tipo";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$obra_id]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular despesas por tipo: ' . $e->getMessage());
        }
    }
}
?>
