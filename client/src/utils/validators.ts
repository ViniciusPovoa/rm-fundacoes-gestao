/**
 * Validadores para dados do sistema
 */

export const validators = {
  /**
   * Valida CPF (formato: XXX.XXX.XXX-XX)
   */
  validateCPF: (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cleanCPF[9]) !== firstDigit) return false;
    
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleanCPF[10]) === secondDigit;
  },

  /**
   * Valida CNPJ (formato: XX.XXX.XXX/0001-XX)
   */
  validateCNPJ: (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Calcula primeiro dígito verificador
    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    let digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Calcula segundo dígito verificador
    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1));
  },

  /**
   * Valida documento (CPF ou CNPJ)
   */
  validateDocument: (document: string): boolean => {
    const cleanDoc = document.replace(/\D/g, '');
    
    if (cleanDoc.length === 11) {
      return validators.validateCPF(document);
    } else if (cleanDoc.length === 14) {
      return validators.validateCNPJ(document);
    }
    
    return false;
  },

  /**
   * Valida email
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida telefone (formato: (XX) XXXXX-XXXX ou XXXXXXXXXX)
   */
  validatePhone: (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },

  /**
   * Valida data (formato: DD/MM/YYYY)
   */
  validateDate: (date: string): boolean => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(dateRegex);
    
    if (!match) return false;
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Verifica dias válidos por mês
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Verifica ano bissexto
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      daysInMonth[1] = 29;
    }
    
    return day <= daysInMonth[month - 1];
  },

  /**
   * Formata CPF
   */
  formatCPF: (cpf: string): string => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  /**
   * Formata CNPJ
   */
  formatCNPJ: (cnpj: string): string => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  /**
   * Formata telefone
   */
  formatPhone: (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  },
};

export default validators;
