<?php
/**
 * Classe para validação de dados
 */
class Validator {
    private $errors = [];

    public function validate($data, $rules) {
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            
            foreach ($fieldRules as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }

        return empty($this->errors);
    }

    private function applyRule($field, $value, $rule) {
        if (is_string($rule)) {
            $ruleParts = explode(':', $rule);
            $ruleName = $ruleParts[0];
            $ruleParam = $ruleParts[1] ?? null;

            switch ($ruleName) {
                case 'required':
                    if (empty($value)) {
                        $this->errors[$field][] = "O campo {$field} é obrigatório";
                    }
                    break;

                case 'email':
                    if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $this->errors[$field][] = "O campo {$field} deve ser um email válido";
                    }
                    break;

                case 'numeric':
                    if (!empty($value) && !is_numeric($value)) {
                        $this->errors[$field][] = "O campo {$field} deve ser numérico";
                    }
                    break;

                case 'min':
                    if (!empty($value) && strlen($value) < $ruleParam) {
                        $this->errors[$field][] = "O campo {$field} deve ter no mínimo {$ruleParam} caracteres";
                    }
                    break;

                case 'max':
                    if (!empty($value) && strlen($value) > $ruleParam) {
                        $this->errors[$field][] = "O campo {$field} deve ter no máximo {$ruleParam} caracteres";
                    }
                    break;

                case 'date':
                    if (!empty($value) && !$this->isValidDate($value)) {
                        $this->errors[$field][] = "O campo {$field} deve ser uma data válida";
                    }
                    break;

                case 'unique':
                    // Implementar verificação de unicidade se necessário
                    break;
            }
        }
    }

    private function isValidDate($date, $format = 'Y-m-d') {
        $d = \DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    public function getErrors() {
        return $this->errors;
    }

    public function hasErrors() {
        return !empty($this->errors);
    }
}
?>
