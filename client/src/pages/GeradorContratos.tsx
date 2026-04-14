import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, X } from 'lucide-react';
import jsPDF from 'jspdf';
import api from '../config/api';
import '../styles/gerador-contratos.css';

interface Obra {
  id: number;
  nome: string;
  cliente_nome: string;
  cliente_documento: string;
  cliente_email: string;
  cliente_telefone: string;
  localizacao: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  receita?: number;
  despesa?: number;
}

interface Servico {
  id: number;
  tipo: string;
  descricao: string;
  valor_previsto: number;
  valor_realizado: number;
}

const GeradorContratos: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    carregarObras();
  }, []);

  const carregarObras = async () => {
    try {
      setLoading(true);
      const response = await api.getObras();
      setObras(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarServicos = async (obraId: number) => {
    try {
      const response = await api.getServicosPorObra(obraId);
      setServicosSelecionados(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const handleSelecionarObra = async (obra: Obra) => {
    setObraSelecionada(obra);
    await carregarServicos(obra.id);
    setShowModal(true);
  };

  const gerarContratoPDF = () => {
    if (!obraSelecionada) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // ===== CABEÇALHO =====
    // Logo e nome da empresa (esquerda)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RM', margin, yPosition);
    doc.setFontSize(10);
    doc.text('FUNDAÇÕES', margin, yPosition + 6);

    // Dados da empresa (direita)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const rightX = pageWidth - margin - 50;
    doc.text('R. Atenas, 330', rightX, yPosition);
    doc.text('Araguari -MG', rightX, yPosition + 5);
    doc.text('TELEFONE: (34) 99113-6766', rightX, yPosition + 10);
    doc.text('empresarmfundacoes@gmail.com', rightX, yPosition + 15);

    // Referência
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Ref.: ${obraSelecionada.id}/${new Date().getFullYear()}.`, margin, yPosition + 25);

    yPosition += 35;

    // ===== DATA E LOCAL =====
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).toUpperCase();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`ARAGUARI, ${dataAtual}`, pageWidth - margin - 60, yPosition);

    yPosition += 15;

    // ===== DESTINATÁRIO =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Ao', margin, yPosition);
    doc.text(obraSelecionada.cliente_nome, margin, yPosition + 5);
    doc.text(obraSelecionada.localizacao, margin, yPosition + 10);

    yPosition += 20;

    // ===== TÍTULO =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PROPOSTA DE ORÇAMENTO', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 12;

    // ===== INTRODUÇÃO =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const introText = `Conforme solicitado, a RM Fundações situada à Rua Atenas, 330, Araguari, apresenta a proposta de orçamento para ${obraSelecionada.nome}.`;
    const splitIntro = doc.splitTextToSize(introText, pageWidth - 2 * margin);
    doc.text(splitIntro, margin, yPosition);
    yPosition += splitIntro.length * 5 + 5;

    // ===== SEÇÃO 1: DESCRIÇÃO E PREÇOS =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('1 – DESCRIÇÃO E PREÇOS DOS SERVIÇOS:', margin, yPosition);
    yPosition += 8;

    // ===== TABELA DE SERVIÇOS =====
    const colWidths = {
      item: 15,
      descricao: 70,
      unid: 20,
      quant: 20,
      punit: 25,
      ptotal: 25,
    };

    // Cabeçalho da tabela
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setFillColor(200, 200, 200);

    let colX = margin;
    doc.rect(colX, yPosition, colWidths.item, 7, 'F');
    doc.text('ITEM', colX + 1, yPosition + 5);

    colX += colWidths.item;
    doc.rect(colX, yPosition, colWidths.descricao, 7, 'F');
    doc.text('DESCRIÇÃO', colX + 1, yPosition + 5);

    colX += colWidths.descricao;
    doc.rect(colX, yPosition, colWidths.unid, 7, 'F');
    doc.text('UNID.', colX + 1, yPosition + 5);

    colX += colWidths.unid;
    doc.rect(colX, yPosition, colWidths.quant, 7, 'F');
    doc.text('QUANT.', colX + 1, yPosition + 5);

    colX += colWidths.quant;
    doc.rect(colX, yPosition, colWidths.punit, 7, 'F');
    doc.text('P. UNIT', colX + 1, yPosition + 5);

    colX += colWidths.punit;
    doc.rect(colX, yPosition, colWidths.ptotal, 7, 'F');
    doc.text('P. TOTAL', colX + 1, yPosition + 5);

    yPosition += 7;

    // Linhas da tabela
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    let totalGeral = 0;
    servicosSelecionados.forEach((servico, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      const itemNum = index + 1;
      const total = servico.valor_realizado || servico.valor_previsto || 0;
      totalGeral += total;

      colX = margin;

      // ITEM
      doc.rect(colX, yPosition, colWidths.item, 6);
      doc.text(itemNum.toString(), colX + 1, yPosition + 4);

      // DESCRIÇÃO
      colX += colWidths.item;
      doc.rect(colX, yPosition, colWidths.descricao, 6);
      const descTexto = doc.splitTextToSize(servico.descricao, colWidths.descricao - 2);
      doc.text(descTexto, colX + 1, yPosition + 4);

      // UNID
      colX += colWidths.descricao;
      doc.rect(colX, yPosition, colWidths.unid, 6);
      doc.text('MTS', colX + 1, yPosition + 4);

      // QUANT
      colX += colWidths.unid;
      doc.rect(colX, yPosition, colWidths.quant, 6);
      doc.text('1', colX + 1, yPosition + 4);

      // P. UNIT
      colX += colWidths.quant;
      doc.rect(colX, yPosition, colWidths.punit, 6);
      doc.text(`R$ ${servico.valor_previsto?.toFixed(2) || '0.00'}`, colX + 1, yPosition + 4);

      // P. TOTAL
      colX += colWidths.punit;
      doc.rect(colX, yPosition, colWidths.ptotal, 6);
      doc.text(`R$ ${total.toFixed(2)}`, colX + 1, yPosition + 4);

      yPosition += 6;
    });

    // Total geral
    doc.setFont('helvetica', 'bold');
    colX = margin + colWidths.item + colWidths.descricao + colWidths.unid + colWidths.quant + colWidths.punit;
    doc.rect(colX, yPosition, colWidths.ptotal, 6, 'F');
    doc.text(`R$ ${totalGeral.toFixed(2)}`, colX + 1, yPosition + 4);

    yPosition += 10;

    // ===== OBSERVAÇÕES =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DISPONIBILIDADE PARA A OBRA: IMEDIATAMENTE APÓS A ACEITAÇÃO.', margin, yPosition);

    yPosition += 10;

    // ===== OBSERVAÇÕES GERAIS =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('OBSERVAÇÕES', margin, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const obs1 = '1) Os serviços serão cobrados com base nos preços unitários acima e nos quantitativos executados, conforme medição elaborada em conjunto com o cliente;';
    const splitObs1 = doc.splitTextToSize(obs1, pageWidth - 2 * margin - 5);
    doc.text(splitObs1, margin + 5, yPosition);
    yPosition += splitObs1.length * 4 + 3;

    const obs2 = '2) Caso o equipamento fique parado por responsabilidade do contratante, serão cobradas as horas improdutivas.';
    const splitObs2 = doc.splitTextToSize(obs2, pageWidth - 2 * margin - 5);
    doc.text(splitObs2, margin + 5, yPosition);

    // ===== PÁGINA 2 =====
    doc.addPage();
    yPosition = margin;

    // Cabeçalho página 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('2 – DO PREÇO DOS SERVIÇOS:', margin, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const precoText = 'O preço total dos serviços será a somatória de quilômetros rodados referente ao deslocamento do equipamento e das metragens escavadas medidas em conjunto com o contratante.';
    const splitPreco = doc.splitTextToSize(precoText, pageWidth - 2 * margin);
    doc.text(splitPreco, margin, yPosition);
    yPosition += splitPreco.length * 5 + 8;

    // Seção 3
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('3 - DOS PRAZOS:', margin, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('3.1 – As obras terão início após a emissão da ordem de serviço.', margin + 5, yPosition);
    yPosition += 6;

    doc.text('3.2 - O pagamento será da seguinte forma:', margin + 5, yPosition);
    yPosition += 6;

    doc.text('Medições após os serviços realizados de cada mês trabalhado ou de cada etapa concluída.', margin + 10, yPosition);
    yPosition += 6;

    doc.text('3.3 – Forma de pagamento do serviço: À vista.', margin + 5, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('3.4 – Mobilização, pagamento imediato;', margin + 5, yPosition);

    yPosition += 10;

    // Seção 4
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('4 - DA VALIDADE DA PROPOSTA:', margin, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Esta proposta tem validade de 30 (trinta) dias.', margin + 5, yPosition);

    yPosition += 10;

    // Seção 5
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('5 – DESCRIÇÕES GERAIS:', margin, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('5.1 - Responsabilidades RM Fundações:', margin + 5, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Executar os serviços com a melhor qualidade e profissionalismo.', margin + 10, yPosition);
    yPosition += 6;

    const obraText = `Obra a ser executada à empresa ${obraSelecionada.cliente_nome} em ${obraSelecionada.localizacao} com toda a documentação necessária.`;
    const splitObra = doc.splitTextToSize(obraText, pageWidth - 2 * margin - 10);
    doc.text(splitObra, margin + 10, yPosition);
    yPosition += splitObra.length * 5 + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('5.2 - Responsabilidades do contratante:', margin + 5, yPosition);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('O fornecimento de funcionários para a retirada de terra.', margin + 10, yPosition);

    yPosition = pageHeight - 40;

    // Assinatura
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('No aguardo do pronunciamento de V. Sa., desde já estamos ao seu dispor para quaisquer esclarecimentos que se fizerem necessários.', margin, yPosition);

    yPosition += 10;

    doc.text('Atenciosamente,', margin, yPosition);

    yPosition += 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('RM Fundações.', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Romulo Roberto Paulino de Melo', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    doc.setFont('helvetica', 'italic');
    doc.text('Sócio Administrador', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 255);
    doc.textWithLink('www.rmperfuracoes.com.br', pageWidth / 2, yPosition, { pageNumber: 1 });
    doc.setTextColor(0, 0, 0);
    yPosition += 5;

    doc.text('(34) 9 9113 - 6766', pageWidth / 2, yPosition, { align: 'center' });

    // Salvar PDF
    doc.save(`Orcamento_${obraSelecionada.nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    setShowModal(false);
  };

  const obrasFiltradasFiltradas = obras.filter(obra => {
    if (filtroStatus && obra.status !== filtroStatus) return false;
    return true;
  });

  return (
    <div className="gerador-contratos">
      <div className="page-header">
        <h1>
          <FileText size={32} /> Gerador de Contratos
        </h1>
        <p>Selecione uma obra para gerar o contrato em PDF</p>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtro-item">
          <label>Filtrar por Status:</label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos os Status</option>
            <option value="planejamento">Planejamento</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
      </div>

      {/* Lista de Obras */}
      <div className="obras-grid">
        {loading ? (
          <div className="loading">Carregando obras...</div>
        ) : obrasFiltradasFiltradas.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>Nenhuma obra encontrada</p>
          </div>
        ) : (
          obrasFiltradasFiltradas.map((obra) => (
            <div key={obra.id} className="obra-card">
              <div className="obra-card-header">
                <h3>{obra.nome}</h3>
                <span className={`status-badge status-${obra.status}`}>{obra.status}</span>
              </div>

              <div className="obra-card-content">
                <p>
                  <strong>Cliente:</strong> {obra.cliente_nome}
                </p>
                <p>
                  <strong>Localização:</strong> {obra.localizacao}
                </p>
                <p>
                  <strong>Período:</strong> {new Date(obra.data_inicio).toLocaleDateString('pt-BR')} a{' '}
                  {new Date(obra.data_fim).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <button className="btn-gerar-contrato" onClick={() => handleSelecionarObra(obra)}>
                <Download size={18} /> Gerar Contrato
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal de Confirmação */}
      {showModal && obraSelecionada && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gerar Contrato</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <h3>{obraSelecionada.nome}</h3>
              <p>
                <strong>Cliente:</strong> {obraSelecionada.cliente_nome}
              </p>
              <p>
                <strong>Localização:</strong> {obraSelecionada.localizacao}
              </p>

              <h4>Serviços Inclusos:</h4>
              <div className="servicos-list">
                {servicosSelecionados.map((servico) => (
                  <div key={servico.id} className="servico-item">
                    <p>
                      <strong>{servico.tipo}</strong> - {servico.descricao}
                    </p>
                    <p className="valor">R$ {servico.valor_previsto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>

              <div className="total-servicos">
                <strong>Total:</strong>
                <span>R$ {servicosSelecionados.reduce((sum, s) => sum + s.valor_previsto, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn-gerar" onClick={gerarContratoPDF}>
                <Download size={18} /> Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeradorContratos;
