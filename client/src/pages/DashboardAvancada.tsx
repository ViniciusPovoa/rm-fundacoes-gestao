import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, DollarSign, Briefcase, AlertCircle, Users, Wallet } from 'lucide-react';
import api from '../config/api';
import { Switch } from '../components/ui/switch';
import { formatBRL } from '../lib/input-formatters';
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
  total: number;
}

interface DashboardResumo {
  total_receitas: number;
  total_despesas: number;
  lucro_total: number;
  obras_em_andamento: number;
  anteriores?: {
    total_receitas?: number;
    total_despesas?: number;
    lucro_total?: number;
    obras_em_andamento?: number;
  };
  comparativos?: {
    total_receitas?: number;
    total_despesas?: number;
    lucro_total?: number;
    obras_em_andamento?: number;
  };
}

interface ObraFinanceira {
  id: number;
  nome: string;
  cliente_nome: string;
  status: string;
  total_despesas: number;
  total_receitas: number;
  lucro_prejuizo: number;
  lucro_prejuizo_anterior?: number;
  variacao_receitas?: number;
  variacao_despesas?: number;
  variacao_lucro?: number;
}

interface ReceitaDespesa {
  id: number;
  nome: string;
  total_despesas: number;
  total_receitas: number;
}

interface FolhaPagamentoRegistro {
  id: number;
  referencia: string;
  total_folha: number | string;
}

const getPeriodDays = (period: string) => {
  switch (period) {
    case 'semana':
      return 7;
    case 'trimestre':
      return 90;
    case 'ano':
      return 365;
    case 'mes':
    default:
      return 30;
  }
};

const getPeriodRanges = (period: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = getPeriodDays(period);
  const currentEnd = new Date(today);
  const currentStart = new Date(today);
  currentStart.setDate(currentStart.getDate() - (days - 1));

  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (days - 1));

  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
  };
};

const getReferencesInRange = (start: Date, end: Date) => {
  const references = new Set<string>();
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const limit = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= limit) {
    references.add(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return references;
};

const calculatePercentageChange = (currentValue: number, previousValue: number) => {
  if (Math.abs(previousValue) < 0.00001) {
    return Math.abs(currentValue) < 0.00001 ? 0 : 100;
  }

  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
};

const abbreviateChartLabel = (label: string, maxLength = 14) => {
  const normalized = (label || '').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const firstTwoWords = `${words[0]} ${words[1]}`;
    if (firstTwoWords.length <= maxLength) {
      return firstTwoWords;
    }

    return `${firstTwoWords.slice(0, maxLength - 1)}…`;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
};

const getProgressoObra = (status: string) => {
  switch (status) {
    case 'finalizada':
      return 100;
    case 'em_andamento':
      return 60;
    default:
      return 20;
  }
};

const DashboardAvancada: React.FC = () => {
  const [isMobileChart, setIsMobileChart] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth <= 768;
  });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    resumo: DashboardResumo;
    lucro: ObraFinanceira[];
    status: ObraStatus[];
    receitas: ReceitaDespesa[];
    folha: FolhaPagamentoRegistro[];
  } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedObraId, setSelectedObraId] = useState('todas');
  const [incluirFolhaNoLucro, setIncluirFolhaNoLucro] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const syncViewport = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobileChart(event.matches);
    };

    syncViewport(mediaQuery);

    const listener = (event: MediaQueryListEvent) => syncViewport(event);
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  useEffect(() => {
    carregarDados();
  }, [selectedPeriod]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resumo, lucro, status, receitas, folha] = await Promise.all([
        api.getResumoDashboard(selectedPeriod),
        api.getLucroPorObra(selectedPeriod),
        api.getObrasStatus(),
        api.getReceitasDespesas(selectedPeriod),
        api.getFolhaPagamento(),
      ]);

      setDashboardData({
        resumo: resumo.data,
        lucro: lucro.data,
        status: status.data,
        receitas: receitas.data,
        folha: folha.data,
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

  const resumo = dashboardData?.resumo || {} as DashboardResumo;
  const lucroData = Array.isArray(dashboardData?.lucro) ? dashboardData.lucro : [];
  const statusData: ObraStatus[] = Array.isArray(dashboardData?.status) ? dashboardData.status : [];
  const receitasData = Array.isArray(dashboardData?.receitas) ? dashboardData.receitas : [];
  const folhaData: FolhaPagamentoRegistro[] = Array.isArray(dashboardData?.folha) ? dashboardData.folha : [];
  const selectedObra = selectedObraId === 'todas'
    ? null
    : lucroData.find((obra: any) => String(obra.id) === selectedObraId) || null;
  const filteredLucroData = selectedObra
    ? lucroData.filter((obra: any) => String(obra.id) === selectedObraId)
    : lucroData;
  const filteredReceitasData = selectedObra
    ? receitasData.filter((obra: any) => String(obra.id) === selectedObraId)
    : receitasData;
  const resumoExibido = selectedObra
    ? {
        total_receitas: Number(selectedObra.total_receitas || 0),
        total_despesas: Number(selectedObra.total_despesas || 0),
        lucro_total: Number(selectedObra.lucro_prejuizo || 0),
        obras_em_andamento: selectedObra.status === 'em_andamento' ? 1 : 0,
        comparativos: {
          total_receitas: Number(selectedObra.variacao_receitas || 0),
          total_despesas: Number(selectedObra.variacao_despesas || 0),
          lucro_total: Number(selectedObra.variacao_lucro || 0),
          obras_em_andamento: 0,
        },
      }
    : resumo;

  const ranges = getPeriodRanges(selectedPeriod);
  const referenciasAtuais = getReferencesInRange(ranges.currentStart, ranges.currentEnd);
  const referenciasAnteriores = getReferencesInRange(ranges.previousStart, ranges.previousEnd);
  const totalFolhaFuncionarios = folhaData.reduce((total, registro) => {
    return referenciasAtuais.has(registro.referencia)
      ? total + Number(registro.total_folha || 0)
      : total;
  }, 0);
  const totalFolhaAnterior = folhaData.reduce((total, registro) => {
    return referenciasAnteriores.has(registro.referencia)
      ? total + Number(registro.total_folha || 0)
      : total;
  }, 0);
  const variacaoFolhaFuncionarios = calculatePercentageChange(totalFolhaFuncionarios, totalFolhaAnterior);
  const podeAplicarFolhaNoLucro = selectedObraId === 'todas';
  const lucroLiquidoBase = Number(resumoExibido.lucro_total || 0);
  const lucroLiquidoConsiderado = incluirFolhaNoLucro && podeAplicarFolhaNoLucro
    ? lucroLiquidoBase - totalFolhaFuncionarios
    : lucroLiquidoBase;
  const lucroLiquidoAnteriorBase = selectedObra
    ? Number(selectedObra.lucro_prejuizo_anterior || 0)
    : Number(resumo.anteriores?.lucro_total || 0);
  const lucroLiquidoAnteriorConsiderado = incluirFolhaNoLucro && podeAplicarFolhaNoLucro
    ? lucroLiquidoAnteriorBase - totalFolhaAnterior
    : lucroLiquidoAnteriorBase;
  const variacaoLucroLiquido = calculatePercentageChange(lucroLiquidoConsiderado, lucroLiquidoAnteriorConsiderado);

  // Calcular KPIs
  const kpis: KPI[] = [
    {
      label: 'Receita Total',
      value: `R$ ${Number(resumoExibido.total_receitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: Number(resumoExibido.comparativos?.total_receitas || 0),
      icon: <DollarSign size={24} />,
      color: '#10b981',
    },
    {
      label: 'Despesa Total',
      value: `R$ ${Number(resumoExibido.total_despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: Number(resumoExibido.comparativos?.total_despesas || 0),
      icon: <TrendingDown size={24} />,
      color: '#ef4444',
    },
    {
      label: 'Despesas com Funcionários',
      value: `R$ ${Number(totalFolhaFuncionarios || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: variacaoFolhaFuncionarios,
      icon: <Users size={24} />,
      color: '#dc2626',
    },
    {
      label: 'Obras em Andamento',
      value: `${resumoExibido.obras_em_andamento || 0}`,
      change: Number(resumoExibido.comparativos?.obras_em_andamento || 0),
      icon: <Briefcase size={24} />,
      color: '#f59e0b',
    },
  ];

  // Preparar dados para gráfico de status
  const statusChartData = selectedObra
    ? [{
        name: selectedObra.status,
        value: 1,
      }]
    : statusData.map((item) => ({
        name: item.status,
        value: Number(item.total || 0),
      }));

  // Cores para o gráfico de pizza
  const COLORS = ['#dc2626', '#10b981', '#f59e0b', '#f87171'];

  // Obras com prejuízo
  const obrasComPrejuizo = filteredLucroData.filter((obra: any) => Number(obra.lucro_prejuizo || 0) < 0);

  return (
    <div className="dashboard-avancada">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard Executivo</h1>
        <div className="dashboard-filters">
          <div className="period-selector">
            <select value={selectedObraId} onChange={(e) => setSelectedObraId(e.target.value)}>
              <option value="todas">Todas as obras</option>
              {lucroData.map((obra: any) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="period-selector">
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>
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

      <div className="finance-cards-grid">
        <div className="finance-card finance-card-profit full-width">
          <div className="finance-card-switch-row">
            <div className="finance-card-header compact">
              <div className="finance-card-icon profit">
                <Wallet size={22} />
              </div>
              <div>
                <p className="finance-card-label">Lucro Líquido</p>
                <h3 className="finance-card-value">{formatBRL(lucroLiquidoConsiderado)}</h3>
              </div>
            </div>
            <label className={`finance-switch ${!podeAplicarFolhaNoLucro ? 'disabled' : ''}`}>
              <span>Com funcionários</span>
              <Switch
                checked={incluirFolhaNoLucro && podeAplicarFolhaNoLucro}
                onCheckedChange={setIncluirFolhaNoLucro}
                disabled={!podeAplicarFolhaNoLucro}
              />
            </label>
          </div>
          <div className={`finance-card-change ${variacaoLucroLiquido >= 0 ? 'positive' : 'negative'}`}>
            {variacaoLucroLiquido >= 0 ? '↑' : '↓'} {Math.abs(variacaoLucroLiquido).toFixed(1)}% vs período anterior
          </div>
          <p className="finance-card-help">
            {podeAplicarFolhaNoLucro
              ? incluirFolhaNoLucro
                ? 'Lucro operacional menos a despesa total com funcionários do período.'
                : 'Lucro operacional sem descontar a folha de funcionários.'
              : 'O ajuste da folha fica disponível apenas na visão geral de todas as obras.'}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Receita vs Despesa */}
        <div className="chart-card">
          <h3>Receita vs Despesa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={filteredReceitasData}
              margin={isMobileChart ? { top: 8, right: 8, left: -12, bottom: 44 } : { top: 8, right: 16, left: 8, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nome"
                angle={isMobileChart ? -20 : 0}
                textAnchor={isMobileChart ? 'end' : 'middle'}
                height={isMobileChart ? 72 : 48}
                interval={0}
                tick={{ fontSize: isMobileChart ? 11 : 12 }}
                tickFormatter={(value) => isMobileChart ? abbreviateChartLabel(String(value), 12) : String(value)}
              />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${Number(value || 0).toLocaleString('pt-BR')}`} />
              <Legend />
              <Bar dataKey="total_receitas" fill="#10b981" name="Receita" />
              <Bar dataKey="total_despesas" fill="#ef4444" name="Despesa" />
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
                {statusChartData.map((entry, index: number) => (
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
            <BarChart
              data={filteredLucroData}
              margin={isMobileChart ? { top: 8, right: 8, left: -12, bottom: 52 } : { top: 8, right: 16, left: 8, bottom: 28 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nome"
                angle={isMobileChart ? -24 : -35}
                textAnchor="end"
                height={isMobileChart ? 78 : 96}
                interval={0}
                tick={{ fontSize: isMobileChart ? 11 : 12 }}
                tickFormatter={(value) => isMobileChart ? abbreviateChartLabel(String(value), 13) : String(value)}
              />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${Number(value || 0).toLocaleString('pt-BR')}`} />
              <Bar dataKey="lucro_prejuizo" fill="#dc2626" name="Lucro" />
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
                  <p className="alert-title">{obra.nome}</p>
                  <p className="alert-description">
                    Prejuízo de R$ {Math.abs(Number(obra.lucro_prejuizo || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              {filteredLucroData.slice(0, 5).map((obra, index: number) => (
                <tr key={index}>
                  <td className="obra-name">{obra.nome}</td>
                  <td>{obra.cliente_nome}</td>
                  <td>
                    <span className={`status-badge status-${obra.status}`}>{obra.status}</span>
                  </td>
                  <td className="valor-positivo">{formatBRL(obra.total_receitas)}</td>
                  <td className="valor-negativo">{formatBRL(obra.total_despesas)}</td>
                  <td className={Number(obra.lucro_prejuizo || 0) >= 0 ? 'valor-positivo' : 'valor-negativo'}>
                    {formatBRL(obra.lucro_prejuizo)}
                  </td>
                  <td>
                      <div className="progress-bar" title={`${getProgressoObra(obra.status)}%`}>
                        <div className="progress-fill" style={{ width: `${getProgressoObra(obra.status)}%` }}></div>
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
