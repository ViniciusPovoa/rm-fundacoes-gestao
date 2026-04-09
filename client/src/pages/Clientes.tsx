import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import api from '../config/api';
import '../styles/crud.css';

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  documento: string;
  endereco: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    documento: '',
    endereco: '',
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.getClientes();
      setClientes(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCliente(editingId, formData);
      } else {
        await api.createCliente(formData);
      }
      setFormData({ nome: '', telefone: '', email: '', documento: '', endereco: '' });
      setEditingId(null);
      setShowForm(false);
      fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await api.deleteCliente(id);
        fetchClientes();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao deletar cliente');
      }
    }
  };

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="crud-page">
      <div className="crud-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={() => {
          setFormData({ nome: '', telefone: '', email: '', documento: '', endereco: '' });
          setEditingId(null);
          setShowForm(!showForm);
        }}>
          <Plus size={20} /> Novo Cliente
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
          <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="form-group">
                <label>Documento *</label>
                <input
                  type="text"
                  required
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="CPF/CNPJ"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 9999-9999"
                />
              </div>
              <div className="form-group full-width">
                <label>Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Atualizar' : 'Criar'} Cliente
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ nome: '', telefone: '', email: '', documento: '', endereco: '' });
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
              <th>Documento</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td className="font-weight-600">{cliente.nome}</td>
                <td>{cliente.documento}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.endereco}</td>
                <td className="actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(cliente)}
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(cliente.id)}
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && (
          <div className="empty-state">
            <p>Nenhum cliente cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clientes;
