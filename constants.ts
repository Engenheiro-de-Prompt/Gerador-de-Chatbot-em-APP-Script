
interface ScriptConfig {
  mode: 'chatbot' | 'assistant';
  apiKey: string;
  systemInstruction?: string;
  model?: string;
  assistantId?: string;
}

const generateAssistantScript = (apiKey: string, assistantId: string): string => `
// Bem-vindo ao Integrador de Chatbot de IA para Planilhas!
// Este script foi personalizado para usar a API de Assistentes da OpenAI.

// 1. Sua configuração
const OPENAI_API_KEY = "${apiKey}";
const ASSISTANT_ID = "${assistantId}";

// 2. (Opcional) Altere o nome da planilha onde as conversas serão registradas.
const SHEET_NAME = "Histórico de Conversas";

// ==========================================================================
// NÃO EDITE O CÓDIGO ABAIXO DESTA LINHA
// ==========================================================================

const API_BASE_URL = 'https://api.openai.com/v1';

/**
 * Obtém a planilha de histórico, criando-a com os cabeçalhos corretos se não existir.
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    // Adiciona a coluna 'ID da Thread' para o modo Assistente
    const headers = ["Data/Hora", "ID da Sessão", "ID da Thread", "Papel", "Mensagem"];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    headers.forEach((_, i) => sheet.autoResizeColumn(i + 1));
  }
  return sheet;
}

/**
 * Registra uma mensagem na planilha.
 */
function logMessage(sessionId, threadId, role, message) {
  const sheet = getSheet();
  sheet.appendRow([new Date(), sessionId, threadId, role, message]);
}

/**
 * Procura um threadId existente para uma sessão ou cria um novo.
 */
function getOrCreateThreadIdForSession(sessionId) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  // Procura de baixo para cima para encontrar o registro mais recente da sessão
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === sessionId && data[i][2]) { // Coluna B: ID da Sessão, Coluna C: ID da Thread
      return data[i][2];
    }
  }

  // Se nenhum thread for encontrado, cria um novo
  const response = UrlFetchApp.fetch(\`\${API_BASE_URL}/threads\`, {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + OPENAI_API_KEY,
      'OpenAI-Beta': 'assistants=v2'
    },
    muteHttpExceptions: true
  });
  
  const thread = JSON.parse(response.getContentText());
  if (!thread.id) {
    Logger.log("Falha ao criar thread: " + response.getContentText());
    throw new Error("Não foi possível criar uma nova thread de conversa.");
  }
  return thread.id;
}

/**
 * Lida com requisições HTTP POST para o aplicativo da web.
 */
function doPost(e) {
  try {
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      throw new Error("Chave da API da OpenAI ou ID do Assistente não estão definidos no script.");
    }
    
    const body = JSON.parse(e.postData.contents);
    const userMessage = body.message;
    const sessionId = body.sessionId;

    if (!userMessage || !sessionId) {
      throw new Error("O corpo da requisição deve conter 'message' e 'sessionId'.");
    }

    const threadId = getOrCreateThreadIdForSession(sessionId);
    logMessage(sessionId, threadId, "user", userMessage);

    // Adiciona a mensagem do usuário à thread
    UrlFetchApp.fetch(\`\${API_BASE_URL}/threads/\${threadId}/messages\`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ role: 'user', content: userMessage }),
      headers: { 'Authorization': 'Bearer ' + OPENAI_API_KEY, 'OpenAI-Beta': 'assistants=v2' }
    });

    // Executa a thread com o assistente
    const runResponse = UrlFetchApp.fetch(\`\${API_BASE_URL}/threads/\${threadId}/runs\`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ assistant_id: ASSISTANT_ID }),
      headers: { 'Authorization': 'Bearer ' + OPENAI_API_KEY, 'OpenAI-Beta': 'assistants=v2' }
    });
    const run = JSON.parse(runResponse.getContentText());
    const runId = run.id;

    // Aguarda a conclusão da execução (polling)
    let runStatus = run.status;
    const maxPolls = 30; // ~30 segundos de timeout
    let pollCount = 0;
    while ((runStatus === 'queued' || runStatus === 'in_progress') && pollCount < maxPolls) {
      Utilities.sleep(1000); // Aguarda 1 segundo
      const statusResponse = UrlFetchApp.fetch(\`\${API_BASE_URL}/threads/\${threadId}/runs/\${runId}\`, {
        headers: { 'Authorization': 'Bearer ' + OPENAI_API_KEY, 'OpenAI-Beta': 'assistants=v2' }
      });
      runStatus = JSON.parse(statusResponse.getContentText()).status;
      pollCount++;
    }

    if (runStatus !== 'completed') {
      throw new Error(\`A execução falhou ou expirou com o status: \${runStatus}\`);
    }

    // Recupera as mensagens da thread
    const messagesResponse = UrlFetchApp.fetch(\`\${API_BASE_URL}/threads/\${threadId}/messages\`, {
      headers: { 'Authorization': 'Bearer ' + OPENAI_API_KEY, 'OpenAI-Beta': 'assistants=v2' }
    });
    const messagesData = JSON.parse(messagesResponse.getContentText());
    
    // A API retorna as mensagens mais recentes primeiro
    const assistantMessage = messagesData.data.find(m => m.role === 'assistant');
    const aiResponse = assistantMessage && assistantMessage.content[0].type === 'text'
      ? assistantMessage.content[0].text.value
      : "Não foi possível obter uma resposta do assistente.";

    logMessage(sessionId, threadId, "assistant", aiResponse);

    return ContentService
      .createTextOutput(JSON.stringify({ reply: aiResponse }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Erro no doPost: " + error.toString() + "\\n" + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({ error: "Um erro inesperado ocorreu: " + error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`.trim();

const generateChatbotScript = (apiKey: string, systemInstruction: string, model: string): string => {
  const escapedInstruction = systemInstruction.replace(/`/g, '\\`');
  return `
// Bem-vindo ao Integrador de Chatbot de IA para Planilhas!
// Este script foi personalizado com a sua configuração.

// 1. Sua configuração
const OPENAI_API_KEY = "${apiKey}";
const SYSTEM_INSTRUCTION = \`${escapedInstruction}\`;
const OPENAI_MODEL = "${model}";

// 2. (Opcional) Altere o nome da planilha onde as conversas serão registradas.
const SHEET_NAME = "Histórico de Conversas";

// ==========================================================================
// NÃO EDITE O CÓDIGO ABAIXO DESTA LINHA
// ==========================================================================

/**
 * Obtém a planilha de histórico de conversas, criando-a se não existir.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} O objeto da planilha.
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    const headers = ["Data/Hora", "ID da Sessão", "Papel", "Mensagem"];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    // Auto-redimensiona as colunas para melhor legibilidade
    headers.forEach((_, i) => sheet.autoResizeColumn(i + 1));
  }
  return sheet;
}

/**
 * Registra uma mensagem na Planilha Google.
 * @param {string} sessionId O ID único para a sessão de chat.
 * @param {string} role O papel do remetente da mensagem ('user' ou 'assistant').
 * @param {string} message O conteúdo da mensagem.
 */
function logMessage(sessionId, role, message) {
  const sheet = getSheet();
  sheet.appendRow([new Date(), sessionId, role, message]);
}

/**
 * Busca o histórico de conversas para um determinado ID de sessão na planilha.
 * @param {string} sessionId O ID da sessão para filtrar o histórico.
 * @returns {Array<Object>} Um array de objetos de mensagem para a API da OpenAI.
 */
function getChatHistory(sessionId) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const history = [];
  // Começa em 1 para pular a linha do cabeçalho
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === sessionId) { // Coluna B é o ID da Sessão
      const role = data[i][2]; // Coluna C é o Papel (user/assistant)
      const message = data[i][3]; // Coluna D é a Mensagem
      history.push({ role: role, content: message });
    }
  }
  return history;
}

/**
 * Chama a API da OpenAI com o histórico de conversas fornecido.
 * @param {Array<Object>} messages O histórico da conversa.
 * @returns {string} A resposta em texto da IA.
 */
function callOpenAIAPI(messages) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const payload = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...messages
    ]
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'Authorization': 'Bearer ' + OPENAI_API_KEY
    },
    'muteHttpExceptions': true // Importante para depurar erros
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (response.getResponseCode() >= 400) {
      Logger.log("Erro na Resposta da API OpenAI: " + JSON.stringify(data));
      return "Desculpe, ocorreu um erro com o serviço de IA: " + (data.error ? data.error.message : "Erro desconhecido.");
    }
    
    if (data.choices && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    } else {
      Logger.log("Resposta Inválida da API OpenAI: " + JSON.stringify(data));
      return "Desculpe, recebi uma resposta inválida da IA. Por favor, verifique os logs do script.";
    }
  } catch (error) {
    Logger.log("Erro na Chamada da API OpenAI: " + error.toString());
    return "Desculpe, ocorreu um erro ao conectar com o serviço de IA. Por favor, verifique sua chave de API e os logs do script.";
  }
}

/**
 * Lida com requisições HTTP POST para o aplicativo da web.
 * @param {Object} e O parâmetro de evento para uma requisição POST.
 * @returns {GoogleAppsScript.Content.TextOutput} A resposta JSON.
 */
function doPost(e) {
  try {
    if (OPENAI_API_KEY === "PASTE_YOUR_OPENAI_API_KEY_HERE" || !OPENAI_API_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: "A chave da API da OpenAI não está definida. Por favor, atualize a OPENAI_API_KEY no seu script." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const body = JSON.parse(e.postData.contents);
    const userMessage = body.message;
    const sessionId = body.sessionId;

    if (!userMessage || !sessionId) {
      throw new Error("O corpo da requisição deve conter 'message' e 'sessionId'.");
    }

    // OpenAI usa 'user' e 'assistant' para os papéis
    logMessage(sessionId, "user", userMessage);

    const history = getChatHistory(sessionId);
    
    const aiResponse = callOpenAIAPI(history);
    
    logMessage(sessionId, "assistant", aiResponse);

    return ContentService
      .createTextOutput(JSON.stringify({ reply: aiResponse }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Erro no doPost: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: "Um erro inesperado ocorreu: " + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`.trim();
};

export const generateScriptCode = (config: ScriptConfig): string => {
  if (config.mode === 'assistant') {
    return generateAssistantScript(config.apiKey, config.assistantId!);
  }
  return generateChatbotScript(config.apiKey, config.systemInstruction!, config.model!);
};
