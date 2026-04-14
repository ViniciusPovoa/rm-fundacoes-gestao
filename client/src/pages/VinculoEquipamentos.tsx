import React, { useEffect, useState } from 'react';
import { Plus, Trash2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import api from '../config/api';
import { normalizeDateInput } from '../lib/input-formatters';
import '../styles/crud.css';

interface Obra {
  id: number;
  nome: string;
}

interface Equipamento {
  id: number;
  nome: string;
  tipo: string;
  custo_uso: number;
}

interface VinculoEquipamento {
  id: number;
  equipamento_id: number;
  equipamento_nome?: string;
  equipamento_tipo?: string;
  nome?: string;
  tipo?: string;
  data_inicio: string;
  data_fim: string;
}

const VinculoEquipamentos: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [vinculos, setVinculos] = useState<VinculoEquipamento[]>([]);
  const [obraId, setObraId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    equipamento_id: '',
    data_inicio: '',
    data_fim: '',
  });

  const resetForm = () => {
    setFormData({ equipamento_id: '', data_inicio: '', data_fim: '' });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (obraId) {
      fetchVinculos();
    }
  }, [obraId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [obrasRes, equipamentosRes] = await Promise.all([
        api.getObras(),
        api.getEquipamentos(),
      ]);
      setObras(obrasRes.data || []);
      setEquipamentos(equipamentosRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchVinculos = async () => {
    try {
      const response = await api.getEquipamentosPorObra(parseInt(obraId));
      setVinculos(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vínculos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        equipamento_id: parseInt(formData.equipamento_id),
        data_inicio: normalizeDateInput(formData.data_inicio),
        data_fim: normalizeDateInput(formData.data_fim),
      };

      await api.vincularEquipamento(parseInt(obraId), submitData);
      resetForm();
      setShowForm(false);
      fetchVinculos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular equipamento');
    }
  };

  const handleDelete = async (equipamentoId: number) => {
    if (window.confirm('Tem certeza que deseja desvincular este equipamento?')) {
      try {
        await api.desvinculaEquipamento(parseInt(obraId), equipamentoId);
        fetchVinculos();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao desvincular equipamento');
      }
    }
  };

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <h1>Vinculação de Equipamentos</h1>
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
            <h2 style={{ margin: 0 }}>Equipamentos Vinculados</h2>
            <button className="btn btn-primary" onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}>
              <Plus size={20} /> Vincular Equipamento
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <h2>Vincular Equipamento à Obra</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Equipamento *</label>
                    <select
                      required
                      value={formData.equipamento_id}
                      onChange={(e) => setFormData({ ...formData, equipamento_id: e.target.value })}
                    >
                      <option value="">Selecione um equipamento</option>
                      {equipamentos.map((equip) => (
                        <option key={equip.id} value={equip.id}>
                          {equip.nome} ({equip.tipo}) - R$ {equip.custo_uso.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/dia
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Data de Início *</label>
                    <input
                      type="date"
                      required
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: normalizeDateInput(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de Fim</label>
                    <input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: normalizeDateInput(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Vincular Equipamento
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
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
                  <th>Equipamento</th>
                  <th>Tipo</th>
                  <th>Data de Início</th>
                  <th>Data de Fim</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {vinculos.map((vinculo) => (
                  <tr key={vinculo.id}>
                    <td className="font-weight-600">{vinculo.equipamento_nome || vinculo.nome || '-'}</td>
                    <td>{vinculo.equipamento_tipo || vinculo.tipo || '-'}</td>
                    <td>{new Date(vinculo.data_inicio).toLocaleDateString('pt-BR')}</td>
                    <td>{vinculo.data_fim ? new Date(vinculo.data_fim).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(vinculo.equipamento_id)}
                        title="Desvincular"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vinculos.length === 0 && (
              <div className="empty-state">
                <LinkIcon size={48} />
                <p>Nenhum equipamento vinculado a esta obra</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VinculoEquipamentos;
