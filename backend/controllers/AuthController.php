<?php
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Auth.php';

class AuthController {
    private $usuarioModel;

    public function __construct() {
        $this->usuarioModel = new Usuario();
    }

    public function login($data) {
        $username = strtolower(trim($data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($username === '' || $password === '') {
            echo Response::error('Usuário e senha são obrigatórios', 422);
            return;
        }

        $usuario = $this->usuarioModel->findByUsername($username);

        if (!$usuario || !(bool) ($usuario['ativo'] ?? true) || !password_verify($password, $usuario['password_hash'])) {
            echo Response::unauthorized('Usuário ou senha inválidos');
            return;
        }

        if (password_needs_rehash($usuario['password_hash'], PASSWORD_DEFAULT)) {
            $novoHash = password_hash($password, PASSWORD_DEFAULT);
            $this->usuarioModel->updatePasswordHash($usuario['id'], $novoHash);
        }

        $this->usuarioModel->updateLastLogin($usuario['id']);
        Auth::login($usuario);

        echo Response::success([
            'user' => [
                'id' => (int) $usuario['id'],
                'username' => $usuario['username'],
                'nome' => $usuario['nome'] ?? null,
            ],
        ], 'Login realizado com sucesso');
    }

    public function me() {
        if (!Auth::check()) {
            echo Response::unauthorized('Sessão expirada ou usuário não autenticado');
            return;
        }

        echo Response::success([
            'user' => Auth::user(),
        ], 'Sessão ativa');
    }

    public function logout() {
        Auth::logout();
        echo Response::success(null, 'Logout realizado com sucesso');
    }
}
?>
