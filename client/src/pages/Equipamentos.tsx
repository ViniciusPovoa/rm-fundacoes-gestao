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
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    custo_uso: '',
  });

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
            {equipamentos.map((equipamento) => (
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
        {equipamentos.length === 0 && (
          <div className="empty-state">
            <p>Nenhum equipamento cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipamentos;
