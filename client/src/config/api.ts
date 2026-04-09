/**
 * Configuração da API
 * Define a URL base e métodos para requisições HTTP
 */

// Usar import.meta.env para Vite (não process.env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend/api.php';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // CLIENTES
  getClientes() {
    return this.request('/clientes');
  }

  getCliente(id: number) {
    return this.request(`/clientes/${id}`);
  }

  createCliente(data: any) {
    return this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateCliente(id: number, data: any) {
    return this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteCliente(id: number) {
    return this.request(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  getClientesComObras() {
    return this.request('/clientes/com-obras');
  }

  // OBRAS
  getObras() {
    return this.request('/obras');
  }

  getObra(id: number) {
    return this.request(`/obras/${id}`);
  }

  createObra(data: any) {
    return this.request('/obras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateObra(id: number, data: any) {
    return this.request(`/obras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteObra(id: number) {
    return this.request(`/obras/${id}`, {
      method: 'DELETE',
    });
  }

  getObrasPorCliente(clienteId: number) {
    return this.request(`/obras/cliente/${clienteId}`);
  }

  getObrasPorStatus(status: string) {
    return this.request(`/obras/status/${status}`);
  }

  getFinanceiroObra(id: number) {
    return this.request(`/obras/${id}/financeiro`);
  }

  // SERVIÇOS
  getServicos() {
    return this.request('/servicos');
  }

  getServico(id: number) {
    return this.request(`/servicos/${id}`);
  }

  createServico(data: any) {
    return this.request('/servicos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateServico(id: number, data: any) {
    return this.request(`/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteServico(id: number) {
    return this.request(`/servicos/${id}`, {
      method: 'DELETE',
    });
  }

  getServicosPorObra(obraId: number) {
    return this.request(`/servicos/obra/${obraId}`);
  }

  getTotalServicosPorObra(obraId: number) {
    return this.request(`/servicos/obra/${obraId}/total`);
  }

  // DESPESAS
  getDespesas() {
    return this.request('/despesas');
  }

  getDespesa(id: number) {
    return this.request(`/despesas/${id}`);
  }

  createDespesa(data: any) {
    return this.request('/despesas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateDespesa(id: number, data: any) {
    return this.request(`/despesas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteDespesa(id: number) {
    return this.request(`/despesas/${id}`, {
      method: 'DELETE',
    });
  }

  getDespesasPorObra(obraId: number) {
    return this.request(`/despesas/obra/${obraId}`);
  }

  getTotalDespesasPorObra(obraId: number) {
    return this.request(`/despesas/obra/${obraId}/total`);
  }

  getDespesasPorTipo(obraId: number) {
    return this.request(`/despesas/obra/${obraId}/por-tipo`);
  }

  // RECEITAS
  getReceitas() {
    return this.request('/receitas');
  }

  getReceita(id: number) {
    return this.request(`/receitas/${id}`);
  }

  createReceita(data: any) {
    return this.request('/receitas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateReceita(id: number, data: any) {
    return this.request(`/receitas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteReceita(id: number) {
    return this.request(`/receitas/${id}`, {
      method: 'DELETE',
    });
  }

  getReceitasPorObra(obraId: number) {
    return this.request(`/receitas/obra/${obraId}`);
  }

  getTotalReceitasPorObra(obraId: number) {
    return this.request(`/receitas/obra/${obraId}/total`);
  }

  // EQUIPAMENTOS
  getEquipamentos() {
    return this.request('/equipamentos');
  }

  getEquipamento(id: number) {
    return this.request(`/equipamentos/${id}`);
  }

  createEquipamento(data: any) {
    return this.request('/equipamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateEquipamento(id: number, data: any) {
    return this.request(`/equipamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteEquipamento(id: number) {
    return this.request(`/equipamentos/${id}`, {
      method: 'DELETE',
    });
  }

  getEquipamentosPorObra(obraId: number) {
    return this.request(`/equipamentos/obra/${obraId}`);
  }

  vincularEquipamento(obraId: number, data: any) {
    return this.request(`/equipamentos/obra/${obraId}/vincular`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  desvinculaEquipamento(obraId: number, equipamentoId: number) {
    return this.request(`/equipamentos/obra/${obraId}/desvincular/${equipamentoId}`, {
      method: 'DELETE',
    });
  }

  // DASHBOARD
  getResumoDashboard() {
    return this.request('/dashboard/resumo-geral');
  }

  getLucroPorObra() {
    return this.request('/dashboard/lucro-por-obra');
  }

  getObrasStatus() {
    return this.request('/dashboard/obras-status');
  }

  getReceitasDespesas() {
    return this.request('/dashboard/receitas-despesas');
  }

  getDespesasPorTipoDashboard() {
    return this.request('/dashboard/despesas-por-tipo');
  }
}

export default new ApiClient(API_BASE_URL);

// Log para debug
console.log('[API Config] Base URL:', API_BASE_URL);
