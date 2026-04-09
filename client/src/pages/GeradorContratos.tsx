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

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(24);
    doc.setTextColor(30, 39, 55);
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });

    // Linha separadora
    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    // Seção 1: Partes Contratantes
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(30, 39, 55);
    doc.text('1. PARTES CONTRATANTES', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('CONTRATANTE (Cliente):', 20, yPosition);
    yPosition += 6;
    doc.text(`Nome: ${obraSelecionada.cliente_nome || 'N/A'}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Documento: ${obraSelecionada.cliente_documento || 'N/A'}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Email: ${obraSelecionada.cliente_email || 'N/A'}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Telefone: ${obraSelecionada.cliente_telefone || 'N/A'}`, 25, yPosition);

    yPosition += 12;
    doc.text('CONTRATADA (RM Fundações):', 20, yPosition);
    yPosition += 6;
    doc.text('Razão Social: RM Fundações LTDA', 25, yPosition);
    yPosition += 5;
    doc.text('CNPJ: XX.XXX.XXX/0001-XX', 25, yPosition);
    yPosition += 5;
    doc.text('Email: contato@rmfundacoes.com.br', 25, yPosition);

    // Seção 2: Objeto do Contrato
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(30, 39, 55);
    doc.text('2. OBJETO DO CONTRATO', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Obra: ${obraSelecionada.nome}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Localização: ${obraSelecionada.localizacao}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Data de Início: ${new Date(obraSelecionada.data_inicio).toLocaleDateString('pt-BR')}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Data de Término: ${new Date(obraSelecionada.data_fim).toLocaleDateString('pt-BR')}`, 25, yPosition);

    // Seção 3: Serviços
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(30, 39, 55);
    doc.text('3. SERVIÇOS A SEREM PRESTADOS', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(9);

    // Cabeçalho da tabela
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, yPosition, pageWidth - 40, 7, 'F');
    doc.text('Tipo de Serviço', 25, yPosition + 5);
    doc.text('Descrição', 80, yPosition + 5);
    doc.text('Valor Previsto', 150, yPosition + 5);

    yPosition += 8;
    doc.setTextColor(55, 65, 81);

    // Dados da tabela
    servicosSelecionados.forEach((servico) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(servico.tipo || 'N/A', 25, yPosition);
      const descricaoWrapped = doc.splitTextToSize(servico.descricao || 'N/A', 65);
      doc.text(descricaoWrapped, 80, yPosition);
      doc.text(`R$ ${servico.valor_previsto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 150, yPosition);

      yPosition += 8;
    });

    // Seção 4: Valores
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(30, 39, 55);
    doc.text('4. VALORES', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    const totalServicos = servicosSelecionados.reduce((sum, s) => sum + s.valor_previsto, 0);

    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPosition - 2, pageWidth - 40, 25, 'F');

    doc.text('Valor Total dos Serviços:', 25, yPosition);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 40, yPosition, { align: 'right' });

    // Seção 5: Condições Gerais
    yPosition += 35;
    doc.setTextColor(30, 39, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('5. CONDIÇÕES GERAIS', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);

    const condicoes = [
      '• O presente contrato rege-se pelas leis brasileiras, em especial pelo Código Civil Brasileiro.',
      '• A CONTRATADA se compromete a executar os serviços com qualidade e profissionalismo.',
      '• O pagamento será realizado conforme cronograma acordado entre as partes.',
      '• Qualquer alteração no escopo dos serviços deverá ser formalizada por aditivo contratual.',
      '• A CONTRATADA não se responsabiliza por atrasos causados por força maior.',
    ];

    condicoes.forEach((condicao) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      const wrapped = doc.splitTextToSize(condicao, pageWidth - 40);
      doc.text(wrapped, 25, yPosition);
      yPosition += wrapped.length * 4 + 2;
    });

    // Assinaturas
    yPosition += 20;
    doc.setFontSize(10);
    doc.setTextColor(30, 39, 55);

    doc.text('_____________________________', 30, yPosition);
    yPosition += 8;
    doc.text('Assinatura - CONTRATANTE', 30, yPosition);

    doc.text('_____________________________', 120, yPosition - 8);
    yPosition += 8;
    doc.text('Assinatura - CONTRATADA', 120, yPosition - 8);

    // Salvar PDF
    doc.save(`Contrato_${obraSelecionada.nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
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
