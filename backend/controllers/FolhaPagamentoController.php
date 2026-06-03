<?php
require_once __DIR__ . '/../models/FolhaPagamento.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class FolhaPagamentoController {
    private $folhaPagamentoModel;
    private $validator;

    public function __construct() {
        $this->folhaPagamentoModel = new FolhaPagamento();
        $this->validator = new Validator();
    }

    private function normalizarTexto($value) {
        return trim(preg_replace('/\s+/', ' ', (string) $value));
    }

    private function normalizarMultilinha($value) {
        $linhas = preg_split('/\R/u', (string) $value);
        $linhasNormalizadas = array_map(function ($linha) {
            return trim(preg_replace('/\s+/', ' ', $linha));
        }, $linhas ?: []);

        return trim(implode("\n", $linhasNormalizadas));
    }

    private function validarReferencia($referencia) {
        return preg_match('/^\d{4}-\d{2}$/', (string) $referencia) === 1;
    }

    private function prepararDados($data) {
        $referencia = $data['referencia'] ?? '';
        $nome = $this->normalizarTexto($data['nome'] ?? '');

        if (!$this->validarReferencia($referencia)) {
            throw new Exception('A referência deve estar no formato YYYY-MM');
        }

        if ($nome === '') {
            throw new Exception('O nome do funcionário é obrigatório');
        }

        $salarioBase = round((float) ($data['salario_base'] ?? 0), 2);
        $metrosPerfurados = round((float) ($data['metros_perfurados'] ?? 0), 2);
        $valorPorMetro = round((float) ($data['valor_por_metro'] ?? 0), 2);
        $movimentacaoDiaria = round((float) ($data['movimentacao_diaria'] ?? 0), 2);
        $diasMovimentacao = max(0, (int) ($data['dias_movimentacao'] ?? 0));

        $valorProducao = round($metrosPerfurados * $valorPorMetro, 2);
        $valorMovimentacao = round($movimentacaoDiaria * $diasMovimentacao, 2);
        $totalFolha = round($salarioBase + $valorProducao + $valorMovimentacao, 2);

        return [
            'referencia' => $referencia,
            'nome' => $nome,
            'cargo' => $this->normalizarTexto($data['cargo'] ?? ''),
            'salario_base' => $salarioBase,
            'metros_perfurados' => $metrosPerfurados,
            'valor_por_metro' => $valorPorMetro,
            'valor_producao' => $valorProducao,
            'movimentacao_diaria' => $movimentacaoDiaria,
            'dias_movimentacao' => $diasMovimentacao,
            'valor_movimentacao' => $valorMovimentacao,
            'total_folha' => $totalFolha,
            'observacoes' => $this->normalizarMultilinha($data['observacoes'] ?? ''),
        ];
    }

    public function index() {
        try {
            $referencia = $_GET['referencia'] ?? null;

            if ($referencia !== null && $referencia !== '') {
                if (!$this->validarReferencia($referencia)) {
                    echo Response::error('A referência deve estar no formato YYYY-MM', 422);
                    return;
                }

                $folha = $this->folhaPagamentoModel->getPorReferencia($referencia);
                echo Response::success($folha, 'Folha da referência recuperada com sucesso');
                return;
            }

            $folhas = $this->folhaPagamentoModel->getAll('referencia DESC, nome ASC, id DESC');
            echo Response::success($folhas, 'Folhas recuperadas com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    public function show($id) {
        try {
            $folha = $this->folhaPagamentoModel->getById($id);

            if (!$folha) {
                echo Response::notFound('Registro da folha não encontrado');
                return;
            }

            echo Response::success($folha, 'Registro da folha recuperado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }

    public function store($data) {
        try {
            $preparedData = $this->prepararDados($data);

            $rules = [
                'referencia' => ['required'],
                'nome' => ['required', 'min:3', 'max:255'],
                'cargo' => ['max:100'],
                'salario_base' => ['numeric'],
                'metros_perfurados' => ['numeric'],
                'valor_por_metro' => ['numeric'],
                'valor_producao' => ['numeric'],
                'movimentacao_diaria' => ['numeric'],
                'dias_movimentacao' => ['numeric'],
                'valor_movimentacao' => ['numeric'],
                'total_folha' => ['numeric'],
                'observacoes' => [],
            ];

            if (!$this->validator->validate($preparedData, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $id = $this->folhaPagamentoModel->create($preparedData);
            $registro = $this->folhaPagamentoModel->getById($id);

            echo Response::success($registro, 'Funcionário adicionado à folha com sucesso', 201);
        } catch (Exception $e) {
            $status = strpos($e->getMessage(), 'obrigatório') !== false || strpos($e->getMessage(), 'formato') !== false ? 422 : 500;
            echo Response::error($e->getMessage(), $status);
        }
    }

    public function update($id, $data) {
        try {
            $registro = $this->folhaPagamentoModel->getById($id);

            if (!$registro) {
                echo Response::notFound('Registro da folha não encontrado');
                return;
            }

            $preparedData = $this->prepararDados(array_merge($registro, $data));

            $rules = [
                'referencia' => ['required'],
                'nome' => ['required', 'min:3', 'max:255'],
                'cargo' => ['max:100'],
                'salario_base' => ['numeric'],
                'metros_perfurados' => ['numeric'],
                'valor_por_metro' => ['numeric'],
                'valor_producao' => ['numeric'],
                'movimentacao_diaria' => ['numeric'],
                'dias_movimentacao' => ['numeric'],
                'valor_movimentacao' => ['numeric'],
                'total_folha' => ['numeric'],
                'observacoes' => [],
            ];

            if (!$this->validator->validate($preparedData, $rules)) {
                echo Response::error('Dados inválidos', 422, $this->validator->getErrors());
                return;
            }

            $this->folhaPagamentoModel->update($id, $preparedData);
            $registroAtualizado = $this->folhaPagamentoModel->getById($id);

            echo Response::success($registroAtualizado, 'Registro da folha atualizado com sucesso');
        } catch (Exception $e) {
            $status = strpos($e->getMessage(), 'obrigatório') !== false || strpos($e->getMessage(), 'formato') !== false ? 422 : 500;
            echo Response::error($e->getMessage(), $status);
        }
    }

    public function destroy($id) {
        try {
            $registro = $this->folhaPagamentoModel->getById($id);

            if (!$registro) {
                echo Response::notFound('Registro da folha não encontrado');
                return;
            }

            $this->folhaPagamentoModel->delete($id);
            echo Response::success(null, 'Registro da folha deletado com sucesso');
        } catch (Exception $e) {
            echo Response::error($e->getMessage(), 500);
        }
    }
}
?>
