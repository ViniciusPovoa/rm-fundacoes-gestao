<?php
require_once __DIR__ . '/Response.php';

class Auth {
    private const SESSION_KEY = 'rm_auth_user';
    private const LAST_ACTIVITY_KEY = 'rm_auth_last_activity';
    private const SESSION_TIMEOUT = 43200;

    public static function initSession() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $isHttps = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443)
        );

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_httponly', '1');

        session_name('rmfundacoes_session');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => $isHttps,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        session_start();
    }

    public static function login(array $user) {
        self::initSession();
        session_regenerate_id(true);

        $_SESSION[self::SESSION_KEY] = [
            'id' => (int) $user['id'],
            'username' => $user['username'],
            'nome' => $user['nome'] ?? null,
        ];
        $_SESSION[self::LAST_ACTIVITY_KEY] = time();
    }

    public static function user() {
        self::initSession();

        if (!self::check()) {
            return null;
        }

        return $_SESSION[self::SESSION_KEY];
    }

    public static function check() {
        self::initSession();

        if (empty($_SESSION[self::SESSION_KEY])) {
            return false;
        }

        $lastActivity = $_SESSION[self::LAST_ACTIVITY_KEY] ?? null;
        if ($lastActivity !== null && (time() - (int) $lastActivity) > self::SESSION_TIMEOUT) {
            self::logout();
            return false;
        }

        $_SESSION[self::LAST_ACTIVITY_KEY] = time();
        return true;
    }

    public static function logout() {
        self::initSession();

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'] ?? '/',
                $params['domain'] ?? '',
                $params['secure'] ?? false,
                $params['httponly'] ?? true
            );
        }

        session_destroy();
    }

    public static function requireAuth() {
        if (!self::check()) {
            echo Response::unauthorized('Sessão expirada ou usuário não autenticado');
            exit;
        }
    }
}
?>
