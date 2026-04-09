<?php
require_once __DIR__ . '/../models/Equipamento.php';
require_once __DIR__ . '/../models/EquipamentoObra.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class EquipamentoController {
    private $equipamentoModel;
    private $equipamentoObraModel;
    private $validator;

    public function __construct() {
        $this->equipamentoModel = new Equipamento();
        $this->equipamentoObraModel = new EquipamentoObra();
        $this->validator = new Validator();
    }

    /**
     * GET /api/equipamentos
     * Listar todos os equipamentos
     */
    public function index() {
        try {
            $equipamentos = $this->equipamentoModel->getAll();
            echo Response::success($equipamentos, 'Equipamentos recuperados com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/equipamentos/{id}
     * Buscar um equipamento específico
     */
    public function show($id) {
        try {
            $equipamento = $this->equipamentoModel->getById($id);
            
            if (!$equipamento) {
                echo Response::notFound('Equipamento não encontrado');
                return;
            }

            echo Response::success($equipamento, 'Equipamento recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/equipamentos
     * Criar um novo equipamento
     */
    public function store($data) {
        try {
            $rules = [
                'nome' => ['required', 'min:3', 'max:255'],
                'tipo' => ['required'],
                'custo_uso' => ['required', 'numeric']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $id = $this->equipamentoModel->create($data);
            $equipamento = $this->equipamentoModel->getById($id);

            echo Response::success($equipamento, 'Equipamento criado com sucesso', 201);
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/equipamentos/{id}
     * Atualizar um equipamento
     */
    public function update($id, $data) {
        try {
            $equipamento = $this->equipamentoModel->getById($id);
            
            if (!$equipamento) {
                echo Response::notFound('Equipamento não encontrado');
                return;
            }

            $rules = [
                'nome' => ['min:3', 'max:255'],
                'tipo' => [],
                'custo_uso' => ['numeric']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $this->equipamentoModel->update($id, $data);
            $equipamentoAtualizado = $this->equipamentoModel->getById($id);

            echo Response::success($equipamentoAtualizado, 'Equipamento atualizado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/equipamentos/{id}
     * Deletar um equipamento
     */
    public function destroy($id) {
        try {
            $equipamento = $this->equipamentoModel->getById($id);
            
            if (!$equipamento) {
                echo Response::notFound('Equipamento não encontrado');
                return;
            }

            $this->equipamentoModel->delete($id);
            echo Response::success(null, 'Equipamento deletado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/equipamentos/obra/{obra_id}
     * Listar equipamentos de uma obra
     */
    public function equipamentosPorObra($obra_id) {
        try {
            $equipamentos = $this->equipamentoObraModel->getEquipamentosObraDetalhado($obra_id);
            echo Response::success($equipamentos, 'Equipamentos da obra recuperados com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/equipamentos/obra/{obra_id}/vincular
     * Vincular equipamento a uma obra
     */
    public function vincularEquipamento($obra_id, $data) {
        try {
            $rules = [
                'equipamento_id' => ['required', 'numeric'],
                'data_inicio' => ['required', 'date'],
                'data_fim' => ['date']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $data['obra_id'] = $obra_id;
            $id = $this->equipamentoObraModel->create($data);
            $vinculo = $this->equipamentoObraModel->getById($id);

            echo Response::success($vinculo, 'Equipamento vinculado com sucesso', 201);
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/equipamentos/obra/{obra_id}/desvincular/{equipamento_id}
     * Desvincular equipamento de uma obra
     */
    public function desvinculaEquipamento($obra_id, $equipamento_id) {
        try {
            $vinculo = $this->equipamentoObraModel->verificarVinculo($equipamento_id, $obra_id);
            
            if (!$vinculo) {
                echo Response::notFound('Vínculo não encontrado');
                return;
            }

            $this->equipamentoObraModel->delete($vinculo['id']);
            echo Response::success(null, 'Equipamento desvinculado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
