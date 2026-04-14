import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import api from '../config/api';
import { formatBRL, formatCurrencyFromNumber, maskCurrency, normalizeDateInput, normalizeMultilineText, parseCurrency } from '../lib/input-formatters';
import '../styles/crud.css';

interface Obra {
  id: number;
  nome: string;
}

interface Despesa {
  id: number;
  obra_id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
}

const Despesas: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [obraId, setObraId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tipo: '',
    tipo_outro: '',
    descricao: '',
    valor: '',
    data: '',
  });

  const resetForm = () => {
    setFormData({ tipo: '', tipo_outro: '', descricao: '', valor: '', data: '' });
  };

  useEffect(() => {
    fetchObras();
  }, []);

  useEffect(() => {
    if (obraId) {
      fetchDespesas();
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

  const fetchDespesas = async () => {
    try {
      const response = await api.getDespesasPorObra(parseInt(obraId));
      setDespesas(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tipoOutro = normalizeMultilineText(formData.tipo_outro);
      const descricaoBase = normalizeMultilineText(formData.descricao);
      const descricaoCompleta =
        formData.tipo === 'outro' && tipoOutro
          ? descricaoBase
            ? `Outro (${tipoOutro}) - ${descricaoBase}`
            : `Outro (${tipoOutro})`
          : descricaoBase;

      const submitData = {
        tipo: formData.tipo,
        descricao: descricaoCompleta,
        obra_id: parseInt(obraId),
        valor: parseCurrency(formData.valor),
        data: normalizeDateInput(formData.data),
      };

      if (editingId) {
        await api.updateDespesa(editingId, submitData);
      } else {
        await api.createDespesa(submitData);
      }
      resetForm();
      setEditingId(null);
      setShowForm(false);
      fetchDespesas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar despesa');
    }
  };

  const handleEdit = (despesa: Despesa) => {
    const matchTipoOutro = despesa.tipo === 'outro'
      ? despesa.descricao?.match(/^Outro \((.+?)\)(?: - (.*))?$/)
      : null;

    setFormData({
      tipo: despesa.tipo,
      tipo_outro: matchTipoOutro?.[1] ?? '',
      descricao: matchTipoOutro?.[2] ?? despesa.descricao,
      valor: formatCurrencyFromNumber(despesa.valor),
      data: normalizeDateInput(despesa.data),
    });
    setEditingId(despesa.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta despesa?')) {
      try {
        await api.deleteDespesa(id);
        fetchDespesas();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao deletar despesa');
      }
    }
  };

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <h1>Despesas</h1>
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
            <h2 style={{ margin: 0 }}>Despesas da Obra</h2>
            <button className="btn btn-primary" onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(!showForm);
            }}>
              <Plus size={20} /> Nova Despesa
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <h2>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tipo *</label>
                    <select
                      required
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo: e.target.value,
                          tipo_outro: e.target.value === 'outro' ? formData.tipo_outro : '',
                        })
                      }
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="material">Material</option>
                      <option value="mao_de_obra">Mão de Obra</option>
                      <option value="equipamento">Equipamento</option>
                      <option value="transporte">Transporte</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  {formData.tipo === 'outro' && (
                    <div className="form-group">
                      <label>Qual despesa? *</label>
                      <input
                        type="text"
                        required
                        value={formData.tipo_outro}
                        onChange={(e) => setFormData({ ...formData, tipo_outro: e.target.value })}
                        onBlur={(e) => setFormData({ ...formData, tipo_outro: normalizeMultilineText(e.target.value) })}
                        placeholder="Ex.: Frete, hospedagem, taxa..."
                      />
                    </div>
                  )}
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
                      placeholder="Descrição da despesa"
                      style={{ minHeight: '100px', fontFamily: 'inherit' }}
                    ></textarea>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Atualizar' : 'Criar'} Despesa
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
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((despesa) => (
                  <tr key={despesa.id}>
                    <td>{new Date(despesa.data).toLocaleDateString('pt-BR')}</td>
                    <td className="font-weight-600">{despesa.tipo}</td>
                    <td>{despesa.descricao}</td>
                    <td>{formatBRL(despesa.valor)}</td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(despesa)}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(despesa.id)}
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {despesas.length === 0 && (
              <div className="empty-state">
                <p>Nenhuma despesa cadastrada para esta obra</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Despesas;
