import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, AlertCircle, Calendar } from 'lucide-react';
import api from '../config/api';
import '../styles/dashboard-avancada.css';

interface KPI {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ObraStatus {
  status: string;
  count: number;
  percentage: number;
}

const DashboardAvancada: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [obrasSelecionadas, setObrasSelecionadas] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, [selectedPeriod]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resumo, lucro, status, receitas] = await Promise.all([
        api.getResumoDashboard(),
        api.getLucroPorObra(),
        api.getObrasStatus(),
        api.getReceitasDespesas(),
      ]);

      setDashboardData({
        resumo: resumo.data,
        lucro: lucro.data,
        status: status.data,
        receitas: receitas.data,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Carregando dados...</div>;
  }

  const resumo = dashboardData?.resumo || {};
  const lucroData = dashboardData?.lucro || [];
  const statusData = dashboardData?.status || [];
  const receitasData = dashboardData?.receitas || [];

  // Calcular KPIs
  const kpis: KPI[] = [
    {
      label: 'Receita Total',
      value: `R$ ${(resumo.receita_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 12.5,
      icon: <DollarSign size={24} />,
      color: '#10b981',
    },
    {
      label: 'Despesa Total',
      value: `R$ ${(resumo.despesa_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: -5.2,
      icon: <TrendingDown size={24} />,
      color: '#ef4444',
    },
    {
      label: 'Lucro Líquido',
      value: `R$ ${(resumo.lucro_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 18.3,
      icon: <TrendingUp size={24} />,
      color: '#3b82f6',
    },
    {
      label: 'Obras em Andamento',
      value: `${resumo.obras_em_andamento || 0}`,
      change: 0,
      icon: <Briefcase size={24} />,
      color: '#f59e0b',
    },
  ];

  // Preparar dados para gráfico de status
  const statusChartData = statusData.map((item: any) => ({
    name: item.status,
    value: item.count,
  }));

  // Cores para o gráfico de pizza
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // Obras com prejuízo
  const obrasComPrejuizo = lucroData.filter((obra: any) => obra.lucro < 0);

  return (
    <div className="dashboard-avancada">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard Executivo</h1>
        <div className="period-selector">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Último Ano</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpis-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-icon" style={{ color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="kpi-content">
              <p className="kpi-label">{kpi.label}</p>
              <h3 className="kpi-value">{kpi.value}</h3>
              <div className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}% vs período anterior
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Receita vs Despesa */}
        <div className="chart-card">
          <h3>Receita vs Despesa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={receitasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Bar dataKey="receita" fill="#10b981" name="Receita" />
              <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status das Obras */}
        <div className="chart-card">
          <h3>Distribuição de Obras por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lucro por Obra */}
        <div className="chart-card full-width">
          <h3>Lucro por Obra</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lucroData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome_obra" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas */}
      {obrasComPrejuizo.length > 0 && (
        <div className="alerts-section">
          <h3>
            <AlertCircle size={20} /> Alertas - Obras com Prejuízo
          </h3>
          <div className="alerts-list">
            {obrasComPrejuizo.map((obra: any, index: number) => (
              <div key={index} className="alert-item">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <p className="alert-title">{obra.nome_obra}</p>
                  <p className="alert-description">
                    Prejuízo de R$ {Math.abs(obra.lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Obras */}
      <div className="obras-table-section">
        <h3>Obras Recentes</h3>
        <div className="table-responsive">
          <table className="obras-table">
            <thead>
              <tr>
                <th>Obra</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Receita</th>
                <th>Despesa</th>
                <th>Lucro</th>
                <th>Progresso</th>
              </tr>
            </thead>
            <tbody>
              {lucroData.slice(0, 5).map((obra: any, index: number) => (
                <tr key={index}>
                  <td className="obra-name">{obra.nome_obra}</td>
                  <td>{obra.cliente_nome}</td>
                  <td>
                    <span className={`status-badge status-${obra.status}`}>{obra.status}</span>
                  </td>
                  <td className="valor-positivo">R$ {obra.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="valor-negativo">R$ {obra.despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className={obra.lucro >= 0 ? 'valor-positivo' : 'valor-negativo'}>
                    R$ {obra.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${obra.progresso || 0}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAvancada;
