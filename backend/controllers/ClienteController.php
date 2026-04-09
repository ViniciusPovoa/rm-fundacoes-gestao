<?php
require_once __DIR__ . '/../models/Cliente.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class ClienteController {
    private $clienteModel;
    private $validator;

    public function __construct() {
        $this->clienteModel = new Cliente();
        $this->validator = new Validator();
    }

    /**
     * GET /api/clientes
     * Listar todos os clientes
     */
    public function index() {
        try {
            $clientes = $this->clienteModel->getAll();
            echo Response::success($clientes, 'Clientes recuperados com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/clientes/{id}
     * Buscar um cliente específico
     */
    public function show($id) {
        try {
            $cliente = $this->clienteModel->getById($id);
            
            if (!$cliente) {
                echo Response::notFound('Cliente não encontrado');
                return;
            }

            echo Response::success($cliente, 'Cliente recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/clientes
     * Criar um novo cliente
     */
    public function store($data) {
        try {
            $rules = [
                'nome' => ['required', 'min:3', 'max:255'],
                'email' => ['email'],
                'documento' => ['required'],
                'telefone' => [],
                'endereco' => []
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $id = $this->clienteModel->create($data);
            $cliente = $this->clienteModel->getById($id);

            echo Response::success($cliente, 'Cliente criado com sucesso', 201);
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/clientes/{id}
     * Atualizar um cliente
     */
    public function update($id, $data) {
        try {
            $cliente = $this->clienteModel->getById($id);
            
            if (!$cliente) {
                echo Response::notFound('Cliente não encontrado');
                return;
            }

            $rules = [
                'nome' => ['min:3', 'max:255'],
                'email' => ['email'],
                'telefone' => [],
                'endereco' => []
            ];

            if (!$this->validator->validate($data, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $this->clienteModel->update($id, $data);
            $clienteAtualizado = $this->clienteModel->getById($id);

            echo Response::success($clienteAtualizado, 'Cliente atualizado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/clientes/{id}
     * Deletar um cliente
     */
    public function destroy($id) {
        try {
            $cliente = $this->clienteModel->getById($id);
            
            if (!$cliente) {
                echo Response::notFound('Cliente não encontrado');
                return;
            }

            $this->clienteModel->delete($id);
            echo Response::success(null, 'Cliente deletado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /api/clientes/com-obras
     * Listar clientes com total de obras
     */
    public function clientesComObras() {
        try {
            $clientes = $this->clienteModel->getClientesComObras();
            echo Response::success($clientes, 'Clientes com obras recuperados com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
