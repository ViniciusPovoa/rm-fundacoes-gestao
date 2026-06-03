import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, X } from 'lucide-react';
import jsPDF from 'jspdf';
import api from '../config/api';
import { formatBRL, formatDecimal, toNumber } from '../lib/input-formatters';
import logoRm from '../assets/logo-rm.png';
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
  unidade: string;
  quantidade: number;
  preco_unitario: number;
  valor_previsto: number;
  valor_realizado: number;
}

interface ContractTextConfig {
  headerTitle: string;
  headerSubtitle: string;
  documentTitle: string;
  customerSectionTitle: string;
  projectSectionTitle: string;
  presentationSectionTitle: string;
  presentationText: string;
  servicesSectionTitle: string;
  commercialConditionsTitle: string;
  commercialConditionsText: string;
  closingSectionTitle: string;
  closingText: string;
  signatureCompany: string;
  signatureResponsible: string;
  signatureClientName: string;
}

const normalizeServico = (servico: Servico): Servico => ({
  ...servico,
  quantidade: toNumber(servico.quantidade),
  preco_unitario: toNumber(servico.preco_unitario),
  valor_previsto: toNumber(servico.valor_previsto),
  valor_realizado: toNumber(servico.valor_realizado),
});

const getTotalServico = (servico: Servico) => {
  const quantidade = toNumber(servico.quantidade);
  const precoUnitario = toNumber(servico.preco_unitario);

  if (quantidade > 0 && precoUnitario > 0) {
    return quantidade * precoUnitario;
  }

  return toNumber(servico.valor_realizado) || toNumber(servico.valor_previsto) || 0;
};

const getServicosTotal = (servicos: Servico[]) =>
  servicos.reduce((sum, servico) => sum + getTotalServico(normalizeServico(servico)), 0);

const createDefaultContractText = (obra: Obra, totalObra: number): ContractTextConfig => ({
  headerTitle: 'PROPOSTA COMERCIAL',
  headerSubtitle: 'RM Fundações | Perfuração, escavação e fundações especiais',
  documentTitle: 'Orçamento de Serviços',
  customerSectionTitle: 'CLIENTE',
  projectSectionTitle: 'DADOS DA OBRA',
  presentationSectionTitle: 'Obs:',
  presentationText:
    'Nossa Proposta baseia-se nos dados fornecidos pelo cliente, ficando a seu encargo ou de consultoria o dimensionamento da fundação.',
  servicesSectionTitle: 'Composição dos Serviços',
  commercialConditionsTitle: 'Condições Contratuais',
  commercialConditionsText: [
    '1. Encargos da contratada:',
    '1.1. Fornecimento de EPI´S para que todos os serviços sejam executados com segurança;',
    '1.2. Fornecimento do diário de obra (o mesmo deverá ser assinado por um responsável da obra).',
    '1.3. Executar os serviços segundo as normas técnicas.',
    '',
    '2. Encargos do contratante:',
    '2.1. Locação de estacas, as mesmas devem ser locadas 15cm abaixo do nível do terreno para movimentação do equipamento;',
    '2.2. Fornecimento de aço e concreto;',
    '2.3. Fornecer mão de obra para limpeza dos trados, no mínimo 2 ajudantes.',
    '2.4. É de responsabilidade da contratante fornecer dispositivos para cobrir as estacas.',
    '',
    '3. Condições Gerais:',
    '3.1. Todos os projetos deverão ser plotados e entregues a contratada. Caso haja alguma alteração no projeto é de responsabilidade da contratante comunicar;',
    '3.2. O terreno deve estar devidamente regularizado e compactado;',
    '3.3. A contratada fica desde já autorizada a utilizar o nome e logomarca da contratante em seus materiais de divulgação, sejam eles físicos ou virtuais;',
    '3.4. A contratada não se responsabiliza por eventuais danos que ocorrerem em edificações vizinhas assim como danos em redes subterrâneas não informadas no ato da execução dos serviços propostos.',
    '3.5. Será cobrado o valor de R$ 3.000,00 reais, referente ao faturamento mínimo diário por equipamento, caso o equipamento fique parado por falta de liberação de frente de serviços pela contratante;',
    `3.6. Faturamento Mínimo da Obra: ${formatBRL(totalObra)}.`,
    '3.7. Prazo de início a combinar.',
    '3.8. Caso haja incidência de ISS pela prefeitura, será acrescido na nota fiscal.',
    '3.9. Para fechamento do contrato é necessário pagamento da mobilização antecipado.',
    '3.10. Valor final desta proposta pode ser alterado conforme medição final.',
    '3.11. Caso nossos serviços sejam executados em etapas, será cobrada a taxa de mobilização a cada etapa.',
    '3.12. Caso seja necessário fazer integração dos colaboradores será acrescentado o valor de R$3.000,00 por dia de integração.',
    '3.13. Caso seja necessário documento específico para obra, os valores descritos poderão sofrer alterações.',
    '3.14. Necessário equipamento de apoio (Retroescavadeira), para limpeza e remoção do material escavado, em toda execução da obra.',
    '',
    '4 - DOS PRAZOS:',
    '4.1 – As obras terão início após a emissão da ordem de serviço.',
    '4.2 – Forma de pagamento do serviço: 50% de entrada antecipada, restante pagamento à vista após finalização do serviço.',
    '4.3 – Prazo de 02 dias para análise do fechamento, após esse prazo, será enviado boleto e nota com valor total.',
    '',
    '5 - DA VALIDADE DA PROPOSTA:',
    '5.1. Esta proposta tem validade de 10 (dez) dias.',
  ].join('\n'),
  closingSectionTitle: 'Aceite',
  closingText:
    'Caso ambas as partes estejam de ACORDO com os itens e descrições citadas acima, deve ser assinada a proposta para prosseguirmos com os trâmites necessários.',
  signatureCompany: 'RM Fundações',
  signatureResponsible: 'Rômulo Roberto Paulino de Melo | Sócio-Administrador',
  signatureClientName: obra.cliente_nome || '',
});

const BRAND_PRIMARY: [number, number, number] = [123, 12, 39];
const BRAND_DARK: [number, number, number] = [39, 39, 42];
const BRAND_MUTED: [number, number, number] = [110, 110, 118];
const BRAND_LIGHT: [number, number, number] = [245, 241, 242];
const BORDER_LIGHT: [number, number, number] = [224, 224, 228];

const formatDateLong = (date: Date) =>
  date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

type LoadedImageAsset = {
  dataUrl: string;
  width: number;
  height: number;
};

type ImageAssetOptions = {
  trimWhitespace?: boolean;
  cropBottomRatio?: number;
};

const loadImageAsset = (src: string, options: ImageAssetOptions = {}) =>
  new Promise<LoadedImageAsset>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = image.naturalWidth;
      sourceCanvas.height = image.naturalHeight;

      const context = sourceCanvas.getContext('2d');
      if (!context) {
        reject(new Error('Não foi possível preparar a logo para o PDF.'));
        return;
      }

      context.drawImage(image, 0, 0);

      let cropX = 0;
      let cropY = 0;
      let cropWidth = image.naturalWidth;
      let cropHeight = image.naturalHeight;

      if (options.trimWhitespace) {
        const imageData = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
        const { data, width, height } = imageData;
        let minX = width;
        let minY = height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            const alpha = data[index + 3];
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            const isVisible = alpha > 16 && (red < 245 || green < 245 || blue < 245);

            if (isVisible) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (maxX >= minX && maxY >= minY) {
          const padding = 6;
          cropX = Math.max(0, minX - padding);
          cropY = Math.max(0, minY - padding);
          cropWidth = Math.min(width - cropX, maxX - minX + 1 + padding * 2);
          cropHeight = Math.min(height - cropY, maxY - minY + 1 + padding * 2);
        }
      }

      if (options.cropBottomRatio && options.cropBottomRatio > 0 && options.cropBottomRatio < 1) {
        cropHeight = Math.max(1, Math.round(cropHeight * (1 - options.cropBottomRatio)));
      }

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = cropWidth;
      outputCanvas.height = cropHeight;
      const outputContext = outputCanvas.getContext('2d');

      if (!outputContext) {
        reject(new Error('Não foi possível finalizar a composição da logo para o PDF.'));
        return;
      }

      outputContext.drawImage(
        sourceCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      resolve({
        dataUrl: outputCanvas.toDataURL('image/png'),
        width: cropWidth,
        height: cropHeight,
      });
    };
    image.onerror = () => reject(new Error('Não foi possível carregar a logo da empresa.'));
    image.src = src;
  });

const GeradorContratos: React.FC = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null);
  const [contractText, setContractText] = useState<ContractTextConfig | null>(null);
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
      const servicos = (response.data || []).map(normalizeServico);
      setServicosSelecionados(servicos);
      return servicos;
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      return [];
    }
  };

  const handleSelecionarObra = async (obra: Obra) => {
    setObraSelecionada(obra);
    const servicos = await carregarServicos(obra.id);
    setContractText(createDefaultContractText(obra, getServicosTotal(servicos)));
    setShowModal(true);
  };

  const resetContractText = () => {
    if (!obraSelecionada) return;
    setContractText(createDefaultContractText(obraSelecionada, getServicosTotal(servicosSelecionados)));
  };

  const updateContractText = (field: keyof ContractTextConfig, value: string) => {
    setContractText((current) => {
      if (!current) return current;
      return { ...current, [field]: value };
    });
  };

  const gerarContratoPDF = async () => {
    if (!obraSelecionada || !contractText) return;

    const servicosNormalizados = servicosSelecionados.map(normalizeServico);
    const totalServicos = servicosNormalizados.reduce((sum, servico) => {
      return sum + getTotalServico(servico);
    }, 0);
    try {
      const logoAsset = await loadImageAsset(logoRm);
      const headerLogoAsset = await loadImageAsset(logoRm, {
        trimWhitespace: true,
        cropBottomRatio: 0.18,
      });
      const logoDataUrl = logoAsset.dataUrl;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdf = doc as jsPDF & {
        GState?: new (options: { opacity: number }) => unknown;
        setGState?: (state: unknown) => void;
        saveGraphicsState?: () => void;
        restoreGraphicsState?: () => void;
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const footerY = pageHeight - 10;
      let yPosition = 18;

      const drawWatermark = () => {
        const watermarkWidth = 128;
        const watermarkHeight = 88;
        const watermarkX = (pageWidth - watermarkWidth) / 2;
        const watermarkY = (pageHeight - watermarkHeight) / 2 - 12;

        try {
          if (pdf.GState && pdf.setGState) {
            pdf.saveGraphicsState?.();
            pdf.setGState(new pdf.GState({ opacity: 0.08 }));
            doc.addImage(logoDataUrl, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
            pdf.restoreGraphicsState?.();
            return;
          }
        } catch (error) {
          console.warn('Não foi possível aplicar transparência na marca-d’água.', error);
        }

        doc.addImage(logoDataUrl, 'PNG', watermarkX, watermarkY, 72, 49);
      };

      const drawHeader = () => {
        drawWatermark();

        const headerHeight = 18;
        const logoPanelWidth = 52;
        const diagonalWidth = 9;
        const logoSafeWidth = 82;
        const logoSafeHeight = 15.8;
        const logoAspectRatio = headerLogoAsset.width / headerLogoAsset.height;
        let logoWidth = logoSafeWidth;
        let logoHeight = logoWidth / logoAspectRatio;

        if (logoHeight > logoSafeHeight) {
          logoHeight = logoSafeHeight;
          logoWidth = logoHeight * logoAspectRatio;
        }

        doc.setFillColor(...BRAND_PRIMARY);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, logoPanelWidth, headerHeight, 'F');
        doc.triangle(
          logoPanelWidth,
          0,
          logoPanelWidth + diagonalWidth,
          0,
          logoPanelWidth,
          headerHeight,
          'F'
        );

        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.6);
        doc.line(logoPanelWidth + diagonalWidth, 0, logoPanelWidth, headerHeight);

        const logoX = margin;
        const logoY = (headerHeight - logoHeight) / 2;
        doc.addImage(headerLogoAsset.dataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text(contractText.headerTitle, pageWidth - margin, 11, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(contractText.headerSubtitle, pageWidth - margin, 15, { align: 'right' });
      };

      const drawFooter = (pageNumber: number) => {
        doc.setDrawColor(...BORDER_LIGHT);
        doc.setLineWidth(0.3);
        doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...BRAND_MUTED);
        doc.text('R. Atenas, 330 | Araguari - MG | (34) 9 9113-6766 | empresarmfundacoes@gmail.com', margin, footerY);
        doc.text(`Página ${pageNumber}`, pageWidth - margin, footerY, { align: 'right' });
      };

      const startPage = (pageNumber: number) => {
        if (pageNumber > 1) {
          doc.addPage();
        }

        drawHeader();
        drawFooter(pageNumber);
        yPosition = 26;
      };

      const ensureSpace = (neededHeight: number, pageNumberRef: { current: number }) => {
        if (yPosition + neededHeight <= footerY - 8) {
          return;
        }

        pageNumberRef.current += 1;
        startPage(pageNumberRef.current);
      };

      const drawSectionTitle = (title: string) => {
        doc.setFillColor(...BRAND_LIGHT);
        doc.roundedRect(margin, yPosition, contentWidth, 8, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...BRAND_PRIMARY);
        doc.text(title.toUpperCase(), margin + 3, yPosition + 5.3);
        yPosition += 12;
      };

      const drawParagraph = (text: string, indent = 0) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...BRAND_DARK);
        const paragraphBlocks = text.split('\n');

        paragraphBlocks.forEach((block, index) => {
          if (!block.trim()) {
            yPosition += 4;
            return;
          }

          const lines = doc.splitTextToSize(block, contentWidth - indent);
          const paragraphHeight = lines.length * 4.8 + 1.5;
          ensureSpace(paragraphHeight + 2, pageRef);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...BRAND_DARK);
          doc.text(lines, margin + indent, yPosition);
          yPosition += paragraphHeight;

          if (index < paragraphBlocks.length - 1) {
            yPosition += 0.5;
          }
        });
      };

      const isClauseSectionTitle = (line: string) => {
        const trimmedLine = line.trim();
        return /^(\d+(\.\d+)?)\.\s.+:$/.test(trimmedLine) || /^\d+\s-\s.+:?$/.test(trimmedLine);
      };

      const isReferenceStyleBoldClause = (line: string) => {
        const trimmedLine = line.trim();
        return [
          /^3\.5\./,
          /^3\.6\./,
          /^3\.8\./,
          /^3\.9\./,
          /^3\.10\./,
          /^3\.11\./,
          /^3\.12\./,
          /^4\.2\b/,
          /^4\.3\b/,
          /^5\.1\./,
        ].some((pattern) => pattern.test(trimmedLine));
      };

      const drawClauseParagraph = (text: string, indent = 0) => {
        const clauseBlocks = text.split('\n');

        clauseBlocks.forEach((block, index) => {
          const trimmedBlock = block.trim();
          if (!trimmedBlock) {
            yPosition += 4;
            return;
          }

          const isSectionTitle = isClauseSectionTitle(trimmedBlock);
          const isReferenceBold = isReferenceStyleBoldClause(trimmedBlock);
          const lines = doc.splitTextToSize(trimmedBlock, contentWidth - indent);
          const paragraphHeight = lines.length * 4.8 + 1.5;
          ensureSpace(paragraphHeight + 2, pageRef);
          doc.setFont('helvetica', isSectionTitle || isReferenceBold ? 'bold' : 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(...BRAND_DARK);
          doc.text(lines, margin + indent, yPosition);
          yPosition += paragraphHeight;

          if (index < clauseBlocks.length - 1) {
            yPosition += 0.5;
          }
        });
      };

      const pageRef = { current: 1 };
      startPage(pageRef.current);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...BRAND_DARK);
      doc.text(contractText.documentTitle, margin, yPosition);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...BRAND_MUTED);
      doc.text(`Ref. ${obraSelecionada.id}/${new Date().getFullYear()} | Araguari, ${formatDateLong(new Date())}`, margin, yPosition + 6);

      yPosition += 12;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...BORDER_LIGHT);
      doc.roundedRect(margin, yPosition, contentWidth * 0.58, 27, 2.5, 2.5, 'FD');
      doc.roundedRect(margin + contentWidth * 0.61, yPosition, contentWidth * 0.39, 27, 2.5, 2.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...BRAND_PRIMARY);
      doc.text(contractText.customerSectionTitle, margin + 3, yPosition + 5);
      doc.text(contractText.projectSectionTitle, margin + contentWidth * 0.61 + 3, yPosition + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...BRAND_DARK);
      doc.text(obraSelecionada.cliente_nome || 'Não informado', margin + 3, yPosition + 11);
      doc.text(`Documento: ${obraSelecionada.cliente_documento || 'Não informado'}`, margin + 3, yPosition + 16);
      doc.text(`Contato: ${obraSelecionada.cliente_telefone || obraSelecionada.cliente_email || 'Não informado'}`, margin + 3, yPosition + 21);

      doc.text(obraSelecionada.nome || 'Obra sem nome', margin + contentWidth * 0.61 + 3, yPosition + 11);
      doc.text(`Local: ${obraSelecionada.localizacao || 'Não informado'}`, margin + contentWidth * 0.61 + 3, yPosition + 16);
      doc.text(
        `Período: ${new Date(obraSelecionada.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(obraSelecionada.data_fim).toLocaleDateString('pt-BR')}`,
        margin + contentWidth * 0.61 + 3,
        yPosition + 21
      );

      yPosition += 34;

      drawSectionTitle(contractText.presentationSectionTitle);
      drawParagraph(contractText.presentationText);

      ensureSpace(18, pageRef);
      drawSectionTitle(contractText.servicesSectionTitle);

      const columns = {
        item: 12,
        descricao: 76,
        unidade: 18,
        quantidade: 20,
        unitario: 27,
        total: 29,
      };

      const drawTableHeader = () => {
        doc.setFillColor(...BRAND_PRIMARY);
        doc.roundedRect(margin, yPosition, contentWidth, 8, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(255, 255, 255);

        let colX = margin + 2;
        doc.text('ITEM', colX, yPosition + 5.2);
        colX += columns.item;
        doc.text('DESCRIÇÃO', colX, yPosition + 5.2);
        colX += columns.descricao;
        doc.text('UN.', colX, yPosition + 5.2);
        colX += columns.unidade;
        doc.text('QTD.', colX, yPosition + 5.2);
        colX += columns.quantidade;
        doc.text('V. UNIT.', colX, yPosition + 5.2);
        colX += columns.unitario;
        doc.text('TOTAL', colX, yPosition + 5.2);

        yPosition += 10;
      };

      drawTableHeader();

      servicosNormalizados.forEach((servico, index) => {
        const descricao = `${servico.tipo || 'Serviço'} - ${servico.descricao || ''}`.trim();
        const descricaoLinhas = doc.splitTextToSize(descricao, columns.descricao - 4);
        const rowHeight = Math.max(9, descricaoLinhas.length * 4.2 + 3);
        ensureSpace(rowHeight + 4, pageRef);

        if (yPosition < 38) {
          drawTableHeader();
        }

        doc.setFillColor(index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 249);
        doc.setDrawColor(...BORDER_LIGHT);
        doc.roundedRect(margin, yPosition, contentWidth, rowHeight, 1.2, 1.2, 'FD');

        const baseY = yPosition + 5;
        let colX = margin + 2;
        const totalLinha = getTotalServico(servico);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.6);
        doc.setTextColor(...BRAND_DARK);
        doc.text(String(index + 1), colX, baseY);
        colX += columns.item;
        doc.text(descricaoLinhas, colX, baseY);
        colX += columns.descricao;
        doc.text(servico.unidade || 'UN', colX, baseY);
        colX += columns.unidade;
        doc.text(formatDecimal(servico.quantidade || 0), colX, baseY);
        colX += columns.quantidade;
        doc.text(formatBRL(servico.preco_unitario || 0), colX, baseY);
        colX += columns.unitario;
        doc.setFont('helvetica', 'bold');
        doc.text(formatBRL(totalLinha), colX, baseY);

        yPosition += rowHeight + 2;
      });

      ensureSpace(24, pageRef);
      doc.setFillColor(...BRAND_PRIMARY);
      doc.roundedRect(pageWidth - margin - 60, yPosition, 60, 16, 2.5, 2.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('VALOR GLOBAL ESTIMADO', pageWidth - margin - 30, yPosition + 5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(formatBRL(totalServicos), pageWidth - margin - 30, yPosition + 11.5, { align: 'center' });
      yPosition += 22;

      ensureSpace(68, pageRef);
      drawSectionTitle(contractText.commercialConditionsTitle);
      drawClauseParagraph(contractText.commercialConditionsText, 2);

      ensureSpace(44, pageRef);
      drawSectionTitle(contractText.closingSectionTitle);
      drawParagraph(contractText.closingText);

      ensureSpace(32, pageRef);
      yPosition += 8;
      const signatureLineWidth = 68;
      const signatureGap = contentWidth - signatureLineWidth * 2;
      const leftSignatureX = margin;
      const rightSignatureX = margin + signatureLineWidth + signatureGap;

      doc.setDrawColor(...BRAND_MUTED);
      doc.line(leftSignatureX, yPosition, leftSignatureX + signatureLineWidth, yPosition);
      doc.line(rightSignatureX, yPosition, rightSignatureX + signatureLineWidth, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(...BRAND_DARK);
      doc.text(contractText.signatureCompany, leftSignatureX, yPosition + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(contractText.signatureResponsible, leftSignatureX, yPosition + 11);
      doc.setFont('helvetica', 'bold');
      doc.text(contractText.signatureClientName || 'Contratante', rightSignatureX, yPosition + 6);
      doc.setFont('helvetica', 'normal');
      doc.text('Contratante', rightSignatureX, yPosition + 11);

      doc.save(`Orcamento_${obraSelecionada.nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao gerar contrato PDF:', error);
    }
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
      {showModal && obraSelecionada && contractText && (
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
                    <p>
                      {servico.unidade || 'UN'} | {formatDecimal(servico.quantidade || 0)} x {formatBRL(servico.preco_unitario || 0)}
                    </p>
                    <p className="valor">{formatBRL(getTotalServico(normalizeServico(servico)))}</p>
                  </div>
                ))}
              </div>

              <div className="total-servicos">
                <strong>Total:</strong>
                <span>{formatBRL(servicosSelecionados.reduce((sum, s) => sum + getTotalServico(normalizeServico(s)), 0))}</span>
              </div>

              <div className="contract-editor">
                <div className="contract-editor-header">
                  <h4>Textos do Contrato</h4>
                  <button type="button" className="btn-restaurar-texto" onClick={resetContractText}>
                    Restaurar padrão
                  </button>
                </div>

                <div className="contract-editor-grid">
                  <label className="contract-field">
                    <span>Título do cabeçalho</span>
                    <input
                      type="text"
                      value={contractText.headerTitle}
                      onChange={(e) => updateContractText('headerTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Subtítulo do cabeçalho</span>
                    <input
                      type="text"
                      value={contractText.headerSubtitle}
                      onChange={(e) => updateContractText('headerSubtitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Título principal</span>
                    <input
                      type="text"
                      value={contractText.documentTitle}
                      onChange={(e) => updateContractText('documentTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Título da seção cliente</span>
                    <input
                      type="text"
                      value={contractText.customerSectionTitle}
                      onChange={(e) => updateContractText('customerSectionTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Título da seção da obra</span>
                    <input
                      type="text"
                      value={contractText.projectSectionTitle}
                      onChange={(e) => updateContractText('projectSectionTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Título da apresentação</span>
                    <input
                      type="text"
                      value={contractText.presentationSectionTitle}
                      onChange={(e) => updateContractText('presentationSectionTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field contract-field-full">
                    <span>Texto de apresentação</span>
                    <textarea
                      rows={4}
                      value={contractText.presentationText}
                      onChange={(e) => updateContractText('presentationText', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Título da composição dos serviços</span>
                    <input
                      type="text"
                      value={contractText.servicesSectionTitle}
                      onChange={(e) => updateContractText('servicesSectionTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Título das condições comerciais</span>
                    <input
                      type="text"
                      value={contractText.commercialConditionsTitle}
                      onChange={(e) => updateContractText('commercialConditionsTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field contract-field-full">
                    <span>Cláusulas comerciais</span>
                    <textarea
                      rows={6}
                      value={contractText.commercialConditionsText}
                      onChange={(e) => updateContractText('commercialConditionsText', e.target.value)}
                    />
                    <small>Use uma linha para cada cláusula.</small>
                  </label>

                  <label className="contract-field">
                    <span>Título do encerramento</span>
                    <input
                      type="text"
                      value={contractText.closingSectionTitle}
                      onChange={(e) => updateContractText('closingSectionTitle', e.target.value)}
                    />
                  </label>

                  <label className="contract-field contract-field-full">
                    <span>Texto de encerramento</span>
                    <textarea
                      rows={3}
                      value={contractText.closingText}
                      onChange={(e) => updateContractText('closingText', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Assinatura da empresa</span>
                    <input
                      type="text"
                      value={contractText.signatureCompany}
                      onChange={(e) => updateContractText('signatureCompany', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Responsável pela assinatura</span>
                    <input
                      type="text"
                      value={contractText.signatureResponsible}
                      onChange={(e) => updateContractText('signatureResponsible', e.target.value)}
                    />
                  </label>

                  <label className="contract-field">
                    <span>Nome do contratante</span>
                    <input
                      type="text"
                      value={contractText.signatureClientName}
                      onChange={(e) => updateContractText('signatureClientName', e.target.value)}
                    />
                  </label>
                </div>
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
