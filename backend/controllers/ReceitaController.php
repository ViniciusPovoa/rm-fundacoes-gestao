<?php
require_once __DIR__ . '/../models/Receita.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class ReceitaController {
    private $receitaModel;
    private $validator;

    public function __construct() {
        $this->receitaModel = new Receita();
        $this->validator = new Validator();
    }

    /**
     * GET /api/receitas
     * Listar todas as receitas
     */
    public function index() {
        try {
            $receitas = $this->receitaModel->getAll();
            echo Response::success($receitas, 'Receitas recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/receitas/{id}
     * Buscar uma receita específica
     */
    public function show($id) {
        try {
            $receita = $this->receitaModel->getById($id);
            
            if (!$receita) {
                echo Response::notFound('Receita não encontrada');
                return;
            }

            echo Response::success($receita, 'Receita recuperada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/receitas
     * Criar uma nova receita
     */
    public function store($data) {
        try {
            $rules = [
                'obra_id' => ['required', 'numeric'],
                'valor' => ['required', 'numeric'],
                'data' => ['required', 'date'],
                'descricao' => []
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $id = $this->receitaModel->create($data);
            $receita = $this->receitaModel->getById($id);

            echo Response::success($receita, 'Receita criada com sucesso', 201);
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/receitas/{id}
     * Atualizar uma receita
     */
    public function update($id, $data) {
        try {
            $receita = $this->receitaModel->getById($id);
            
            if (!$receita) {
                echo Response::notFound('Receita não encontrada');
                return;
            }

            $rules = [
                'valor' => ['numeric'],
                'data' => ['date'],
                'descricao' => []
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $this->receitaModel->update($id, $data);
            $receitaAtualizada = $this->receitaModel->getById($id);

            echo Response::success($receitaAtualizada, 'Receita atualizada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/receitas/{id}
     * Deletar uma receita
     */
    public function destroy($id) {
        try {
            $receita = $this->receitaModel->getById($id);
            
            if (!$receita) {
                echo Response::notFound('Receita não encontrada');
                return;
            }

            $this->receitaModel->delete($id);
            echo Response::success(null, 'Receita deletada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/receitas/obra/{obra_id}
     * Listar receitas de uma obra
     */
    public function receitasPorObra($obra_id) {
        try {
            $receitas = $this->receitaModel->getReceitasPorObra($obra_id);
            echo Response::success($receitas, 'Receitas da obra recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/receitas/obra/{obra_id}/total
     * Obter total de receitas de uma obra
     */
    public function totalReceitasPorObra($obra_id) {
        try {
            $total = $this->receitaModel->getTotalReceitasPorObra($obra_id);
            echo Response::success(['total' => $total], 'Total de receitas recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
