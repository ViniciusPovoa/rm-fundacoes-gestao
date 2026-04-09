import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Briefcase, AlertCircle } from 'lucide-react';
import api from '../config/api';
import '../styles/dashboard.css';

interface DashboardData {
  total_obras: number;
  obras_em_andamento: number;
  obras_finalizadas: number;
  total_despesas: number;
  total_receitas: number;
  lucro_total: number;
  margem_lucro: number;
}

interface ObraFinanceiro {
  id: number;
  nome: string;
  cliente_nome: string;
  status: string;
  total_despesas: number;
  total_receitas: number;
  lucro_prejuizo: number;
}

interface ReceitaDespesa {
  id: number;
  nome: string;
  total_despesas: number;
  total_receitas: number;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lucroPorObra, setLucroPorObra] = useState<ObraFinanceiro[]>([]);
  const [receitasDespesas, setReceitasDespesas] = useState<ReceitaDespesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [resumo, lucros, rd] = await Promise.all([
          api.getResumoDashboard(),
          api.getLucroPorObra(),
          api.getReceitasDespesas(),
        ]);

        setDashboardData(resumo.data);
        setLucroPorObra(lucros.data || []);
        setReceitasDespesas(rd.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Erro ao carregar dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Visão geral do desempenho financeiro</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#667eea' }}>
            <Briefcase size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total de Obras</p>
            <h3 className="kpi-value">{dashboardData?.total_obras || 0}</h3>
            <p className="kpi-subtext">
              {dashboardData?.obras_em_andamento || 0} em andamento
            </p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#f093fb' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total de Receitas</p>
            <h3 className="kpi-value">
              R$ {(dashboardData?.total_receitas || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="kpi-subtext">Valores recebidos</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#4facfe' }}>
            <AlertCircle size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total de Despesas</p>
            <h3 className="kpi-value">
              R$ {(dashboardData?.total_despesas || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="kpi-subtext">Valores gastos</p>
          </div>
        </div>

        <div className={`kpi-card ${(dashboardData?.lucro_total || 0) >= 0 ? 'positive' : 'negative'}`}>
          <div className="kpi-icon" style={{ backgroundColor: (dashboardData?.lucro_total || 0) >= 0 ? '#10b981' : '#ef4444' }}>
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Lucro Total</p>
            <h3 className="kpi-value">
              R$ {(dashboardData?.lucro_total || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="kpi-subtext">
              Margem: {(dashboardData?.margem_lucro || 0).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Receitas vs Despesas */}
        <div className="chart-card">
          <h3>Receitas vs Despesas por Obra</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={receitasDespesas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Bar dataKey="total_receitas" fill="#10b981" name="Receitas" />
              <Bar dataKey="total_despesas" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lucro por Obra */}
        <div className="chart-card">
          <h3>Lucro/Prejuízo por Obra</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lucroPorObra}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="lucro_prejuizo"
                stroke="#667eea"
                name="Lucro/Prejuízo"
                dot={{ fill: '#667eea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="status-section">
        <div className="status-card">
          <h3>Distribuição de Obras por Status</h3>
          <div className="status-stats">
            <div className="status-item">
              <span className="status-badge" style={{ backgroundColor: '#667eea' }}></span>
              <span>Em Andamento: {dashboardData?.obras_em_andamento || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-badge" style={{ backgroundColor: '#10b981' }}></span>
              <span>Finalizadas: {dashboardData?.obras_finalizadas || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
