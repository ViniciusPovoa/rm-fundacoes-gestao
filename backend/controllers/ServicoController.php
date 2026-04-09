<?php
require_once __DIR__ . '/../models/Servico.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class ServicoController {
    private $servicoModel;
    private $validator;

    public function __construct() {
        $this->servicoModel = new Servico();
        $this->validator = new Validator();
    }

    /**
     * GET /api/servicos
     * Listar todos os serviços
     */
    public function index() {
        try {
            $servicos = $this->servicoModel->getAll();
            echo Response::success($servicos, 'Serviços recuperados com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/servicos/{id}
     * Buscar um serviço específico
     */
    public function show($id) {
        try {
            $servico = $this->servicoModel->getById($id);
            
            if (!$servico) {
                echo Response::notFound('Serviço não encontrado');
                return;
            }

            echo Response::success($servico, 'Serviço recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/servicos
     * Criar um novo serviço
     */
    public function store($data) {
        try {
            $rules = [
                'obra_id' => ['required', 'numeric'],
                'tipo' => ['required', 'min:3', 'max:100'],
                'descricao' => [],
                'valor_previsto' => ['required', 'numeric'],
                'valor_realizado' => ['numeric']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $id = $this->servicoModel->create($data);
            $servico = $this->servicoModel->getById($id);

            echo Response::success($servico, 'Serviço criado com sucesso', 201);
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/servicos/{id}
     * Atualizar um serviço
     */
    public function update($id, $data) {
        try {
            $servico = $this->servicoModel->getById($id);
            
            if (!$servico) {
                echo Response::notFound('Serviço não encontrado');
                return;
            }

            $rules = [
                'tipo' => ['min:3', 'max:100'],
                'descricao' => [],
                'valor_previsto' => ['numeric'],
                'valor_realizado' => ['numeric']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $this->servicoModel->update($id, $data);
            $servicoAtualizado = $this->servicoModel->getById($id);

            echo Response::success($servicoAtualizado, 'Serviço atualizado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/servicos/{id}
     * Deletar um serviço
     */
    public function destroy($id) {
        try {
            $servico = $this->servicoModel->getById($id);
            
            if (!$servico) {
                echo Response::notFound('Serviço não encontrado');
                return;
            }

            $this->servicoModel->delete($id);
            echo Response::success(null, 'Serviço deletado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/servicos/obra/{obra_id}
     * Listar serviços de uma obra
     */
    public function servicosPorObra($obra_id) {
        try {
            $servicos = $this->servicoModel->getServicosPorObra($obra_id);
            echo Response::success($servicos, 'Serviços da obra recuperados com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/servicos/obra/{obra_id}/total
     * Obter total de serviços de uma obra
     */
    public function totalServicosPorObra($obra_id) {
        try {
            $total = $this->servicoModel->getTotalServicosPorObra($obra_id);
            echo Response::success($total, 'Total de serviços recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
