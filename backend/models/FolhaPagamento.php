<?php
require_once __DIR__ . '/BaseModel.php';

class FolhaPagamento extends BaseModel {
    protected $table = 'folha_pagamentos';

    public function create($data) {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::create($data);
    }

    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        return parent::update($id, $data);
    }

    public function getPorReferencia($referencia) {
        try {
            $sql = "SELECT * FROM folha_pagamentos WHERE referencia = ? ORDER BY nome ASC, id ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$referencia]);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao buscar folha por referência: ' . $e->getMessage());
        }
    }
}
?>
