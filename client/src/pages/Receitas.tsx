import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import api from '../config/api';
import { formatBRL, formatCurrencyFromNumber, maskCurrency, normalizeDateInput, normalizeMultilineText, parseCurrency } from '../lib/input-formatters';
import '../styles/crud.css';

interface Obra {
  id: number;
  nome: string;
}

interface Receita {
  id: number;
  obra_id: number;
  valor: number;
  data: string;
  descricao: string;
}

const Receitas: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [obraId, setObraId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    valor: '',
    data: '',
    descricao: '',
  });

  const resetForm = () => {
    setFormData({ valor: '', data: '', descricao: '' });
  };

  useEffect(() => {
    fetchObras();
  }, []);

  useEffect(() => {
    if (obraId) {
      fetchReceitas();
    }
  }, [obraId]);

  const fetchObras = async () => {
    try {
      setLoading(true);
      const response = await api.getObras();
      setObras(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar obras');
    } finally {
      setLoading(false);
    }
  };

  const fetchReceitas = async () => {
    try {
      const response = await api.getReceitasPorObra(parseInt(obraId));
      setReceitas(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar receitas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        descricao: normalizeMultilineText(formData.descricao),
        obra_id: parseInt(obraId),
        valor: parseCurrency(formData.valor),
        data: normalizeDateInput(formData.data),
      };

      if (editingId) {
        await api.updateReceita(editingId, submitData);
      } else {
        await api.createReceita(submitData);
      }
      resetForm();
      setEditingId(null);
      setShowForm(false);
      fetchReceitas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar receita');
    }
  };

  const handleEdit = (receita: Receita) => {
    setFormData({
      valor: formatCurrencyFromNumber(receita.valor),
      data: normalizeDateInput(receita.data),
      descricao: receita.descricao,
    });
    setEditingId(receita.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta receita?')) {
      try {
        await api.deleteReceita(id);
        fetchReceitas();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao deletar receita');
      }
    }
  };

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <h1>Receitas</h1>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-card">
        <h3>Selecione uma Obra</h3>
        <select
          value={obraId}
          onChange={(e) => {
            setObraId(e.target.value);
            setShowForm(false);
          }}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          <option value="">-- Selecione uma obra --</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nome}
            </option>
          ))}
        </select>
      </div>

      {obraId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Receitas da Obra</h2>
            <button className="btn btn-primary" onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(!showForm);
            }}>
              <Plus size={20} /> Nova Receita
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <h2>{editingId ? 'Editar Receita' : 'Nova Receita'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Valor *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: maskCurrency(e.target.value) })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Data *</label>
                    <input
                      type="date"
                      required
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: normalizeDateInput(e.target.value) })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      onBlur={(e) => setFormData({ ...formData, descricao: normalizeMultilineText(e.target.value) })}
                      placeholder="Descrição da receita"
                      style={{ minHeight: '100px', fontFamily: 'inherit' }}
                    ></textarea>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Atualizar' : 'Criar'} Receita
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
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {receitas.map((receita) => (
                  <tr key={receita.id}>
                    <td>{new Date(receita.data).toLocaleDateString('pt-BR')}</td>
                    <td className="font-weight-600" style={{ color: '#10b981' }}>
                      {formatBRL(receita.valor)}
                    </td>
                    <td>{receita.descricao}</td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(receita)}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(receita.id)}
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {receitas.length === 0 && (
              <div className="empty-state">
                <p>Nenhuma receita cadastrada para esta obra</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Receitas;
