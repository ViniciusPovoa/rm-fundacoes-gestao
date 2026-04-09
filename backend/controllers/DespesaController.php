<?php
require_once __DIR__ . '/../models/Despesa.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class DespesaController {
    private $despesaModel;
    private $validator;

    public function __construct() {
        $this->despesaModel = new Despesa();
        $this->validator = new Validator();
    }

    /**
     * GET /api/despesas
     * Listar todas as despesas
     */
    public function index() {
        try {
            $despesas = $this->despesaModel->getAll();
            echo Response::success($despesas, 'Despesas recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/despesas/{id}
     * Buscar uma despesa específica
     */
    public function show($id) {
        try {
            $despesa = $this->despesaModel->getById($id);
            
            if (!$despesa) {
                echo Response::notFound('Despesa não encontrada');
                return;
            }

            echo Response::success($despesa, 'Despesa recuperada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/despesas
     * Criar uma nova despesa
     */
    public function store($data) {
        try {
            $rules = [
                'obra_id' => ['required', 'numeric'],
                'tipo' => ['required'],
                'descricao' => [],
                'valor' => ['required', 'numeric'],
                'data' => ['required', 'date']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $id = $this->despesaModel->create($data);
            $despesa = $this->despesaModel->getById($id);

            echo Response::success($despesa, 'Despesa criada com sucesso', 201);
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/despesas/{id}
     * Atualizar uma despesa
     */
    public function update($id, $data) {
        try {
            $despesa = $this->despesaModel->getById($id);
            
            if (!$despesa) {
                echo Response::notFound('Despesa não encontrada');
                return;
            }

            $rules = [
                'tipo' => [],
                'descricao' => [],
                'valor' => ['numeric'],
                'data' => ['date']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $this->despesaModel->update($id, $data);
            $despesaAtualizada = $this->despesaModel->getById($id);

            echo Response::success($despesaAtualizada, 'Despesa atualizada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/despesas/{id}
     * Deletar uma despesa
     */
    public function destroy($id) {
        try {
            $despesa = $this->despesaModel->getById($id);
            
            if (!$despesa) {
                echo Response::notFound('Despesa não encontrada');
                return;
            }

            $this->despesaModel->delete($id);
            echo Response::success(null, 'Despesa deletada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/despesas/obra/{obra_id}
     * Listar despesas de uma obra
     */
    public function despesasPorObra($obra_id) {
        try {
            $despesas = $this->despesaModel->getDespesasPorObra($obra_id);
            echo Response::success($despesas, 'Despesas da obra recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/despesas/obra/{obra_id}/total
     * Obter total de despesas de uma obra
     */
    public function totalDespesasPorObra($obra_id) {
        try {
            $total = $this->despesaModel->getTotalDespesasPorObra($obra_id);
            echo Response::success(['total' => $total], 'Total de despesas recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/despesas/obra/{obra_id}/por-tipo
     * Obter despesas por tipo de uma obra
     */
    public function despesasPorTipo($obra_id) {
        try {
            $despesas = $this->despesaModel->getTotalDespesasPorTipo($obra_id);
            echo Response::success($despesas, 'Despesas por tipo recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
