<?php
require_once __DIR__ . '/../models/Despesa.php';
require_once __DIR__ . '/../models/Receita.php';

/**
 * Classe para cálculos financeiros automáticos
 */
class FinanceCalculator {
    private $despesaModel;
    private $receitaModel;

    public function __construct() {
        $this->despesaModel = new Despesa();
        $this->receitaModel = new Receita();
    }

    /**
     * Calcular resumo financeiro de uma obra
     */
    public function calcularResumoObra($obra_id) {
        $totalDespesas = $this->despesaModel->getTotalDespesasPorObra($obra_id);
        $totalReceitas = $this->receitaModel->getTotalReceitasPorObra($obra_id);
        $lucroPreju = $totalReceitas - $totalDespesas;

        return [
            'total_despesas' => (float) $totalDespesas,
            'total_receitas' => (float) $totalReceitas,
            'lucro_prejuizo' => (float) $lucroPreju,
            'margem_lucro' => $totalReceitas > 0 ? (($lucroPreju / $totalReceitas) * 100) : 0
        ];
    }

    /**
     * Calcular resumo geral de todas as obras
     */
    public function calcularResumoGeral() {
        try {
            $database = new \Database();
            $db = $database->getConnection();

            $sql = "SELECT 
                    COUNT(DISTINCT o.id) as total_obras,
                    SUM(CASE WHEN o.status = 'em_andamento' THEN 1 ELSE 0 END) as obras_em_andamento,
                    SUM(CASE WHEN o.status = 'finalizada' THEN 1 ELSE 0 END) as obras_finalizadas,
                    COALESCE(SUM(d.valor), 0) as total_despesas_geral,
                    COALESCE(SUM(r.valor), 0) as total_receitas_geral
                    FROM obras o
                    LEFT JOIN despesas d ON o.id = d.obra_id
                    LEFT JOIN receitas r ON o.id = r.obra_id";

            $stmt = $db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetch();

            $totalReceitas = (float) $result['total_receitas_geral'];
            $totalDespesas = (float) $result['total_despesas_geral'];
            $lucroTotal = $totalReceitas - $totalDespesas;

            return [
                'total_obras' => (int) $result['total_obras'],
                'obras_em_andamento' => (int) $result['obras_em_andamento'],
                'obras_finalizadas' => (int) $result['obras_finalizadas'],
                'total_despesas' => $totalDespesas,
                'total_receitas' => $totalReceitas,
                'lucro_total' => $lucroTotal,
                'margem_lucro' => $totalReceitas > 0 ? (($lucroTotal / $totalReceitas) * 100) : 0
            ];
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular resumo geral: ' . $e->getMessage());
        }
    }

    /**
     * Calcular despesas por tipo de uma obra
     */
    public function calcularDespesasPorTipo($obra_id) {
        return $this->despesaModel->getTotalDespesasPorTipo($obra_id);
    }

    /**
     * Calcular lucro por obra
     */
    public function calcularLucroPorObra() {
        try {
            $database = new \Database();
            $db = $database->getConnection();

            $sql = "SELECT 
                    o.id,
                    o.nome,
                    c.nome as cliente_nome,
                    o.status,
                    COALESCE(SUM(CASE WHEN d.id IS NOT NULL THEN d.valor ELSE 0 END), 0) as total_despesas,
                    COALESCE(SUM(CASE WHEN r.id IS NOT NULL THEN r.valor ELSE 0 END), 0) as total_receitas,
                    COALESCE(SUM(CASE WHEN r.id IS NOT NULL THEN r.valor ELSE 0 END), 0) - 
                    COALESCE(SUM(CASE WHEN d.id IS NOT NULL THEN d.valor ELSE 0 END), 0) as lucro_prejuizo
                    FROM obras o
                    LEFT JOIN clientes c ON o.cliente_id = c.id
                    LEFT JOIN despesas d ON o.id = d.obra_id
                    LEFT JOIN receitas r ON o.id = r.obra_id
                    GROUP BY o.id, o.nome, c.nome, o.status
                    ORDER BY o.nome ASC";

            $stmt = $db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular lucro por obra: ' . $e->getMessage());
        }
    }
}
?>
