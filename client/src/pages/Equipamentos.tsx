import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import api from '../config/api';
import { formatBRL, formatCurrencyFromNumber, maskCurrency, normalizeSingleLineText, parseCurrency } from '../lib/input-formatters';
import '../styles/crud.css';

interface Equipamento {
  id: number;
  nome: string;
  tipo: string;
  custo_uso: number;
}

const Equipamentos: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    nome: '',
    tipo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    custo_uso: '',
  });
  const ITEMS_PER_PAGE = 10;

  const resetForm = () => {
    setFormData({ nome: '', tipo: '', custo_uso: '' });
  };

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  const fetchEquipamentos = async () => {
    try {
      setLoading(true);
      const response = await api.getEquipamentos();
      setEquipamentos(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        nome: normalizeSingleLineText(formData.nome),
        tipo: normalizeSingleLineText(formData.tipo),
        custo_uso: parseCurrency(formData.custo_uso),
      };

      if (editingId) {
        await api.updateEquipamento(editingId, submitData);
      } else {
        await api.createEquipamento(submitData);
      }
      resetForm();
      setEditingId(null);
      setShowForm(false);
      fetchEquipamentos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar equipamento');
    }
  };

  const handleEdit = (equipamento: Equipamento) => {
    setFormData({
      nome: equipamento.nome,
      tipo: equipamento.tipo,
      custo_uso: formatCurrencyFromNumber(equipamento.custo_uso),
    });
    setEditingId(equipamento.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este equipamento?')) {
      try {
        await api.deleteEquipamento(id);
        fetchEquipamentos();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao deletar equipamento');
      }
    }
  };

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  const equipamentosFiltrados = equipamentos.filter((equipamento) => {
    const nomeFiltro = normalizeSingleLineText(filters.nome).toLowerCase();
    const tipoFiltro = normalizeSingleLineText(filters.tipo).toLowerCase();
    const nomeEquipamento = (equipamento.nome || '').toLowerCase();
    const tipoEquipamento = (equipamento.tipo || '').toLowerCase();

    const matchNome = !nomeFiltro || nomeEquipamento.includes(nomeFiltro);
    const matchTipo = !tipoFiltro || tipoEquipamento.includes(tipoFiltro);

    return matchNome && matchTipo;
  });
  const totalPages = Math.max(1, Math.ceil(equipamentosFiltrados.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * ITEMS_PER_PAGE;
  const equipamentosPaginados = equipamentosFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <h1>Equipamentos</h1>
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setEditingId(null);
          setShowForm(!showForm);
        }}>
          <Plus size={20} /> Novo Equipamento
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-card">
        <h2>Filtros Avançados</h2>
        <div className="form-grid" style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={filters.nome}
              onChange={(e) => {
                setFilters({ ...filters, nome: e.target.value });
                setCurrentPage(1);
              }}
              onBlur={(e) => setFilters((current) => ({ ...current, nome: normalizeSingleLineText(e.target.value) }))}
              placeholder="Buscar por nome"
            />
          </div>
          <div className="form-group">
            <label>Tipo do Equipamento</label>
            <input
              type="text"
              value={filters.tipo}
              onChange={(e) => {
                setFilters({ ...filters, tipo: e.target.value });
                setCurrentPage(1);
              }}
              onBlur={(e) => setFilters((current) => ({ ...current, tipo: normalizeSingleLineText(e.target.value) }))}
              placeholder="Buscar por tipo"
            />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label>&nbsp;</label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFilters({ nome: '', tipo: '' });
                setCurrentPage(1);
              }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Editar Equipamento' : 'Novo Equipamento'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, nome: normalizeSingleLineText(e.target.value) })}
                  placeholder="Nome do equipamento"
                />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <input
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, tipo: normalizeSingleLineText(e.target.value) })}
                  placeholder="Tipo de equipamento"
                />
              </div>
              <div className="form-group">
                <label>Custo de Uso (R$/dia) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.custo_uso}
                  onChange={(e) => setFormData({ ...formData, custo_uso: maskCurrency(e.target.value) })}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Atualizar' : 'Criar'} Equipamento
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <table className="crud-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Custo de Uso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentosPaginados.map((equipamento) => (
              <tr key={equipamento.id}>
                <td className="font-weight-600">{equipamento.nome}</td>
                <td>{equipamento.tipo}</td>
                <td>{formatBRL(equipamento.custo_uso)}</td>
                <td className="actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(equipamento)}
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(equipamento.id)}
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {equipamentosFiltrados.length === 0 && (
          <div className="empty-state">
            <p>{equipamentos.length === 0 ? 'Nenhum equipamento cadastrado' : 'Nenhum equipamento encontrado com os filtros informados'}</p>
          </div>
        )}
        {equipamentosFiltrados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '16px 24px', borderTop: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, equipamentosFiltrados.length)} de {equipamentosFiltrados.length} equipamentos
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={currentPageSafe === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Anterior
              </button>
              <span style={{ minWidth: '90px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>
                Página {currentPageSafe} de {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={currentPageSafe === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipamentos;
