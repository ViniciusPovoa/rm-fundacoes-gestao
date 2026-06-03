import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calculator,
  Download,
  Edit2,
  Plus,
  Printer,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../config/api';
import {
  formatBRL,
  formatDecimal,
  maskCurrency,
  maskDecimal,
  normalizeMultilineText,
  normalizeSingleLineText,
  onlyDigits,
  parseCurrency,
  parseDecimal,
  toNumber,
} from '../lib/input-formatters';
import '../styles/crud.css';
import '../styles/folha-pagamento.css';

interface FuncionarioFolha {
  id: number;
  referencia: string;
  nome: string;
  cargo: string;
  salario_base: number;
  metros_perfurados: number;
  valor_por_metro: number;
  valor_producao: number;
  movimentacao_diaria: number;
  dias_movimentacao: number;
  valor_movimentacao: number;
  total_folha: number;
  observacoes: string;
}

const getReferenceMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const calcularValorProducao = (funcionario: Pick<FuncionarioFolha, 'metros_perfurados' | 'valor_por_metro'>) =>
  funcionario.metros_perfurados * funcionario.valor_por_metro;

const calcularValorMovimentacao = (
  funcionario: Pick<FuncionarioFolha, 'movimentacao_diaria' | 'dias_movimentacao'>,
) => funcionario.movimentacao_diaria * funcionario.dias_movimentacao;

const calcularTotalFolha = (funcionario: FuncionarioFolha) =>
  funcionario.salario_base + calcularValorProducao(funcionario) + calcularValorMovimentacao(funcionario);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeCsvValue = (value: string | number) => `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

const formatCurrencyInput = (value: number) =>
  value
    ? value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '';

const normalizeFuncionarioFolha = (funcionario: FuncionarioFolha): FuncionarioFolha => ({
  ...funcionario,
  id: Number(funcionario.id),
  salario_base: toNumber(funcionario.salario_base),
  metros_perfurados: toNumber(funcionario.metros_perfurados),
  valor_por_metro: toNumber(funcionario.valor_por_metro),
  valor_producao: toNumber(funcionario.valor_producao),
  movimentacao_diaria: toNumber(funcionario.movimentacao_diaria),
  dias_movimentacao: Number(funcionario.dias_movimentacao || 0),
  valor_movimentacao: toNumber(funcionario.valor_movimentacao),
  total_folha: toNumber(funcionario.total_folha),
});

const FolhaPagamento: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<FuncionarioFolha[]>([]);
  const [referencia, setReferencia] = useState(getReferenceMonth);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    salario_base: '',
    metros_perfurados: '',
    valor_por_metro: '',
    movimentacao_diaria: '',
    dias_movimentacao: '',
    observacoes: '',
  });

  useEffect(() => {
    fetchFolhaPagamento(referencia);
  }, [referencia]);

  const fetchFolhaPagamento = async (referenciaSelecionada: string) => {
    try {
      setLoading(true);
      const response = await api.getFolhaPagamento(referenciaSelecionada);
      setFuncionarios(((response.data as FuncionarioFolha[]) || []).map(normalizeFuncionarioFolha));
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar folha de pagamento:', err);
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a folha de pagamento.');
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cargo: '',
      salario_base: '',
      metros_perfurados: '',
      valor_por_metro: '',
      movimentacao_diaria: '',
      dias_movimentacao: '',
      observacoes: '',
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nome = normalizeSingleLineText(formData.nome);

    if (!nome) {
      setError('Informe o nome do funcionário para calcular a folha.');
      return;
    }

    const submitData = {
      referencia,
      nome,
      cargo: normalizeSingleLineText(formData.cargo),
      salario_base: parseCurrency(formData.salario_base),
      metros_perfurados: parseDecimal(formData.metros_perfurados),
      valor_por_metro: parseCurrency(formData.valor_por_metro),
      movimentacao_diaria: parseCurrency(formData.movimentacao_diaria),
      dias_movimentacao: Number.parseInt(onlyDigits(formData.dias_movimentacao), 10) || 0,
      observacoes: normalizeMultilineText(formData.observacoes),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await api.updateRegistroFolhaPagamento(editingId, submitData);
      } else {
        await api.createRegistroFolhaPagamento(submitData);
      }

      await fetchFolhaPagamento(referencia);
      setError(null);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o registro da folha.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (funcionario: FuncionarioFolha) => {
    setFormData({
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      salario_base: formatCurrencyInput(funcionario.salario_base),
      metros_perfurados: funcionario.metros_perfurados ? formatDecimal(funcionario.metros_perfurados) : '',
      valor_por_metro: formatCurrencyInput(funcionario.valor_por_metro),
      movimentacao_diaria: formatCurrencyInput(funcionario.movimentacao_diaria),
      dias_movimentacao: funcionario.dias_movimentacao ? String(funcionario.dias_movimentacao) : '',
      observacoes: funcionario.observacoes,
    });
    setEditingId(funcionario.id);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja remover este funcionário da folha atual?')) {
      return;
    }

    try {
      await api.deleteRegistroFolhaPagamento(id);
      await fetchFolhaPagamento(referencia);
      setError(null);

      if (editingId === id) {
        closeForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover o registro da folha.');
    }
  };

  const handleExportCsv = () => {
    if (funcionarios.length === 0) {
      setError('Adicione ao menos um funcionário antes de exportar.');
      return;
    }

    let csv = `Referencia,${referencia}\n`;
    csv += 'Funcionario,Cargo,Salario Base,Metros Perfurados,Valor por Metro,Valor Producao,Movimentacao Diaria,Dias Movimentacao,Total Movimentacao,Total Folha,Observacoes\n';

    funcionarios.forEach((funcionario) => {
      csv += [
        escapeCsvValue(funcionario.nome),
        escapeCsvValue(funcionario.cargo),
        escapeCsvValue(funcionario.salario_base),
        escapeCsvValue(funcionario.metros_perfurados),
        escapeCsvValue(funcionario.valor_por_metro),
        escapeCsvValue(calcularValorProducao(funcionario)),
        escapeCsvValue(funcionario.movimentacao_diaria),
        escapeCsvValue(funcionario.dias_movimentacao),
        escapeCsvValue(calcularValorMovimentacao(funcionario)),
        escapeCsvValue(calcularTotalFolha(funcionario)),
        escapeCsvValue(funcionario.observacoes),
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `folha_pagamento_${referencia}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handlePrint = () => {
    if (funcionarios.length === 0) {
      setError('Adicione ao menos um funcionário antes de imprimir a folha.');
      return;
    }

    const totalSalarioBase = funcionarios.reduce((total, item) => total + item.salario_base, 0);
    const totalProducao = funcionarios.reduce((total, item) => total + calcularValorProducao(item), 0);
    const totalMovimentacao = funcionarios.reduce((total, item) => total + calcularValorMovimentacao(item), 0);
    const totalFolha = funcionarios.reduce((total, item) => total + calcularTotalFolha(item), 0);

    const printWindow = window.open('', '', 'height=720,width=1100');
    if (!printWindow) {
      setError('Não foi possível abrir a janela de impressão.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Folha de Pagamento - ${referencia}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
            h1 { color: #7f1d1d; margin-bottom: 8px; }
            p { color: #6b7280; }
            .summary { display: flex; gap: 16px; flex-wrap: wrap; margin: 24px 0; }
            .summary-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; min-width: 220px; background: #f9fafb; }
            .summary-label { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
            .summary-value { font-size: 22px; font-weight: bold; color: #7f1d1d; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background: #fef2f2; color: #7f1d1d; text-align: left; padding: 12px; border-bottom: 2px solid #dc2626; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
            .muted { color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Folha de Pagamento</h1>
          <p>Referência: ${escapeHtml(referencia)} | Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Funcionários</div>
              <div class="summary-value">${funcionarios.length}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Salário Base Total</div>
              <div class="summary-value">${formatBRL(totalSalarioBase)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Produção Total</div>
              <div class="summary-value">${formatBRL(totalProducao)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Folha Total</div>
              <div class="summary-value">${formatBRL(totalFolha)}</div>
            </div>
          </div>
          <p>Total de movimentação diária acumulada: <strong>${formatBRL(totalMovimentacao)}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Cargo</th>
                <th>Salário Base</th>
                <th>Produção</th>
                <th>Movimentação</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${funcionarios
                .map((funcionario) => {
                  const valorProducao = calcularValorProducao(funcionario);
                  const valorMovimentacao = calcularValorMovimentacao(funcionario);
                  const total = calcularTotalFolha(funcionario);

                  return `
                    <tr>
                      <td>
                        <strong>${escapeHtml(funcionario.nome)}</strong>
                        <div class="muted">${escapeHtml(funcionario.observacoes || 'Sem observações')}</div>
                      </td>
                      <td>${escapeHtml(funcionario.cargo || '-')}</td>
                      <td>${formatBRL(funcionario.salario_base)}</td>
                      <td>${formatBRL(valorProducao)}<div class="muted">${formatDecimal(funcionario.metros_perfurados)} m x ${formatBRL(funcionario.valor_por_metro)}</div></td>
                      <td>${formatBRL(valorMovimentacao)}<div class="muted">${funcionario.dias_movimentacao} dia(s) x ${formatBRL(funcionario.movimentacao_diaria)}</div></td>
                      <td><strong>${formatBRL(total)}</strong></td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const totalSalarioBase = funcionarios.reduce((total, item) => total + item.salario_base, 0);
  const totalProducao = funcionarios.reduce((total, item) => total + calcularValorProducao(item), 0);
  const totalMovimentacao = funcionarios.reduce((total, item) => total + calcularValorMovimentacao(item), 0);
  const totalFolha = funcionarios.reduce((total, item) => total + calcularTotalFolha(item), 0);

  const previewSalarioBase = parseCurrency(formData.salario_base);
  const previewMetrosPerfurados = parseDecimal(formData.metros_perfurados);
  const previewValorPorMetro = parseCurrency(formData.valor_por_metro);
  const previewMovimentacaoDiaria = parseCurrency(formData.movimentacao_diaria);
  const previewDiasMovimentacao = Number.parseInt(onlyDigits(formData.dias_movimentacao), 10) || 0;
  const previewProducao = previewMetrosPerfurados * previewValorPorMetro;
  const previewMovimentacao = previewMovimentacaoDiaria * previewDiasMovimentacao;
  const previewTotal = previewSalarioBase + previewProducao + previewMovimentacao;

  return (
    <div className="folha-pagamento">
      <div className="crud-header">
        <div>
          <h1>Folha de Pagamento</h1>
          <p className="folha-subtitle">
            Calcule a folha individual e consolidada com base em salário fixo, produção por metro perfurado e movimentação diária.
          </p>
        </div>
        <div className="folha-actions">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={18} /> Imprimir
          </button>
          <button className="btn btn-secondary" onClick={handleExportCsv}>
            <Download size={18} /> Exportar CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm((current) => !current);
              setError(null);
            }}
          >
            <Plus size={18} /> {showForm ? 'Fechar formulário' : 'Adicionar funcionário'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-card folha-referencia-card">
        <div className="folha-referencia-header">
          <div>
            <h2>Referência da folha</h2>
            <p>Use esta referência para organizar o cálculo mensal e os arquivos exportados.</p>
          </div>
          <div className="folha-referencia-field">
            <label>Mês de referência</label>
            <input
              type="month"
              value={referencia}
              onChange={(e) => {
                setReferencia(e.target.value);
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
            />
          </div>
        </div>
      </div>

      <div className="folha-metrics">
        <div className="folha-metric-card">
          <div className="folha-metric-icon icon-red">
            <Users size={22} />
          </div>
          <div>
            <span>Funcionários lançados</span>
            <strong>{funcionarios.length}</strong>
          </div>
        </div>

        <div className="folha-metric-card">
          <div className="folha-metric-icon icon-gold">
            <Wallet size={22} />
          </div>
          <div>
            <span>Salário base total</span>
            <strong>{formatBRL(totalSalarioBase)}</strong>
          </div>
        </div>

        <div className="folha-metric-card">
          <div className="folha-metric-icon icon-blue">
            <Calculator size={22} />
          </div>
          <div>
            <span>Produção por metros</span>
            <strong>{formatBRL(totalProducao)}</strong>
          </div>
        </div>

        <div className="folha-metric-card">
          <div className="folha-metric-icon icon-green">
            <Wallet size={22} />
          </div>
          <div>
            <span>Folha total</span>
            <strong>{formatBRL(totalFolha)}</strong>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="folha-form-grid">
          <div className="form-card">
            <h2>{editingId ? 'Editar funcionário' : 'Novo funcionário'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    onBlur={(e) => setFormData({ ...formData, nome: normalizeSingleLineText(e.target.value) })}
                    placeholder="Nome do funcionário"
                  />
                </div>

                <div className="form-group">
                  <label>Cargo</label>
                  <input
                    type="text"
                    disabled={submitting}
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    onBlur={(e) => setFormData({ ...formData, cargo: normalizeSingleLineText(e.target.value) })}
                    placeholder="Ex.: Perfurador, ajudante, operador"
                  />
                </div>

                <div className="form-group">
                  <label>Salário base</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={submitting}
                    value={formData.salario_base}
                    onChange={(e) => setFormData({ ...formData, salario_base: maskCurrency(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>

                <div className="form-group">
                  <label>Metros perfurados</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    disabled={submitting}
                    value={formData.metros_perfurados}
                    onChange={(e) => setFormData({ ...formData, metros_perfurados: maskDecimal(e.target.value, 2) })}
                    placeholder="0,00"
                  />
                </div>

                <div className="form-group">
                  <label>Valor ganho por metro</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={submitting}
                    value={formData.valor_por_metro}
                    onChange={(e) => setFormData({ ...formData, valor_por_metro: maskCurrency(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>

                <div className="form-group">
                  <label>Movimentação diária</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={submitting}
                    value={formData.movimentacao_diaria}
                    onChange={(e) => setFormData({ ...formData, movimentacao_diaria: maskCurrency(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>

                <div className="form-group">
                  <label>Dias com movimentação</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={submitting}
                    value={formData.dias_movimentacao}
                    onChange={(e) =>
                      setFormData({ ...formData, dias_movimentacao: onlyDigits(e.target.value).slice(0, 3) })
                    }
                    placeholder="0"
                  />
                  <small className="form-help">
                    Se a movimentação for paga por dia, informe aqui a quantidade de dias.
                  </small>
                </div>

                <div className="form-group full-width">
                  <label>Observações</label>
                  <textarea
                    disabled={submitting}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    onBlur={(e) => setFormData({ ...formData, observacoes: normalizeMultilineText(e.target.value) })}
                    placeholder="Observações do cálculo, período trabalhado ou observações internas"
                    style={{ minHeight: '110px', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingId ? 'Atualizar folha' : 'Salvar funcionário'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={submitting}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <div className="form-card folha-preview-card">
            <h2>Prévia do cálculo</h2>

            <div className="folha-preview-list">
              <div className="folha-preview-item">
                <span>Salário base</span>
                <strong>{formatBRL(previewSalarioBase)}</strong>
              </div>
              <div className="folha-preview-item">
                <span>Produção por metro</span>
                <strong>{formatBRL(previewProducao)}</strong>
              </div>
              <div className="folha-preview-item preview-detail">
                <span>{formatDecimal(previewMetrosPerfurados)} m x {formatBRL(previewValorPorMetro)}</span>
              </div>
              <div className="folha-preview-item">
                <span>Movimentação</span>
                <strong>{formatBRL(previewMovimentacao)}</strong>
              </div>
              <div className="folha-preview-item preview-detail">
                <span>{previewDiasMovimentacao} dia(s) x {formatBRL(previewMovimentacaoDiaria)}</span>
              </div>
              <div className="folha-preview-total">
                <span>Total estimado</span>
                <strong>{formatBRL(previewTotal)}</strong>
              </div>
            </div>

            <div className="folha-formula-box">
              <h3>Fórmula utilizada</h3>
              <p>
                <strong>Folha = salário base + (metros perfurados x valor por metro) + (movimentação diária x dias com movimentação)</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="folha-table-header">
          <div>
            <h2>Funcionários da folha</h2>
            <p>Controle individual e total consolidado do período selecionado.</p>
          </div>
          <div className="folha-table-totals">
            <span>Movimentação total: {formatBRL(totalMovimentacao)}</span>
            <strong>Total da folha: {formatBRL(totalFolha)}</strong>
          </div>
        </div>

        {loading ? (
          <div className="crud-page loading">
            <div className="spinner"></div>
          </div>
        ) : funcionarios.length === 0 ? (
          <div className="empty-state">
            <Calculator size={48} />
            <p>Nenhum funcionário cadastrado para a referência {referencia}. Use o formulário para começar.</p>
          </div>
        ) : (
          <div className="folha-table-wrapper">
            <table className="crud-table folha-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Salário Base</th>
                  <th>Metros</th>
                  <th>Valor/Metro</th>
                  <th>Produção</th>
                  <th>Mov. diária</th>
                  <th>Dias</th>
                  <th>Movimentação</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((funcionario) => {
                  const valorProducao = calcularValorProducao(funcionario);
                  const valorMovimentacao = calcularValorMovimentacao(funcionario);
                  const total = calcularTotalFolha(funcionario);

                  return (
                    <tr key={funcionario.id}>
                      <td>
                        <div className="folha-funcionario-cell">
                          <strong>{funcionario.nome}</strong>
                          <span>{funcionario.cargo || 'Sem cargo informado'}</span>
                        </div>
                      </td>
                      <td>{formatBRL(funcionario.salario_base)}</td>
                      <td>{formatDecimal(funcionario.metros_perfurados)}</td>
                      <td>{formatBRL(funcionario.valor_por_metro)}</td>
                      <td>{formatBRL(valorProducao)}</td>
                      <td>{formatBRL(funcionario.movimentacao_diaria)}</td>
                      <td>{funcionario.dias_movimentacao}</td>
                      <td>{formatBRL(valorMovimentacao)}</td>
                      <td className="folha-total-cell">{formatBRL(total)}</td>
                      <td className="actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(funcionario)}
                          title="Editar cálculo"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(funcionario.id)}
                          title="Remover funcionário"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolhaPagamento;
