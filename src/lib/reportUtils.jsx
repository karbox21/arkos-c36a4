import React from 'react';

export const generateReportContent = (type, reportData) => {
  try {
    // Verificar se reportData e seus campos necessários existem
    if (!reportData) {
      console.error('Dados do relatório não fornecidos');
      return 'Erro: Dados do relatório não fornecidos';
    }

    // Extrair dados com validação
    const currentCollectionName = reportData.currentCollectionName || reportData.currentCollectionNameForTitle || 'Sem Nome';
    const collections = reportData.collections || {};
    const observations = reportData.observations || '';
    const operator = reportData.operator || 'Não Especificado';
    
    // Determinar pacotes escaneados e duplicados
    let scannedPackages = [];
    let duplicatePackages = [];
    
    // Se collections for fornecido (formato usado pelo Trello), extrair pacotes
    if (Object.keys(collections).length > 0) {
      // Processar coleções em lotes para melhorar o desempenho
      Object.values(collections).forEach(collection => {
        if (collection && collection.packages) {
          scannedPackages = scannedPackages.concat(collection.packages || []);
        }
        if (collection && collection.duplicates) {
          duplicatePackages = duplicatePackages.concat(collection.duplicates || []);
        }
      });
    } else {
      // Formato antigo (usado pela interface principal)
      scannedPackages = reportData.scannedPackages || [];
      duplicatePackages = reportData.duplicatePackages || [];
    }
    
    const totalValid = scannedPackages.length;
    const totalDuplicate = duplicatePackages.length;
    const reportDate = new Date().toLocaleString('pt-BR');

    let content = "";
    if (type === 'pdf') { 
      // Construir o conteúdo do PDF com logo e detalhes avançados
      const parts = [
        `╔══════════════════════════════════════════════════════════════╗`,
        `║                        ARKOS LOGÍSTICA                       ║`,
        `║                    Relatório de Romaneio                     ║`,
        `╚══════════════════════════════════════════════════════════════╝`,
        ``,
        `📋 INFORMAÇÕES GERAIS`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Coleta: ${currentCollectionName}`,
        `Operador: ${operator}`,
        `Data: ${reportDate}`,
        `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        ``,
        `📊 ESTATÍSTICAS`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `✅ Pacotes Válidos: ${totalValid}`,
        `⚠️  Pacotes Duplicados: ${totalDuplicate}`,
        `📦 Total Geral Lido: ${totalValid + totalDuplicate}`,
        `📈 Taxa de Sucesso: ${totalValid + totalDuplicate > 0 ? ((totalValid / (totalValid + totalDuplicate)) * 100).toFixed(1) : 0}%`,
        ``,
        `📋 DETALHAMENTO DOS PACOTES`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      ];
      
      // Adicionar pacotes válidos com horários
      if (totalValid > 0) {
        parts.push(`✅ PACOTES VÁLIDOS (${totalValid}):`);
        scannedPackages.forEach((pkg, index) => {
          const timestamp = pkg.timestamp || 'N/A';
          const code = typeof pkg === 'object' ? pkg.code : pkg;
          parts.push(`${index + 1}. ${code} - ${timestamp}`);
        });
      } else {
        parts.push(`✅ PACOTES VÁLIDOS: Nenhum`);
      }
      
      parts.push(``);
      
      // Adicionar pacotes duplicados destacados
      if (totalDuplicate > 0) {
        parts.push(`⚠️  PACOTES DUPLICADOS (${totalDuplicate}) - ATENÇÃO:`);
        duplicatePackages.forEach((pkg, index) => {
          const timestamp = pkg.timestamp || 'N/A';
          const code = typeof pkg === 'object' ? pkg.code : pkg;
          parts.push(`❌ ${index + 1}. ${code} - ${timestamp} - DUPLICADO`);
        });
      } else {
        parts.push(`⚠️  PACOTES DUPLICADOS: Nenhum`);
      }
      
      parts.push(``);
      
      // Adicionar observações se existirem
      if (observations && observations.trim()) {
        parts.push(`📝 OBSERVAÇÕES DO OPERADOR`);
        parts.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        parts.push(observations);
        parts.push(``);
      }
      
      // Adicionar rodapé
      parts.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      parts.push(`Relatório gerado pelo Sistema ARKOS`);
      parts.push(`© ${new Date().getFullYear()} ARKOS Logística - Todos os direitos reservados`);
      
      content = parts.join('\n');
    } else if (type === 'excel') { 
      // Para Excel, usar um array para construir as linhas e depois juntar
      const rows = [`Coleta,Status,Código`];
      
      // Processar pacotes em lotes para melhorar o desempenho
      if (scannedPackages.length > 0) {
        for (let i = 0; i < scannedPackages.length; i++) {
          rows.push(`${currentCollectionName},VALIDO,${scannedPackages[i]}`);
        }
      }
      
      if (duplicatePackages.length > 0) {
        for (let i = 0; i < duplicatePackages.length; i++) {
          rows.push(`${currentCollectionName},DUPLICADO,${duplicatePackages[i]}`);
        }
      }
      
      content = rows.join('\n');
    }
    
    return content;
  } catch (error) {
    console.error('Erro ao gerar conteúdo do relatório:', error);
    return `Erro ao gerar relatório: ${error.message}`;
  }
};

export const handleExportFile = (content, fileName, mimeType) => {
  try {
    // Validar parâmetros
    if (!content) {
      console.error('Conteúdo vazio para exportação');
      throw new Error('Conteúdo vazio para exportação');
    }
    
    if (!fileName) {
      fileName = `relatorio_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      console.warn('Nome de arquivo não fornecido, usando nome padrão:', fileName);
    }
    
    if (!mimeType) {
      // Determinar o tipo MIME com base na extensão do arquivo
      const extension = fileName.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'csv':
        case 'txt':
          mimeType = 'text/plain';
          break;
        case 'xlsx':
        case 'xls':
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          mimeType = 'text/plain';
      }
      console.warn('Tipo MIME não fornecido, usando tipo detectado:', mimeType);
    }
    
    // Criar o blob com o conteúdo
    const blob = new Blob([content], { type: mimeType });
    
    // Verificar se o navegador suporta download via link
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // Criar URL para o blob
      const url = URL.createObjectURL(blob);
      
      // Configurar o link
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      
      // Limpar após um pequeno delay para garantir que o download comece
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } else {
      // Fallback para navegadores que não suportam o atributo download
      console.warn('Navegador não suporta download via link, tentando abrir em nova janela');
      window.open(URL.createObjectURL(blob), '_blank');
      return true;
    }
  } catch (error) {
    console.error('Erro ao exportar arquivo:', error);
    throw error; // Propagar o erro para tratamento no componente chamador
  }
};

export const handlePrintReport = (reportData) => {
  try {
    // Validar dados do relatório
    if (!reportData) {
      console.error('Dados do relatório não fornecidos para impressão');
      throw new Error('Dados do relatório não fornecidos para impressão');
    }
    
    // Obter o nome da coleção com fallback
    const collectionName = reportData.currentCollectionName || 
                          reportData.currentCollectionNameForTitle || 
                          'Romaneio';
    
    // Gerar o conteúdo do relatório
    const reportContent = generateReportContent('pdf', reportData);
    
    // Verificar se o conteúdo foi gerado corretamente
    if (!reportContent || reportContent.startsWith('Erro:')) {
      console.error('Falha ao gerar conteúdo do relatório:', reportContent);
      throw new Error(reportContent || 'Falha ao gerar conteúdo do relatório');
    }
    
    // Abrir nova janela para impressão
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Preparar o HTML para impressão com estilos melhorados e logo
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Imprimir Romaneio - ${collectionName}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
              margin: 20px;
              line-height: 1.4;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .logo {
              width: 60px;
              height: 60px;
              margin: 0 auto 10px;
              display: block;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
              color: #1e40af;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 10px;
            }
            .duplicate {
              color: #dc2626;
              font-weight: bold;
            }
            .success {
              color: #059669;
              font-weight: bold;
            }
            .warning {
              color: #d97706;
              font-weight: bold;
            }
            .section {
              margin: 15px 0;
              border-left: 3px solid #1e40af;
              padding-left: 10px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            @media print {
              body {
                font-size: 11px;
                margin: 15px;
              }
              .title {
                font-size: 20px;
              }
              .subtitle {
                font-size: 14px;
              }
              @page {
                margin: 1.5cm;
                size: A4;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/images/arkos_logo.svg" alt="ARKOS Logo" class="logo">
            <div class="title">ARKOS LOGÍSTICA</div>
            <div class="subtitle">Relatório de Romaneio - ${collectionName}</div>
          </div>
          
          <div class="content">
            ${reportContent
              .replace(/\n/g, '<br/>')
              .replace(/✅/g, '<span class="success">✅</span>')
              .replace(/⚠️/g, '<span class="warning">⚠️</span>')
              .replace(/❌/g, '<span class="duplicate">❌</span>')
              .replace(/DUPLICADO/g, '<span class="duplicate">DUPLICADO</span>')
              .replace(/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━/g, '<hr style="border: 1px solid #ccc; margin: 10px 0;">')}
          </div>
          
          <div class="footer">
            <p>Relatório gerado pelo Sistema ARKOS</p>
            <p>© ${new Date().getFullYear()} ARKOS Logística - Todos os direitos reservados</p>
          </div>
        </body>
        </html>
      `;
      
      // Escrever o conteúdo na janela
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Focar na janela e imprimir após um pequeno delay para garantir que o conteúdo seja carregado
      printWindow.focus();
      
      // Usar setTimeout para dar tempo ao navegador para renderizar o conteúdo
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (printError) {
          console.error('Erro ao imprimir:', printError);
          alert(`Erro ao imprimir: ${printError.message}`);
        }
      }, 300);
      
      return true;
    } else {
      // Alerta mais informativo sobre bloqueadores de pop-up
      const errorMsg = "O bloqueador de pop-ups pode estar impedindo a abertura da janela de impressão. ";
      console.error(errorMsg);
      alert(errorMsg + "Por favor, permita pop-ups para este site e tente novamente.");
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Erro ao preparar relatório para impressão:', error);
    alert(`Erro ao preparar relatório para impressão: ${error.message}`);
    throw error; // Propagar o erro para tratamento no componente chamador
  }
};