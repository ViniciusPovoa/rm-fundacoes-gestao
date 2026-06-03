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

    private function getDatabaseConnection() {
        $database = new \Database();
        return $database->getConnection();
    }

    private function getPeriodRanges($period) {
        $today = new DateTimeImmutable('today');

        switch ($period) {
            case 'semana':
                $days = 7;
                break;
            case 'trimestre':
                $days = 90;
                break;
            case 'ano':
                $days = 365;
                break;
            case 'mes':
            default:
                $days = 30;
                break;
        }

        $currentStart = $today->sub(new DateInterval('P' . ($days - 1) . 'D'));
        $currentEnd = $today;
        $previousEnd = $currentStart->sub(new DateInterval('P1D'));
        $previousStart = $previousEnd->sub(new DateInterval('P' . ($days - 1) . 'D'));

        return [
            'current_start' => $currentStart->format('Y-m-d'),
            'current_end' => $currentEnd->format('Y-m-d'),
            'previous_start' => $previousStart->format('Y-m-d'),
            'previous_end' => $previousEnd->format('Y-m-d'),
        ];
    }

    private function calculatePercentageChange($currentValue, $previousValue) {
        $current = (float) $currentValue;
        $previous = (float) $previousValue;

        if (abs($previous) < 0.00001) {
            return abs($current) < 0.00001 ? 0.0 : 100.0;
        }

        return (($current - $previous) / abs($previous)) * 100;
    }

    private function getTotalByDateRange($table, $startDate, $endDate) {
        $db = $this->getDatabaseConnection();
        $sql = "SELECT COALESCE(SUM(valor), 0) as total FROM {$table} WHERE data BETWEEN ? AND ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$startDate, $endDate]);
        $result = $stmt->fetch();

        return (float) ($result['total'] ?? 0);
    }

    private function getObrasEmAndamentoAtDate($endDate) {
        $db = $this->getDatabaseConnection();
        $sql = "SELECT COUNT(*) as total FROM obras WHERE status = 'em_andamento' AND DATE(created_at) <= ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$endDate]);
        $result = $stmt->fetch();

        return (int) ($result['total'] ?? 0);
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

    public function calcularResumoPeriodo($period) {
        $ranges = $this->getPeriodRanges($period);

        $totalReceitasAtual = $this->getTotalByDateRange('receitas', $ranges['current_start'], $ranges['current_end']);
        $totalReceitasAnterior = $this->getTotalByDateRange('receitas', $ranges['previous_start'], $ranges['previous_end']);
        $totalDespesasAtual = $this->getTotalByDateRange('despesas', $ranges['current_start'], $ranges['current_end']);
        $totalDespesasAnterior = $this->getTotalByDateRange('despesas', $ranges['previous_start'], $ranges['previous_end']);

        $lucroAtual = $totalReceitasAtual - $totalDespesasAtual;
        $lucroAnterior = $totalReceitasAnterior - $totalDespesasAnterior;

        $obrasAtual = $this->getObrasEmAndamentoAtDate($ranges['current_end']);
        $obrasAnterior = $this->getObrasEmAndamentoAtDate($ranges['previous_end']);

        return [
            'total_receitas' => $totalReceitasAtual,
            'total_despesas' => $totalDespesasAtual,
            'lucro_total' => $lucroAtual,
            'obras_em_andamento' => $obrasAtual,
            'margem_lucro' => $totalReceitasAtual > 0 ? (($lucroAtual / $totalReceitasAtual) * 100) : 0,
            'anteriores' => [
                'total_receitas' => $totalReceitasAnterior,
                'total_despesas' => $totalDespesasAnterior,
                'lucro_total' => $lucroAnterior,
                'obras_em_andamento' => $obrasAnterior,
            ],
            'comparativos' => [
                'total_receitas' => $this->calculatePercentageChange($totalReceitasAtual, $totalReceitasAnterior),
                'total_despesas' => $this->calculatePercentageChange($totalDespesasAtual, $totalDespesasAnterior),
                'lucro_total' => $this->calculatePercentageChange($lucroAtual, $lucroAnterior),
                'obras_em_andamento' => $this->calculatePercentageChange($obrasAtual, $obrasAnterior),
            ],
            'periodo' => $ranges,
        ];
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
    public function calcularLucroPorObra($period = null) {
        try {
            $db = $this->getDatabaseConnection();
            $params = [];
            $despesasAtualWhere = '';
            $receitasAtualWhere = '';
            $despesasAnteriorWhere = '';
            $receitasAnteriorWhere = '';

            if ($period) {
                $ranges = $this->getPeriodRanges($period);
                $despesasAtualWhere = 'WHERE data BETWEEN ? AND ?';
                $receitasAtualWhere = 'WHERE data BETWEEN ? AND ?';
                $despesasAnteriorWhere = 'WHERE data BETWEEN ? AND ?';
                $receitasAnteriorWhere = 'WHERE data BETWEEN ? AND ?';
                $params = [
                    $ranges['current_start'], $ranges['current_end'],
                    $ranges['current_start'], $ranges['current_end'],
                    $ranges['previous_start'], $ranges['previous_end'],
                    $ranges['previous_start'], $ranges['previous_end'],
                ];
            }

            $sql = "SELECT 
                    o.id,
                    o.nome,
                    c.nome as cliente_nome,
                    o.status,
                    COALESCE(d_atual.total_despesas, 0) as total_despesas,
                    COALESCE(r_atual.total_receitas, 0) as total_receitas,
                    COALESCE(r_atual.total_receitas, 0) - COALESCE(d_atual.total_despesas, 0) as lucro_prejuizo,
                    COALESCE(d_anterior.total_despesas, 0) as total_despesas_anterior,
                    COALESCE(r_anterior.total_receitas, 0) as total_receitas_anterior,
                    COALESCE(r_anterior.total_receitas, 0) - COALESCE(d_anterior.total_despesas, 0) as lucro_prejuizo_anterior
                    FROM obras o
                    LEFT JOIN clientes c ON o.cliente_id = c.id
                    LEFT JOIN (
                        SELECT obra_id, SUM(valor) as total_despesas
                        FROM despesas
                        {$despesasAtualWhere}
                        GROUP BY obra_id
                    ) d_atual ON o.id = d_atual.obra_id
                    LEFT JOIN (
                        SELECT obra_id, SUM(valor) as total_receitas
                        FROM receitas
                        {$receitasAtualWhere}
                        GROUP BY obra_id
                    ) r_atual ON o.id = r_atual.obra_id
                    LEFT JOIN (
                        SELECT obra_id, SUM(valor) as total_despesas
                        FROM despesas
                        {$despesasAnteriorWhere}
                        GROUP BY obra_id
                    ) d_anterior ON o.id = d_anterior.obra_id
                    LEFT JOIN (
                        SELECT obra_id, SUM(valor) as total_receitas
                        FROM receitas
                        {$receitasAnteriorWhere}
                        GROUP BY obra_id
                    ) r_anterior ON o.id = r_anterior.obra_id
                    ORDER BY o.nome ASC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();

            return array_map(function ($row) {
                $receitasAtual = (float) ($row['total_receitas'] ?? 0);
                $despesasAtual = (float) ($row['total_despesas'] ?? 0);
                $lucroAtual = (float) ($row['lucro_prejuizo'] ?? 0);
                $receitasAnterior = (float) ($row['total_receitas_anterior'] ?? 0);
                $despesasAnterior = (float) ($row['total_despesas_anterior'] ?? 0);
                $lucroAnterior = (float) ($row['lucro_prejuizo_anterior'] ?? 0);

                $row['variacao_receitas'] = $this->calculatePercentageChange($receitasAtual, $receitasAnterior);
                $row['variacao_despesas'] = $this->calculatePercentageChange($despesasAtual, $despesasAnterior);
                $row['variacao_lucro'] = $this->calculatePercentageChange($lucroAtual, $lucroAnterior);

                return $row;
            }, $rows);
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular lucro por obra: ' . $e->getMessage());
        }
    }

    public function calcularReceitasDespesasPorObra($period = null) {
        try {
            $db = $this->getDatabaseConnection();
            $params = [];
            $despesasWhere = '';
            $receitasWhere = '';

            if ($period) {
                $ranges = $this->getPeriodRanges($period);
                $despesasWhere = 'WHERE data BETWEEN ? AND ?';
                $receitasWhere = 'WHERE data BETWEEN ? AND ?';
                $params = [
                    $ranges['current_start'], $ranges['current_end'],
                    $ranges['current_start'], $ranges['current_end'],
                ];
            }

            $sql = "SELECT 
                    o.id,
                    o.nome,
                    COALESCE(d.total_despesas, 0) as total_despesas,
                    COALESCE(r.total_receitas, 0) as total_receitas
                    FROM obras o
                    LEFT JOIN (
                        SELECT obra_id, SUM(valor) as total_despesas
                        FROM despesas
                        {$despesasWhere}
                        GROUP BY obra_id
                    ) d ON o.id = d.obra_id
                    LEFT JOIN (
                        SELECT obra_id, SUM(valor) as total_receitas
                        FROM receitas
                        {$receitasWhere}
                        GROUP BY obra_id
                    ) r ON o.id = r.obra_id
                    ORDER BY o.nome ASC";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (Exception $e) {
            throw new Exception('Erro ao calcular receitas e despesas por obra: ' . $e->getMessage());
        }
    }
}
?>
