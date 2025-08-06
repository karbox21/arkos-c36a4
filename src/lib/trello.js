import React from 'react';

// ====================================================================
// Linhas modificadas:
// Agora, as chaves e tokens são lidos de forma segura do seu arquivo .env
// ====================================================================
const TRELLO_API_KEY_PRIMARY = import.meta.env.VITE_TRELLO_API_KEY_PRIMARY;
const TRELLO_TOKEN_PRIMARY = import.meta.env.VITE_TRELLO_TOKEN_PRIMARY;
// ====================================================================


const TRELLO_BOARD_ID_SHARED = '645e2f9ff81077eae3eb42db'; 
const TRELLO_LIST_NAME_DEFAULT = 'ENTRADA';

async function findListIdByName(boardId, listName, apiKey, token) {
  const url = `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText || 'Falha ao converter erro do Trello para JSON' };
      }
      console.error(`Erro ao buscar listas do Trello (status: ${response.status}):`, errorData);
      const errorMessage = errorData.message || (errorData.error && errorData.error.message) || 'Erro desconhecido ao buscar listas.';
      throw new Error(`Erro ${response.status} ao buscar listas no quadro "${boardId}": ${errorMessage}. Verifique o ID do quadro, nome da lista e permissões do token.`);
    }
    const lists = await response.json();
    if (!lists || !Array.isArray(lists)) {
      throw new Error(`Resposta inválida do Trello: listas não encontradas ou formato inválido. Verifique o ID do quadro e permissões do token.`);
    }
    const targetList = lists.find(list => list.name.toUpperCase() === listName.toUpperCase() && !list.closed);
    if (!targetList) {
      throw new Error(`Lista "${listName}" não encontrada ou está arquivada no quadro "${boardId}". Verifique se a lista existe e não está arquivada, e se o token tem permissão para acessá-la.`);
    }
    return targetList.id;
  } catch (error) {
    console.error('Falha ao buscar ID da lista do Trello:', error);
    throw error;
  }
}

// Cache para armazenar o ID da lista por um curto período de tempo
let listIdCache = {
  id: null,
  timestamp: 0,
  expiresInMs: 5 * 60 * 1000 // 5 minutos
};

// Função para obter o ID da lista, usando cache quando possível
async function getListId(boardId, listName, apiKey, token) {
  const now = Date.now();
  
  // Se temos um ID em cache e ele ainda é válido, use-o
  if (listIdCache.id && (now - listIdCache.timestamp) < listIdCache.expiresInMs) {
    console.log('Usando ID da lista em cache');
    return listIdCache.id;
  }
  
  // Caso contrário, busque um novo ID
  try {
    const id = await findListIdByName(boardId, listName, apiKey, token);
    // Atualizar o cache
    listIdCache = {
      id,
      timestamp: now,
      expiresInMs: 5 * 60 * 1000
    };
    return id;
  } catch (error) {
    console.error('Erro ao obter ID da lista:', error);
    throw error;
  }
}

export const createTrelloCardWithAttachments = async (cardDetails) => {
  try {
    const apiKeyToUse = TRELLO_API_KEY_PRIMARY;
    const tokenToUse = TRELLO_TOKEN_PRIMARY;
    const boardIdToUse = TRELLO_BOARD_ID_SHARED;
    const listNameToUse = TRELLO_LIST_NAME_DEFAULT;

    // Validar configurações do Trello
    if (!apiKeyToUse || !tokenToUse || !boardIdToUse) {
      const missing = [];
      if (!apiKeyToUse) missing.push("API Key");
      if (!tokenToUse) missing.push("Token");
      if (!boardIdToUse) missing.push("Board ID");
      const errorMsg = `Configuração do Trello incompleta. Faltando: ${missing.join(', ')}.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Validar dados do cartão
    const { title, description, attachments = [] } = cardDetails;
    if (!title) {
      throw new Error('Título do cartão é obrigatório');
    }

    // Obter ID da lista (usando cache quando possível)
    const idList = await getListId(boardIdToUse, listNameToUse, apiKeyToUse, tokenToUse);

    // Preparar dados do cartão
    const cardData = {
      name: title,
      desc: description || '',
      idList: idList,
      key: apiKeyToUse,
      token: tokenToUse,
    };

    // Criar o cartão com tratamento de erros aprimorado
    console.log('Criando cartão no Trello...');
    const createCardUrl = `https://api.trello.com/1/cards`;
    
    let createdCard;
    try {
      // Usar AbortController para permitir cancelamento da requisição se demorar muito
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
      
      const response = await fetch(createCardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cardData),
        signal: controller.signal
      });
      
      // Limpar o timeout se a requisição completar antes do timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText || 'Falha ao converter erro do Trello para JSON ao criar card.' };
        }
        console.error(`Erro ao criar card no Trello (status: ${response.status}):`, errorData);
        const errorMessage = errorData.message || (errorData.error && errorData.error.message) || 'Erro desconhecido ao criar card.';
        throw new Error(`Erro ${response.status} ao criar card: ${errorMessage}`);
      }
      createdCard = await response.json();
      console.log('Cartão criado com sucesso:', createdCard.id);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Timeout ao criar card no Trello - a requisição demorou muito');
        throw new Error('A requisição para criar o card no Trello demorou muito e foi cancelada. Tente novamente.');
      }
      console.error('Falha na criação do card Trello:', error);
      throw error;
    }
      
    // Anexar arquivos, se houver
    if (createdCard && createdCard.id && attachments.length > 0) {
      createdCard.attachmentErrors = []; 
      console.log(`Anexando ${attachments.length} arquivo(s) ao cartão...`);
      
      // Processar anexos em paralelo para melhorar o desempenho, mas com limite de concorrência
      // para evitar sobrecarga do navegador
      const processAttachments = async () => {
        const results = [];
        const concurrencyLimit = 2; // Processar no máximo 2 anexos simultaneamente
        const queue = [...attachments];
        
        // Função para processar um único anexo
        const processAttachment = async (attachment) => {
          if (!attachment.file) return null;

          const formData = new FormData();
          formData.append('key', apiKeyToUse);
          formData.append('token', tokenToUse);
          formData.append('file', attachment.file, attachment.fileName || attachment.file.name);
          formData.append('mimeType', attachment.mimeType || attachment.file.type);
          
          const attachmentUrl = `https://api.trello.com/1/cards/${createdCard.id}/attachments`;
          try {
            console.log(`Enviando anexo: ${attachment.fileName || attachment.file.name}`);
            
            // Usar AbortController para permitir cancelamento da requisição se demorar muito
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
            
            const attachmentResponse = await fetch(attachmentUrl, {
              method: 'POST',
              body: formData,
              signal: controller.signal
            });
            
            // Limpar o timeout se a requisição completar antes do timeout
            clearTimeout(timeoutId);

            if (!attachmentResponse.ok) {
              let attachmentErrorData;
              try {
                attachmentErrorData = await attachmentResponse.json();
              } catch (e) {
                attachmentErrorData = { message: attachmentResponse.statusText || 'Falha ao converter erro do Trello para JSON ao anexar.' };
              }
              const attachErrorMessage = attachmentErrorData.message || (attachmentErrorData.error && attachmentErrorData.error.message) || 'Erro desconhecido ao anexar arquivo.';
              console.warn(`Card criado (ID: ${createdCard.id}), mas falha ao anexar "${attachment.fileName || attachment.file.name}": ${attachErrorMessage}`);
              return `Falha ao anexar ${attachment.fileName || attachment.file.name}: ${attachErrorMessage}`;
            } else {
              console.log(`Arquivo "${attachment.fileName || attachment.file.name}" anexado com sucesso ao card ID: ${createdCard.id}.`);
              return null; // Sucesso
            }
          } catch (attachError) {
            if (attachError.name === 'AbortError') {
              console.warn(`Timeout ao anexar "${attachment.fileName || attachment.file.name}" - a requisição demorou muito`);
              return `Timeout ao anexar ${attachment.fileName || attachment.file.name}: A requisição demorou muito e foi cancelada.`;
            }
            console.warn(`Card criado (ID: ${createdCard.id}), mas ocorreu um erro de rede/fetch ao anexar "${attachment.fileName || attachment.file.name}": ${attachError.message}`);
            return `Erro de rede/fetch ao anexar ${attachment.fileName || attachment.file.name}: ${attachError.message}`;
          }
        };
        
        // Processar anexos com limite de concorrência
        while (queue.length > 0) {
          const batch = queue.splice(0, concurrencyLimit);
          const batchPromises = batch.map(processAttachment);
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
          
          // Pequena pausa entre lotes para permitir que a UI responda
          if (queue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        return results;
      };
      
      // Processar anexos e filtrar apenas os erros (valores não nulos)
      const attachmentResults = await processAttachments();
      createdCard.attachmentErrors = attachmentResults.filter(result => result !== null);
    }
    
    return createdCard;
  } catch (error) {
    console.error('Erro geral na integração com Trello:', error);
    throw error;
  }
};