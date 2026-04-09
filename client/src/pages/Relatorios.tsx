import React, { useEffect, useState } from 'react';
import { Download, AlertCircle, FileText } from 'lucide-react';
import api from '../config/api';
import '../styles/relatorios.css';

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

const Relatorios: React.FC = () => {
  const [lucroPorObra, setLucroPorObra] = useState<ObraFinanceiro[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      const [lucros, resumo] = await Promise.all([
        api.getLucroPorObra(),
        api.getResumoDashboard(),
      ]);
      setLucroPorObra(lucros.data || []);
      setDashboardData(resumo.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
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
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f0f4ff; color: #1e3c72; padding: 12px; text-align: left; border-bottom: 2px solid #667eea; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .summary { background-color: #f0f4ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .summary-item { display: inline-block; margin-right: 30px; }
          .summary-label { font-weight: bold; color: #667eea; }
          .summary-value { font-size: 18px; color: #1e3c72; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Relatório Financeiro - RM Fundações</h1>
        <p style="text-align: center; color: #6b7280;">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>

        <h2>Resumo Geral</h2>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total de Obras:</div>
            <div class="summary-value">${dashboardData?.total_obras || 0}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Obras em Andamento:</div>
            <div class="summary-value">${dashboardData?.obras_em_andamento || 0}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Obras Finalizadas:</div>
            <div class="summary-value">${dashboardData?.obras_finalizadas || 0}</div>
          </div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total de Receitas:</div>
            <div class="summary-value positive">R$ ${(dashboardData?.total_receitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total de Despesas:</div>
            <div class="summary-value">R$ ${(dashboardData?.total_despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Lucro Total:</div>
            <div class="summary-value ${(dashboardData?.lucro_total || 0) >= 0 ? 'positive' : 'negative'}">R$ ${(dashboardData?.lucro_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Margem de Lucro:</div>
            <div class="summary-value">${(dashboardData?.margem_lucro || 0).toFixed(2)}%</div>
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
            ${lucroPorObra.map(obra => `
              <tr>
                <td>${obra.nome}</td>
                <td>${obra.cliente_nome}</td>
                <td>${obra.status === 'em_andamento' ? 'Em Andamento' : obra.status === 'finalizada' ? 'Finalizada' : 'Planejamento'}</td>
                <td>R$ ${obra.total_receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>R$ ${obra.total_despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="${obra.lucro_prejuizo >= 0 ? 'positive' : 'negative'}">R$ ${obra.lucro_prejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
    let csv = 'Obra,Cliente,Status,Receitas,Despesas,Lucro/Prejuízo\n';
    lucroPorObra.forEach(obra => {
      csv += `"${obra.nome}","${obra.cliente_nome}","${obra.status}","${obra.total_receitas}","${obra.total_despesas}","${obra.lucro_prejuizo}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="relatorios loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="relatorios">
      <div className="relatorios-header">
        <h1>Relatórios</h1>
        <p className="subtitle">Gere e exporte relatórios financeiros</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="relatorios-actions">
        <button className="btn btn-primary" onClick={exportarPDF}>
          <Download size={20} /> Exportar como PDF
        </button>
        <button className="btn btn-secondary" onClick={exportarCSV}>
          <Download size={20} /> Exportar como CSV
        </button>
      </div>

      <div className="relatorios-content">
        {/* Resumo Geral */}
        <div className="relatorio-card">
          <h2>Resumo Geral</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total de Obras</span>
              <span className="value">{dashboardData?.total_obras || 0}</span>
            </div>
            <div className="summary-item">
              <span className="label">Obras em Andamento</span>
              <span className="value">{dashboardData?.obras_em_andamento || 0}</span>
            </div>
            <div className="summary-item">
              <span className="label">Obras Finalizadas</span>
              <span className="value">{dashboardData?.obras_finalizadas || 0}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total de Receitas</span>
              <span className="value positive">R$ {(dashboardData?.total_receitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total de Despesas</span>
              <span className="value">R$ {(dashboardData?.total_despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className={`summary-item ${(dashboardData?.lucro_total || 0) >= 0 ? 'positive' : 'negative'}`}>
              <span className="label">Lucro Total</span>
              <span className="value">R$ {(dashboardData?.lucro_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Detalhamento por Obra */}
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
                      <span className={`badge ${obra.status === 'em_andamento' ? 'badge-warning' : 'badge-success'}`}>
                        {obra.status === 'em_andamento' ? 'Em Andamento' : 'Finalizada'}
                      </span>
                    </td>
                    <td className="positive">R$ {obra.total_receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>R$ {obra.total_despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className={obra.lucro_prejuizo >= 0 ? 'positive' : 'negative'}>
                      R$ {obra.lucro_prejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lucroPorObra.length === 0 && (
              <div className="empty-state">
                <FileText size={48} />
                <p>Nenhuma obra cadastrada para gerar relatório</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
