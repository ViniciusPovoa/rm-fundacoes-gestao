<?php
/**
 * Classe para padronizar respostas da API
 */
class Response {
    public static function success($data = null, $message = 'Sucesso', $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        return json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    public static function error($message = 'Erro', $statusCode = 400, $errors = null) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        return json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ]);
    }

    public static function paginated($data, $total, $page, $perPage, $message = 'Sucesso') {
        http_response_code(200);
        header('Content-Type: application/json');
        return json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'perPage' => $perPage,
                'totalPages' => ceil($total / $perPage)
            ]
        ]);
    }

    public static function notFound($message = 'Recurso não encontrado') {
        return self::error($message, 404);
    }

    public static function unauthorized($message = 'Não autorizado') {
        return self::error($message, 401);
    }

    public static function forbidden($message = 'Acesso proibido') {
        return self::error($message, 403);
    }

    public static function serverError($message = 'Erro interno do servidor') {
        return self::error($message, 500);
    }
}
?>
