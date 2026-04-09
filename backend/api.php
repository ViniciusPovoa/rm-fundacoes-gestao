<?php
/**
 * API REST - RM Fundações
 * Roteador principal para todas as requisições
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoload de classes
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/utils/Response.php';

// Carregar controllers
require_once __DIR__ . '/controllers/ClienteController.php';
require_once __DIR__ . '/controllers/ObraController.php';
require_once __DIR__ . '/controllers/ServicoController.php';
require_once __DIR__ . '/controllers/DespesaController.php';
require_once __DIR__ . '/controllers/ReceitaController.php';
require_once __DIR__ . '/controllers/EquipamentoController.php';
require_once __DIR__ . '/controllers/DashboardController.php';

// Parse da URL
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove a parte da query string
if (strpos($request_uri, '?') !== false) {
    $request_uri = substr($request_uri, 0, strpos($request_uri, '?'));
}

// Remove /backend/api.php do início
$request_uri = str_replace('/backend/api.php', '', $request_uri);
$request_uri = str_replace('/api', '', $request_uri);
$request_uri = trim($request_uri, '/');

// Parse dos segmentos da URL
$segments = explode('/', $request_uri);
$entity = $segments[0] ?? null;
$id = $segments[1] ?? null;
$action = $segments[2] ?? null;
$subId = $segments[3] ?? null;

// Obter dados do corpo da requisição
$input = file_get_contents('php://input');
$data = !empty($input) ? json_decode($input, true) : [];

try {
    // CLIENTES
    if ($entity === 'clientes') {
        $controller = new ClienteController();
        
        if ($request_method === 'GET') {
            if ($id === null) {
                $controller->index();
            } elseif ($id === 'com-obras') {
                $controller->clientesComObras();
            } else {
                $controller->show($id);
            }
        } elseif ($request_method === 'POST') {
            $controller->store($data);
        } elseif ($request_method === 'PUT' && $id !== null) {
            $controller->update($id, $data);
        } elseif ($request_method === 'DELETE' && $id !== null) {
            $controller->destroy($id);
        }
    }

    // OBRAS
    elseif ($entity === 'obras') {
        $controller = new ObraController();
        
        if ($request_method === 'GET') {
            if ($id === null) {
                $controller->index();
            } elseif ($id === 'cliente' && $action !== null) {
                $controller->obrasPorCliente($action);
            } elseif ($id === 'status' && $action !== null) {
                $controller->obrasPorStatus($action);
            } elseif ($action === 'financeiro') {
                $controller->financeiro($id);
            } else {
                $controller->show($id);
            }
        } elseif ($request_method === 'POST') {
            $controller->store($data);
        } elseif ($request_method === 'PUT' && $id !== null) {
            $controller->update($id, $data);
        } elseif ($request_method === 'DELETE' && $id !== null) {
            $controller->destroy($id);
        }
    }

    // SERVIÇOS
    elseif ($entity === 'servicos') {
        $controller = new ServicoController();
        
        if ($request_method === 'GET') {
            if ($id === null) {
                $controller->index();
            } elseif ($id === 'obra' && $action !== null) {
                if ($subId === 'total') {
                    $controller->totalServicosPorObra($action);
                } else {
                    $controller->servicosPorObra($action);
                }
            } else {
                $controller->show($id);
            }
        } elseif ($request_method === 'POST') {
            $controller->store($data);
        } elseif ($request_method === 'PUT' && $id !== null) {
            $controller->update($id, $data);
        } elseif ($request_method === 'DELETE' && $id !== null) {
            $controller->destroy($id);
        }
    }

    // DESPESAS
    elseif ($entity === 'despesas') {
        $controller = new DespesaController();
        
        if ($request_method === 'GET') {
            if ($id === null) {
                $controller->index();
            } elseif ($id === 'obra' && $action !== null) {
                if ($subId === 'total') {
                    $controller->totalDespesasPorObra($action);
                } elseif ($subId === 'por-tipo') {
                    $controller->despesasPorTipo($action);
                } else {
                    $controller->despesasPorObra($action);
                }
            } else {
                $controller->show($id);
            }
        } elseif ($request_method === 'POST') {
            $controller->store($data);
        } elseif ($request_method === 'PUT' && $id !== null) {
            $controller->update($id, $data);
        } elseif ($request_method === 'DELETE' && $id !== null) {
            $controller->destroy($id);
        }
    }

    // RECEITAS
    elseif ($entity === 'receitas') {
        $controller = new ReceitaController();
        
        if ($request_method === 'GET') {
            if ($id === null) {
                $controller->index();
            } elseif ($id === 'obra' && $action !== null) {
                if ($subId === 'total') {
                    $controller->totalReceitasPorObra($action);
                } else {
                    $controller->receitasPorObra($action);
                }
            } else {
                $controller->show($id);
            }
        } elseif ($request_method === 'POST') {
            $controller->store($data);
        } elseif ($request_method === 'PUT' && $id !== null) {
            $controller->update($id, $data);
        } elseif ($request_method === 'DELETE' && $id !== null) {
            $controller->destroy($id);
        }
    }

    // EQUIPAMENTOS
    elseif ($entity === 'equipamentos') {
        $controller = new EquipamentoController();
        
        if ($request_method === 'GET') {
            if ($id === null) {
                $controller->index();
            } elseif ($id === 'obra' && $action !== null) {
                $controller->equipamentosPorObra($action);
            } else {
                $controller->show($id);
            }
        } elseif ($request_method === 'POST') {
            if ($id === 'obra' && $action !== null) {
                if ($subId === 'vincular') {
                    $controller->vincularEquipamento($action, $data);
                }
            } else {
                $controller->store($data);
            }
        } elseif ($request_method === 'DELETE') {
            if ($id === 'obra' && $action !== null && $subId === 'desvincular') {
                $controller->desvinculaEquipamento($action, $segments[4] ?? null);
            } else {
                $controller->destroy($id);
            }
        } elseif ($request_method === 'PUT' && $id !== null) {
            $controller->update($id, $data);
        }
    }

    // DASHBOARD
    elseif ($entity === 'dashboard') {
        $controller = new DashboardController();
        
        if ($request_method === 'GET') {
            if ($id === 'resumo-geral') {
                $controller->resumoGeral();
            } elseif ($id === 'lucro-por-obra') {
                $controller->lucroPorObra();
            } elseif ($id === 'obras-status') {
                $controller->obrasStatus();
            } elseif ($id === 'receitas-despesas') {
                $controller->receitasDespesas();
            } elseif ($id === 'despesas-por-tipo') {
                $controller->despesasPorTipo();
            }
        }
    }

    // Rota não encontrada
    else {
        echo Response::notFound('Endpoint não encontrado');
    }

} catch (Exception $e) {
    echo Response::error($e->getMessage(), 500);
}
?>
