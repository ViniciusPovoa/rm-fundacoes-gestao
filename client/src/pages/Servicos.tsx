import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import api from '../config/api';
import { formatBRL, formatCurrencyFromNumber, formatDecimal, maskCurrency, maskDecimal, normalizeMultilineText, parseCurrency, parseDecimal } from '../lib/input-formatters';
import '../styles/crud.css';

interface Obra {
  id: number;
  nome: string;
}

interface Servico {
  id: number;
  obra_id: number;
  tipo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  preco_unitario: number;
  valor_previsto: number;
  valor_realizado: number;
}

const Servicos: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [obraId, setObraId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tipo: '',
    unidade: 'UN',
    quantidade: '',
    preco_unitario: '',
    descricao: '',
    valor_realizado: '',
  });

  const resetForm = () => {
    setFormData({
      tipo: '',
      unidade: 'UN',
      quantidade: '',
      preco_unitario: '',
      descricao: '',
      valor_realizado: '',
    });
  };

  useEffect(() => {
    fetchObras();
  }, []);

  useEffect(() => {
    if (obraId) {
      fetchServicos();
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

  const fetchServicos = async () => {
    try {
      const response = await api.getServicosPorObra(parseInt(obraId));
      setServicos(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quantidade = parseDecimal(formData.quantidade);
      const precoUnitario = parseCurrency(formData.preco_unitario);
      const valorPrevisto = quantidade * precoUnitario;

      const submitData = {
        tipo: formData.tipo,
        unidade: formData.unidade,
        quantidade,
        preco_unitario: precoUnitario,
        descricao: normalizeMultilineText(formData.descricao),
        obra_id: parseInt(obraId),
        valor_previsto: valorPrevisto,
        valor_realizado: parseCurrency(formData.valor_realizado),
      };

      if (editingId) {
        await api.updateServico(editingId, submitData);
      } else {
        await api.createServico(submitData);
      }
      resetForm();
      setEditingId(null);
      setShowForm(false);
      fetchServicos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar serviço');
    }
  };

  const handleEdit = (servico: Servico) => {
    setFormData({
      tipo: servico.tipo,
      unidade: servico.unidade || 'UN',
      quantidade: formatDecimal(servico.quantidade || 0),
      preco_unitario: formatCurrencyFromNumber(servico.preco_unitario || servico.valor_previsto || 0),
      descricao: servico.descricao,
      valor_realizado: formatCurrencyFromNumber(servico.valor_realizado),
    });
    setEditingId(servico.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este serviço?')) {
      try {
        await api.deleteServico(id);
        fetchServicos();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao deletar serviço');
      }
    }
  };

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  const totalPrevistoFormulario = parseDecimal(formData.quantidade) * parseCurrency(formData.preco_unitario);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <h1>Serviços</h1>
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
            <h2 style={{ margin: 0 }}>Serviços da Obra</h2>
            <button className="btn btn-primary" onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(!showForm);
            }}>
              <Plus size={20} /> Novo Serviço
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <h2>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tipo *</label>
                    <select
                      required
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="estaca">Estaca</option>
                      <option value="sondagem">Sondagem</option>
                      <option value="escavacao">Escavação</option>
                      <option value="aterro">Aterro</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unidade *</label>
                    <input
                      type="text"
                      required
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value.toUpperCase().slice(0, 20) })}
                      placeholder="UN, MTS, M2..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantidade *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: maskDecimal(e.target.value, 2) })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Preço Unitário *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formData.preco_unitario}
                      onChange={(e) => setFormData({ ...formData, preco_unitario: maskCurrency(e.target.value) })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Previsto</label>
                    <input
                      type="text"
                      value={formatBRL(totalPrevistoFormulario)}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Valor Realizado *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formData.valor_realizado}
                      onChange={(e) => setFormData({ ...formData, valor_realizado: maskCurrency(e.target.value) })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      onBlur={(e) => setFormData({ ...formData, descricao: normalizeMultilineText(e.target.value) })}
                      placeholder="Descrição do serviço"
                      style={{ minHeight: '100px', fontFamily: 'inherit' }}
                    ></textarea>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Atualizar' : 'Criar'} Serviço
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
                  <th>Tipo</th>
                  <th>Unid.</th>
                  <th>Quant.</th>
                  <th>P. Unit.</th>
                  <th>Descrição</th>
                  <th>P. Total</th>
                  <th>Valor Realizado</th>
                  <th>Diferença</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((servico) => {
                  const diferenca = servico.valor_realizado - servico.valor_previsto;
                  return (
                    <tr key={servico.id}>
                      <td className="font-weight-600">{servico.tipo}</td>
                      <td>{servico.unidade || 'UN'}</td>
                      <td>{formatDecimal(servico.quantidade || 0)}</td>
                      <td>{formatBRL(servico.preco_unitario || 0)}</td>
                      <td>{servico.descricao}</td>
                      <td>{formatBRL(servico.valor_previsto)}</td>
                      <td>{formatBRL(servico.valor_realizado)}</td>
                      <td style={{ color: diferenca > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {formatBRL(diferenca)}
                      </td>
                      <td className="actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(servico)}
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(servico.id)}
                          title="Deletar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {servicos.length === 0 && (
              <div className="empty-state">
                <p>Nenhum serviço cadastrado para esta obra</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Servicos;
