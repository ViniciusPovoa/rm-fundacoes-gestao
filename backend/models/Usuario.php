<?php
require_once __DIR__ . '/BaseModel.php';

class Usuario extends BaseModel {
    protected $table = 'usuarios';

    public function findByUsername($username) {
        $sql = "SELECT * FROM {$this->table} WHERE username = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

    public function updateLastLogin($id) {
        $sql = "UPDATE {$this->table} SET last_login_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    public function updatePasswordHash($id, $passwordHash) {
        $sql = "UPDATE {$this->table} SET password_hash = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$passwordHash, $id]);
    }
}
?>
