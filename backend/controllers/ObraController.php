<?php
require_once __DIR__ . '/../models/Obra.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../utils/FinanceCalculator.php';

class ObraController {
    private $obraModel;
    private $validator;
    private $financeCalculator;

    public function __construct() {
        $this->obraModel = new Obra();
        $this->validator = new Validator();
        $this->financeCalculator = new FinanceCalculator();
    }

    /**
     * GET /api/obras
     * Listar todas as obras
     */
    public function index() {
        try {
            $obras = $this->obraModel->getObrasComCliente();
            echo Response::success($obras, 'Obras recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/obras/{id}
     * Buscar uma obra específica
     */
    public function show($id) {
        try {
            $obra = $this->obraModel->getObraComCliente($id);
            
            if (!$obra) {
                echo Response::notFound('Obra não encontrada');
                return;
            }

            $financeiro = $this->financeCalculator->calcularResumoObra($id);
            $obra['financeiro'] = $financeiro;

            echo Response::success($obra, 'Obra recuperada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/obras
     * Criar uma nova obra
     */
    public function store($data) {
        try {
            $rules = [
                'nome' => ['required', 'min:3', 'max:255'],
                'cliente_id' => ['required', 'numeric'],
                'localizacao' => ['required'],
                'data_inicio' => ['required', 'date'],
                'data_fim' => ['date'],
                'status' => ['required']
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $id = $this->obraModel->create($data);
            $obra = $this->obraModel->getObraComCliente($id);

            echo Response::success($obra, 'Obra criada com sucesso', 201);
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/obras/{id}
     * Atualizar uma obra
     */
    public function update($id, $data) {
        try {
            $obra = $this->obraModel->getById($id);
            
            if (!$obra) {
                echo Response::notFound('Obra não encontrada');
                return;
            }

            $rules = [
                'nome' => ['min:3', 'max:255'],
                'cliente_id' => ['numeric'],
                'localizacao' => [],
                'data_inicio' => ['date'],
                'data_fim' => ['date'],
                'status' => []
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $this->obraModel->update($id, $data);
            $obraAtualizada = $this->obraModel->getObraComCliente($id);

            echo Response::success($obraAtualizada, 'Obra atualizada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/obras/{id}
     * Deletar uma obra
     */
    public function destroy($id) {
        try {
            $obra = $this->obraModel->getById($id);
            
            if (!$obra) {
                echo Response::notFound('Obra não encontrada');
                return;
            }

            $this->obraModel->delete($id);
            echo Response::success(null, 'Obra deletada com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/obras/cliente/{cliente_id}
     * Listar obras de um cliente
     */
    public function obrasPorCliente($cliente_id) {
        try {
            $obras = $this->obraModel->getObrasPorCliente($cliente_id);
            echo Response::success($obras, 'Obras do cliente recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/obras/status/{status}
     * Listar obras por status
     */
    public function obrasPorStatus($status) {
        try {
            $obras = $this->obraModel->getObrasPorStatus($status);
            echo Response::success($obras, 'Obras por status recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/obras/{id}/financeiro
     * Obter resumo financeiro de uma obra
     */
    public function financeiro($id) {
        try {
            $obra = $this->obraModel->getById($id);
            
            if (!$obra) {
                echo Response::notFound('Obra não encontrada');
                return;
            }

            $financeiro = $this->financeCalculator->calcularResumoObra($id);
            echo Response::success($financeiro, 'Resumo financeiro recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
