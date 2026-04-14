import React, { useEffect, useState } from 'react';
import { Download, AlertCircle, FileText, CalendarRange } from 'lucide-react';
import api from '../config/api';
import { formatBRL } from '../lib/input-formatters';
import '../styles/relatorios.css';

interface Obra {
  id: number;
  nome: string;
  cliente_nome: string;
  status: string;
}

interface Receita {
  id: number;
  obra_id: number;
  valor: number;
  data: string;
}

interface Despesa {
  id: number;
  obra_id: number;
  valor: number;
  data: string;
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

interface DashboardData {
  total_obras: number;
  obras_em_andamento: number;
  obras_finalizadas: number;
  total_despesas: number;
  total_receitas: number;
  lucro_total: number;
  margem_lucro: number;
}

type PeriodOption = 'hoje' | '7dias' | '30dias' | 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'personalizado';

const Relatorios: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodOption>('mes_atual');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    aplicarPeriodo('mes_atual');
  }, []);

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const toInputDate = (date: Date) => {
    const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return adjusted.toISOString().slice(0, 10);
  };

  const parseDate = (value: string) => {
    if (!value) return null;
    return new Date(`${value}T00:00:00`);
  };

  const getPeriodoDescricao = () => {
    if (!dataInicio || !dataFim) {
      return 'Todo o período disponível';
    }

    const inicio = new Date(`${dataInicio}T00:00:00`).toLocaleDateString('pt-BR');
    const fim = new Date(`${dataFim}T00:00:00`).toLocaleDateString('pt-BR');
    return `${inicio} até ${fim}`;
  };

  const aplicarPeriodo = (periodo: PeriodOption) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let inicio = new Date(hoje);
    let fim = new Date(hoje);

    switch (periodo) {
      case 'hoje':
        break;
      case '7dias':
        inicio.setDate(hoje.getDate() - 6);
        break;
      case '30dias':
        inicio.setDate(hoje.getDate() - 29);
        break;
      case 'mes_atual':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'mes_anterior':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case 'ano_atual':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        fim = new Date(hoje.getFullYear(), 11, 31);
        break;
      case 'personalizado':
        return;
    }

    setDataInicio(toInputDate(inicio));
    setDataFim(toInputDate(fim));
  };

  const handleChangePeriodo = (periodo: PeriodOption) => {
    setPeriodoSelecionado(periodo);
    aplicarPeriodo(periodo);
  };

  const handleChangeDataInicio = (value: string) => {
    setPeriodoSelecionado('personalizado');
    setDataInicio(value);
  };

  const handleChangeDataFim = (value: string) => {
    setPeriodoSelecionado('personalizado');
    setDataFim(value);
  };

  const handleLimparFiltros = () => {
    setPeriodoSelecionado('mes_atual');
    aplicarPeriodo('mes_atual');
  };

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      const [obrasRes, receitasRes, despesasRes] = await Promise.all([
        api.getObras(),
        api.getReceitas(),
        api.getDespesas(),
      ]);

      setObras(obrasRes.data || []);
      setReceitas(receitasRes.data || []);
      setDespesas(despesasRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const inicioFiltro = parseDate(dataInicio);
  const fimFiltro = parseDate(dataFim);

  const receitasFiltradas = receitas.filter((receita) => {
    const data = parseDate(receita.data);
    if (!data) return false;
    if (inicioFiltro && data < inicioFiltro) return false;
    if (fimFiltro && data > fimFiltro) return false;
    return true;
  });

  const despesasFiltradas = despesas.filter((despesa) => {
    const data = parseDate(despesa.data);
    if (!data) return false;
    if (inicioFiltro && data < inicioFiltro) return false;
    if (fimFiltro && data > fimFiltro) return false;
    return true;
  });

  const obraFinanceiroMap = new Map<number, ObraFinanceiro>();

  obras.forEach((obra) => {
    obraFinanceiroMap.set(obra.id, {
      id: obra.id,
      nome: obra.nome,
      cliente_nome: obra.cliente_nome,
      status: obra.status,
      total_despesas: 0,
      total_receitas: 0,
      lucro_prejuizo: 0,
    });
  });

  receitasFiltradas.forEach((receita) => {
    const item = obraFinanceiroMap.get(receita.obra_id);
    if (item) {
      item.total_receitas += Number(receita.valor || 0);
    }
  });

  despesasFiltradas.forEach((despesa) => {
    const item = obraFinanceiroMap.get(despesa.obra_id);
    if (item) {
      item.total_despesas += Number(despesa.valor || 0);
    }
  });

  const lucroPorObra = Array.from(obraFinanceiroMap.values())
    .map((obra) => ({
      ...obra,
      lucro_prejuizo: obra.total_receitas - obra.total_despesas,
    }))
    .filter((obra) => obra.total_receitas > 0 || obra.total_despesas > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const dashboardData: DashboardData = {
    total_obras: lucroPorObra.length,
    obras_em_andamento: lucroPorObra.filter((obra) => obra.status === 'em_andamento').length,
    obras_finalizadas: lucroPorObra.filter((obra) => obra.status === 'finalizada').length,
    total_despesas: lucroPorObra.reduce((acc, obra) => acc + obra.total_despesas, 0),
    total_receitas: lucroPorObra.reduce((acc, obra) => acc + obra.total_receitas, 0),
    lucro_total: lucroPorObra.reduce((acc, obra) => acc + obra.lucro_prejuizo, 0),
    margem_lucro: 0,
  };

  dashboardData.margem_lucro =
    dashboardData.total_receitas > 0 ? (dashboardData.lucro_total / dashboardData.total_receitas) * 100 : 0;

  const exportarPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=900');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Financeiro - RM Fundações</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #1e3c72; text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
          h2 { color: #667eea; margin-top: 30px; border-left: 4px solid #667eea; padding-left: 10px; }
          .period { text-align: center; color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f0f4ff; color: #1e3c72; padding: 12px; text-align: left; border-bottom: 2px solid #667eea; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .summary { background-color: #f0f4ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .summary-item { display: inline-block; margin-right: 30px; margin-bottom: 12px; }
          .summary-label { font-weight: bold; color: #667eea; }
          .summary-value { font-size: 18px; color: #1e3c72; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Relatório Financeiro - RM Fundações</h1>
        <p class="period">Período analisado: ${getPeriodoDescricao()}</p>
        <p style="text-align: center; color: #6b7280;">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>

        <h2>Resumo Geral</h2>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Obras com movimentação:</div>
            <div class="summary-value">${dashboardData.total_obras}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Obras em Andamento:</div>
            <div class="summary-value">${dashboardData.obras_em_andamento}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Obras Finalizadas:</div>
            <div class="summary-value">${dashboardData.obras_finalizadas}</div>
          </div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total de Receitas:</div>
            <div class="summary-value positive">${formatBRL(dashboardData.total_receitas)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total de Despesas:</div>
            <div class="summary-value">${formatBRL(dashboardData.total_despesas)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Lucro Total:</div>
            <div class="summary-value ${dashboardData.lucro_total >= 0 ? 'positive' : 'negative'}">${formatBRL(dashboardData.lucro_total)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Margem de Lucro:</div>
            <div class="summary-value">${dashboardData.margem_lucro.toFixed(2)}%</div>
          </div>
        </div>

        <h2>Detalhamento por Obra</h2>
        <table>
          <thead>
            <tr>
              <th>Obra</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Lucro/Prejuízo</th>
            </tr>
          </thead>
          <tbody>
            ${lucroPorObra.map((obra) => `
              <tr>
                <td>${obra.nome}</td>
                <td>${obra.cliente_nome}</td>
                <td>${obra.status === 'em_andamento' ? 'Em Andamento' : obra.status === 'finalizada' ? 'Finalizada' : 'Planejamento'}</td>
                <td>${formatBRL(obra.total_receitas)}</td>
                <td>${formatBRL(obra.total_despesas)}</td>
                <td class="${obra.lucro_prejuizo >= 0 ? 'positive' : 'negative'}">${formatBRL(obra.lucro_prejuizo)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>RM Fundações - Sistema de Gestão de Obras</p>
          <p>Este relatório foi gerado automaticamente pelo sistema.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const exportarCSV = () => {
    let csv = `Periodo,${getPeriodoDescricao()}\n`;
    csv += 'Obra,Cliente,Status,Receitas,Despesas,Lucro/Prejuízo\n';
    lucroPorObra.forEach((obra) => {
      csv += `"${obra.nome}","${obra.cliente_nome}","${obra.status}","${obra.total_receitas}","${obra.total_despesas}","${obra.lucro_prejuizo}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_financeiro_${dataInicio || 'inicio'}_${dataFim || 'fim'}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="relatorios loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="relatorios">
      <div className="relatorios-header">
        <h1>Relatórios</h1>
        <p className="subtitle">Gere relatórios financeiros por período ou intervalo personalizado</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="relatorio-card">
        <div className="relatorios-filtros-header">
          <h2><CalendarRange size={18} /> Filtros do Relatório</h2>
          <span className="period-chip">{getPeriodoDescricao()}</span>
        </div>

        <div className="relatorios-filtros-grid">
          <div className="form-group">
            <label>Período</label>
            <select value={periodoSelecionado} onChange={(e) => handleChangePeriodo(e.target.value as PeriodOption)}>
              <option value="hoje">Hoje</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="mes_atual">Mês atual</option>
              <option value="mes_anterior">Mês anterior</option>
              <option value="ano_atual">Ano atual</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data inicial</label>
            <input type="date" value={dataInicio} onChange={(e) => handleChangeDataInicio(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Data final</label>
            <input type="date" value={dataFim} onChange={(e) => handleChangeDataFim(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="relatorios-actions">
        <button className="btn btn-primary" onClick={exportarPDF}>
          <Download size={20} /> Exportar como PDF
        </button>
        <button className="btn btn-secondary" onClick={handleLimparFiltros}>
          Limpar Filtros
        </button>
        <button className="btn btn-secondary" onClick={exportarCSV}>
          <Download size={20} /> Exportar como CSV
        </button>
      </div>

      <div className="relatorios-content">
        <div className="relatorio-card">
          <h2>Resumo Geral</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Obras com Movimentação</span>
              <span className="value">{dashboardData.total_obras}</span>
            </div>
            <div className="summary-item">
              <span className="label">Obras em Andamento</span>
              <span className="value">{dashboardData.obras_em_andamento}</span>
            </div>
            <div className="summary-item">
              <span className="label">Obras Finalizadas</span>
              <span className="value">{dashboardData.obras_finalizadas}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total de Receitas</span>
              <span className="value positive">{formatBRL(dashboardData.total_receitas)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total de Despesas</span>
              <span className="value">{formatBRL(dashboardData.total_despesas)}</span>
            </div>
            <div className={`summary-item ${dashboardData.lucro_total >= 0 ? 'positive' : 'negative'}`}>
              <span className="label">Lucro Total</span>
              <span className="value">{formatBRL(dashboardData.lucro_total)}</span>
            </div>
          </div>
        </div>

        <div className="relatorio-card">
          <h2>Detalhamento por Obra</h2>
          <div className="table-card">
            <table className="relatorio-table">
              <thead>
                <tr>
                  <th>Obra</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Receitas</th>
                  <th>Despesas</th>
                  <th>Lucro/Prejuízo</th>
                </tr>
              </thead>
              <tbody>
                {lucroPorObra.map((obra) => (
                  <tr key={obra.id}>
                    <td className="font-weight-600">{obra.nome}</td>
                    <td>{obra.cliente_nome}</td>
                    <td>
                      <span className={`badge ${obra.status === 'em_andamento' ? 'badge-warning' : obra.status === 'finalizada' ? 'badge-success' : 'badge-info'}`}>
                        {obra.status === 'em_andamento' ? 'Em Andamento' : obra.status === 'finalizada' ? 'Finalizada' : 'Planejamento'}
                      </span>
                    </td>
                    <td className="positive">{formatBRL(obra.total_receitas)}</td>
                    <td>{formatBRL(obra.total_despesas)}</td>
                    <td className={obra.lucro_prejuizo >= 0 ? 'positive' : 'negative'}>
                      {formatBRL(obra.lucro_prejuizo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lucroPorObra.length === 0 && (
              <div className="empty-state">
                <FileText size={48} />
                <p>Nenhuma movimentação encontrada para o período selecionado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
