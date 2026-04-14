import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Eye } from 'lucide-react';
import { Link } from 'wouter';
import api from '../config/api';
import { normalizeDateInput, normalizeSingleLineText } from '../lib/input-formatters';
import '../styles/crud.css';

interface Cliente {
  id: number;
  nome: string;
}

interface Obra {
  id: number;
  nome: string;
  cliente_id: number;
  cliente_nome: string;
  localizacao: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

const Obras: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cliente_id: '',
    localizacao: '',
    data_inicio: '',
    data_fim: '',
    status: 'planejamento',
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      cliente_id: '',
      localizacao: '',
      data_inicio: '',
      data_fim: '',
      status: 'planejamento',
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [obrasRes, clientesRes] = await Promise.all([
        api.getObras(),
        api.getClientes(),
      ]);
      setObras(obrasRes.data || []);
      setClientes(clientesRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        nome: normalizeSingleLineText(formData.nome),
        cliente_id: parseInt(formData.cliente_id),
        localizacao: normalizeSingleLineText(formData.localizacao),
        data_inicio: normalizeDateInput(formData.data_inicio),
        data_fim: normalizeDateInput(formData.data_fim),
        status: formData.status,
      };

      if (editingId) {
        await api.updateObra(editingId, submitData);
      } else {
        await api.createObra(submitData);
      }
      resetForm();
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar obra');
    }
  };

  const handleEdit = (obra: Obra) => {
    setFormData({
      nome: obra.nome,
      cliente_id: obra.cliente_id.toString(),
      localizacao: obra.localizacao,
      data_inicio: normalizeDateInput(obra.data_inicio),
      data_fim: normalizeDateInput(obra.data_fim),
      status: obra.status,
    });
    setEditingId(obra.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta obra?')) {
      try {
        await api.deleteObra(id);
        fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao deletar obra');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'badge-warning';
      case 'finalizada':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'finalizada':
        return 'Finalizada';
      default:
        return 'Planejamento';
    }
  };

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <h1>Obras</h1>
        <button className="btn btn-primary" onClick={() => {
          resetForm();
          setEditingId(null);
          setShowForm(!showForm);
        }}>
          <Plus size={20} /> Nova Obra
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
          <h2>{editingId ? 'Editar Obra' : 'Nova Obra'}</h2>
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
                  placeholder="Nome da obra"
                />
              </div>
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  required
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
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
              <div className="form-group">
                <label>Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="planejamento">Planejamento</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Localização</label>
                <input
                  type="text"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, localizacao: normalizeSingleLineText(e.target.value) })}
                  placeholder="Localização da obra"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Atualizar' : 'Criar'} Obra
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
              <th>Cliente</th>
              <th>Localização</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id}>
                <td className="font-weight-600">{obra.nome}</td>
                <td>{obra.cliente_nome}</td>
                <td>{obra.localizacao}</td>
                <td>{new Date(obra.data_inicio).toLocaleDateString('pt-BR')}</td>
                <td>{obra.data_fim ? new Date(obra.data_fim).toLocaleDateString('pt-BR') : '-'}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(obra.status)}`}>
                    {getStatusLabel(obra.status)}
                  </span>
                </td>
                <td className="actions">
                  <Link href={`/obras/${obra.id}`}>
                    <a className="btn-icon btn-view" title="Ver detalhes">
                      <Eye size={18} />
                    </a>
                  </Link>
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(obra)}
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(obra.id)}
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {obras.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma obra cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Obras;
