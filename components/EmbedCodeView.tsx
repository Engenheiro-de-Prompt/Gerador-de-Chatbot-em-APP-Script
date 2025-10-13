
import React, { useState, useEffect, useRef } from 'react';
import CodeBlock from './CodeBlock';
import DesignCustomizer, { DesignSettings } from './DesignCustomizer';
import { CheckCircleIcon } from './icons';

interface EmbedCodeViewProps {
  webhookUrl: string;
}

const generateEmbedCode = (webhookUrl: string, design: DesignSettings): string => {
  const positionStyles = design.position === 'bottom-left'
    ? `bottom: 2rem; left: 2rem;`
    : `bottom: 2rem; right: 2rem;`;
    
  const escapedGreeting = design.initialMessage.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const escapedTitle = design.headerTitle.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

  return `
<!-- Início do Código do Chatbot AI para Planilhas -->
<div id="ai-chatbot-root"></div>
<style>
  [id^="ai-chatbot-root"] {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --chatbot-primary-color: ${design.primaryColor};
    --chatbot-text-color: ${design.textColor};
  }
  .chatbot-bubble {
    position: fixed;
    ${positionStyles}
    background-color: var(--chatbot-primary-color);
    color: var(--chatbot-text-color);
    width: 4rem;
    height: 4rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.2s;
    z-index: 9999;
  }
  .chatbot-bubble:hover {
    transform: scale(1.1);
  }
  .chatbot-bubble svg {
    width: 2rem;
    height: 2rem;
  }
  .chatbot-window {
    position: fixed;
    ${positionStyles}
    width: 90vw;
    max-width: 400px;
    height: 70vh;
    max-height: 600px;
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10000;
  }
  .chatbot-header {
    background-color: var(--chatbot-primary-color);
    color: var(--chatbot-text-color);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .chatbot-header h3 {
    font-weight: 700;
    font-size: 1.125rem;
    margin: 0;
  }
  .chatbot-close-btn {
    background: none;
    border: none;
    color: var(--chatbot-text-color);
    cursor: pointer;
    padding: 0;
  }
  .chatbot-messages {
    flex-grow: 1;
    padding: 1rem;
    overflow-y: auto;
    background-color: #f9fafb;
  }
  .chatbot-msg {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin-bottom: 1rem;
    max-width: 90%;
  }
  .chatbot-msg.user {
    margin-left: auto;
    flex-direction: row-reverse;
  }
  .chatbot-msg-text {
    padding: 0.75rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap; /* Adicionado para respeitar as quebras de linha */
  }
  .chatbot-msg.bot .chatbot-msg-text {
    background-color: #e5e7eb;
    color: #1f2937;
    border-bottom-left-radius: 0.25rem;
  }
  .chatbot-msg.user .chatbot-msg-text {
    background-color: var(--chatbot-primary-color);
    color: var(--chatbot-text-color);
    border-bottom-right-radius: 0.25rem;
  }
  .chatbot-input-area {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    background-color: white;
  }
  .chatbot-input-wrapper {
    position: relative;
  }
  .chatbot-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
    font-size: 1rem;
    box-sizing: border-box;
  }
  .chatbot-send-btn {
    position: absolute;
    right: 0.25rem;
    top: 50%;
    transform: translateY(-50%);
    background-color: var(--chatbot-primary-color);
    color: var(--chatbot-text-color);
    border: none;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .chatbot-send-btn:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  .chatbot-typing-indicator span {
      height: 0.5rem;
      width: 0.5rem;
      background-color: #9ca3af;
      border-radius: 9999px;
      display: inline-block;
      animation: chatbot-bounce 1.4s infinite ease-in-out both;
  }
  .chatbot-typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
  .chatbot-typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
  @keyframes chatbot-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
  }
  .hidden { display: none !important; }
</style>
<script>
(function() {
    // Para pré-visualização, o script pode ser executado várias vezes. Esta função garante que apenas um chatbot seja executado por contêiner.
    const initializeChatbot = (container) => {
      if (!container || container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      const WEBHOOK_URL = "${webhookUrl}";
      const SESSION_ID = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const INITIAL_GREETING = \`${escapedGreeting}\`;
      const HEADER_TITLE = \`${escapedTitle}\`;

      const botIcon = \`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-2 2-2-2z" /></svg>\`;
      const closeIcon = \`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:1.5rem;height:1.5rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>\`;
      const sendIcon = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:1.25rem;height:1.25rem;"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.828 16.5l-3.228-3.228a1 1 0 00-1.414 1.414l4.242 4.242a1 1 0 001.414 0l4.242-4.242a1 1 0 00-1.414-1.414L10.172 16.5a1 1 0 00.276-.7l5-1.428a1 1 0 001.17-1.409l-7-14z" /></svg>\`;

      const chatbotHTML = \`
          <button class="chatbot-bubble" aria-label="Abrir chat">\${botIcon}</button>
          <div class="chatbot-window hidden">
              <header class="chatbot-header">
                  <h3>\${HEADER_TITLE}</h3>
                  <button class="chatbot-close-btn" aria-label="Fechar chat">\${closeIcon}</button>
              </header>
              <div class="chatbot-messages">
                  <div class="chatbot-msg bot">
                      <div class="chatbot-msg-text">\${INITIAL_GREETING}</div>
                  </div>
              </div>
              <div class="chatbot-input-area">
                  <div class="chatbot-input-wrapper">
                      <input type="text" class="chatbot-input" placeholder="Digite sua mensagem...">
                      <button class="chatbot-send-btn" aria-label="Enviar mensagem">\${sendIcon}</button>
                  </div>
              </div>
          </div>
      \`;

      container.innerHTML = chatbotHTML;

      const bubble = container.querySelector('.chatbot-bubble');
      const windowEl = container.querySelector('.chatbot-window');
      const closeBtn = container.querySelector('.chatbot-close-btn');
      const messagesContainer = container.querySelector('.chatbot-messages');
      const input = container.querySelector('.chatbot-input');
      const sendBtn = container.querySelector('.chatbot-send-btn');
      
      const toggleChatbot = () => {
          bubble.classList.toggle('hidden');
          windowEl.classList.toggle('hidden');
          if (!windowEl.classList.contains('hidden')) input.focus();
      };
      
      bubble.addEventListener('click', toggleChatbot);
      closeBtn.addEventListener('click', toggleChatbot);

      const addMessage = (text, sender) => {
          const msgDiv = document.createElement('div');
          msgDiv.className = 'chatbot-msg ' + sender;
          msgDiv.innerHTML = \`<div class="chatbot-msg-text">\${text}</div>\`;
          messagesContainer.appendChild(msgDiv);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
      };

      const setLoading = (isLoading) => {
          const typingIndicator = messagesContainer.querySelector('.chatbot-typing-indicator');
          if (isLoading && !typingIndicator) {
              const indicatorDiv = document.createElement('div');
              indicatorDiv.className = 'chatbot-msg bot chatbot-typing-indicator';
              indicatorDiv.innerHTML = '<div class="chatbot-msg-text"><span></span><span></span><span></span></div>';
              messagesContainer.appendChild(indicatorDiv);
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } else if (!isLoading && typingIndicator) {
              typingIndicator.remove();
          }
          input.disabled = isLoading;
          sendBtn.disabled = isLoading;
      };

      const handleSend = async () => {
          const messageText = input.value.trim();
          if (!messageText) return;

          addMessage(messageText, 'user');
          input.value = '';
          setLoading(true);

          try {
              const response = await fetch(WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                  body: JSON.stringify({ message: messageText, sessionId: SESSION_ID })
              });

              if (!response.ok) throw new Error('A resposta da rede não foi OK.');
              
              const data = await response.json();

              if (data.error) throw new Error(data.error);

              addMessage(data.reply, 'bot');

          } catch (error) {
              console.error('Erro no Chatbot:', error);
              addMessage('Desculpe, algo deu errado. Por favor, tente novamente mais tarde.', 'bot');
          } finally {
              setLoading(false);
              input.focus();
          }
      };

      sendBtn.addEventListener('click', handleSend);
      input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
          }
      });
    }
    
    // Inicia o chatbot no elemento root principal do site.
    if (document.getElementById('ai-chatbot-root')) {
        initializeChatbot(document.getElementById('ai-chatbot-root'));
    }

    // Expõe a função para poder ser usada na pré-visualização.
    window.initAIChatbotPreview = (previewContainer) => {
      const previewRoot = document.createElement('div');
      previewRoot.id = 'ai-chatbot-root-preview';
      previewRoot.style.cssText = 'all: initial;'; // Reseta os estilos para a pré-visualização
      previewContainer.appendChild(previewRoot);
      initializeChatbot(previewRoot);
    };
})();
</script>
<!-- Fim do Código do Chatbot AI para Planilhas -->
`.trim();
};

const EmbedCodeView: React.FC<EmbedCodeViewProps> = ({ webhookUrl }) => {
  const [design, setDesign] = useState<DesignSettings>({
    primaryColor: '#2563eb',
    textColor: '#ffffff',
    initialMessage: 'Olá! Como posso te ajudar hoje?',
    headerTitle: 'Assistente de IA',
    position: 'bottom-right',
  });
  
  const embedCode = generateEmbedCode(webhookUrl, design);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previewNode = previewRef.current;
    if (!previewNode) return;

    // Limpa a pré-visualização anterior
    previewNode.innerHTML = '<p class="p-4">Seu chatbot personalizado aparecerá aqui. Use o painel à esquerda para fazer alterações.</p>';
    const oldScripts = document.querySelectorAll('[id^="chatbot-script-"]');
    oldScripts.forEach(s => s.remove());

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = embedCode;

    const styleTag = tempDiv.querySelector('style');
    const scriptTag = tempDiv.querySelector('script');

    // 1. Adiciona a folha de estilos ao cabeçalho do documento para que as regras (como @keyframes) funcionem
    if (styleTag) {
        styleTag.id = `chatbot-style-${Date.now()}`;
        document.head.appendChild(styleTag);
    }
    
    // 2. Cria e executa o script que contém a lógica do chatbot
    if (scriptTag?.textContent) {
        const script = document.createElement('script');
        script.textContent = scriptTag.textContent;
        script.id = `chatbot-script-${Date.now()}`;
        document.body.appendChild(script);

        // 3. Invoca a função de pré-visualização exposta pelo script
        if (typeof (window as any).initAIChatbotPreview === 'function') {
            previewNode.innerHTML = ''; // Limpa o texto de placeholder
            (window as any).initAIChatbotPreview(previewNode);
        }
    }
    
    return () => {
      // Limpeza ao re-renderizar ou desmontar
      const styles = document.querySelectorAll('[id^="chatbot-style-"]');
      styles.forEach(s => s.remove());
      const scripts = document.querySelectorAll('[id^="chatbot-script-"]');
      scripts.forEach(s => s.remove());
    };
  }, [embedCode]);

  return (
    <div className="w-full max-w-7xl animate-fade-in-up">
      <div className="text-center mb-12">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Seu Chatbot está Pronto!</h2>
        <p className="mt-4 text-slate-600 max-w-3xl mx-auto">
            Personalize a aparência do seu chatbot, copie o código e cole-o no HTML do seu site, um pouco antes da tag de fechamento <code className="bg-slate-200 text-sm p-1 rounded">&lt;/body&gt;</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
            <DesignCustomizer design={design} onDesignChange={setDesign} />
            <div className="h-[32rem]">
                <CodeBlock code={embedCode} />
            </div>
        </div>
        <div className="sticky top-24">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Pré-visualização ao Vivo</h3>
            <div id="ai-chatbot-preview-container" ref={previewRef} className="relative w-full h-[40rem] bg-slate-100 rounded-lg border border-dashed border-slate-300 text-slate-500 overflow-hidden">
                <p className="p-4 text-center">Seu chatbot personalizado aparecerá aqui. Use o painel à esquerda para fazer alterações.</p>
                {/* O chatbot é injetado aqui pelo hook useEffect */}
            </div>
        </div>
      </div>
    </div>
  )
};

export default EmbedCodeView;
