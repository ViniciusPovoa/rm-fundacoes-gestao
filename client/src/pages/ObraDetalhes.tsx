import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Calendar, MapPin, User } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import api from '../config/api';
import { formatBRL } from '../lib/input-formatters';
import '../styles/crud.css';

interface Financeiro {
  total_despesas: number;
  total_receitas: number;
  lucro_prejuizo: number;
  margem_lucro: number;
}

interface ObraDetalhada {
  id: number;
  nome: string;
  cliente_id: number;
  cliente_nome: string;
  cliente_email?: string;
  cliente_telefone?: string;
  localizacao: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  financeiro?: Financeiro;
}

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

const ObraDetalhes: React.FC = () => {
  const [, params] = useRoute('/obras/:id');
  const [obra, setObra] = useState<ObraDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarObra = async () => {
      if (!params?.id) {
        setError('Obra não encontrada');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getObra(Number(params.id));
        setObra(response.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes da obra');
      } finally {
        setLoading(false);
      }
    };

    carregarObra();
  }, [params?.id]);

  if (loading) {
    return <div className="crud-page loading"><div className="spinner"></div></div>;
  }

  if (error || !obra) {
    return (
      <div className="crud-page">
        <div className="crud-header">
          <h1>Detalhes da Obra</h1>
          <Link href="/obras" className="btn btn-secondary">
            <ArrowLeft size={18} /> Voltar
          </Link>
        </div>

        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error || 'Obra não encontrada'}</span>
        </div>
      </div>
    );
  }

  const financeiro = obra.financeiro || {
    total_despesas: 0,
    total_receitas: 0,
    lucro_prejuizo: 0,
    margem_lucro: 0,
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>{obra.nome}</h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Detalhes e resumo financeiro da obra</p>
        </div>
        <Link href="/obras" className="btn btn-secondary">
          <ArrowLeft size={18} /> Voltar para Obras
        </Link>
      </div>

      <div className="form-card">
        <h2>Informações Gerais</h2>
        <div className="form-grid" style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label>Cliente</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
              <User size={16} />
              <span>{obra.cliente_nome}</span>
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <div style={{ color: '#374151' }}>{getStatusLabel(obra.status)}</div>
          </div>
          <div className="form-group">
            <label>Período</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
              <Calendar size={16} />
              <span>
                {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
                {obra.data_fim ? ` até ${new Date(obra.data_fim).toLocaleDateString('pt-BR')}` : ''}
              </span>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Localização</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
              <MapPin size={16} />
              <span>{obra.localizacao || 'Não informada'}</span>
            </div>
          </div>
          {(obra.cliente_email || obra.cliente_telefone) && (
            <div className="form-group full-width">
              <label>Contato do Cliente</label>
              <div style={{ color: '#374151' }}>
                {[obra.cliente_email, obra.cliente_telefone].filter(Boolean).join(' | ')}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="table-card">
        <table className="crud-table">
          <thead>
            <tr>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Resultado</th>
              <th>Margem</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: '#10b981', fontWeight: 600 }}>{formatBRL(financeiro.total_receitas)}</td>
              <td>{formatBRL(financeiro.total_despesas)}</td>
              <td style={{ color: financeiro.lucro_prejuizo >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {formatBRL(financeiro.lucro_prejuizo)}
              </td>
              <td>{Number(financeiro.margem_lucro || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ObraDetalhes;
