<?php
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/FinanceCalculator.php';

class DashboardController {
    private $financeCalculator;

    public function __construct() {
        $this->financeCalculator = new FinanceCalculator();
    }

    /**
     * GET /api/dashboard/resumo-geral
     * Obter resumo geral do dashboard
     */
    public function resumoGeral() {
        try {
            $resumo = $this->financeCalculator->calcularResumoGeral();
            echo Response::success($resumo, 'Resumo geral recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/dashboard/lucro-por-obra
     * Obter lucro por obra
     */
    public function lucroPorObra() {
        try {
            $lucros = $this->financeCalculator->calcularLucroPorObra();
            echo Response::success($lucros, 'Lucro por obra recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/dashboard/obras-status
     * Obter contagem de obras por status
     */
    public function obrasStatus() {
        try {
            $database = new \Database();
            $db = $database->getConnection();

            $sql = "SELECT status, COUNT(*) as total FROM obras GROUP BY status";
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll();

            echo Response::success($result, 'Status das obras recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/dashboard/receitas-despesas
     * Obter comparação entre receitas e despesas
     */
    public function receitasDespesas() {
        try {
            $database = new \Database();
            $db = $database->getConnection();

            $sql = "SELECT 
                    o.id,
                    o.nome,
                    COALESCE(SUM(CASE WHEN d.id IS NOT NULL THEN d.valor ELSE 0 END), 0) as total_despesas,
                    COALESCE(SUM(CASE WHEN r.id IS NOT NULL THEN r.valor ELSE 0 END), 0) as total_receitas
                    FROM obras o
                    LEFT JOIN despesas d ON o.id = d.obra_id
                    LEFT JOIN receitas r ON o.id = r.obra_id
                    GROUP BY o.id, o.nome
                    ORDER BY o.nome ASC";

            $stmt = $db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll();

            echo Response::success($result, 'Receitas e despesas recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/dashboard/despesas-por-tipo
     * Obter despesas agrupadas por tipo
     */
    public function despesasPorTipo() {
        try {
            $database = new \Database();
            $db = $database->getConnection();

            $sql = "SELECT tipo, SUM(valor) as total FROM despesas GROUP BY tipo";
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $result = $stmt->fetchAll();

            echo Response::success($result, 'Despesas por tipo recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
