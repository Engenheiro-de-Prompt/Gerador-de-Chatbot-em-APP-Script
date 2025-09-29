
import React, { useState, useCallback } from 'react';
import IntegrationWizard from './components/IntegrationWizard';
import EmbedCodeView from './components/EmbedCodeView';
import { SheetIcon, KeyIcon, ChatBubbleIcon, CpuChipIcon, ArrowRightIcon, IdentificationIcon } from './components/icons';
import { generateScriptCode } from './constants';

type AppState = 'initial' | 'setup' | 'complete';
type Model = 'gpt-5-nano-2025-08-07' | 'gpt-5-mini-2025-08-07';
type Mode = 'chatbot' | 'assistant';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  
  // State for the configuration form
  const [mode, setMode] = useState<Mode>('chatbot');
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Você é um assistente amigável e prestativo.');
  const [model, setModel] = useState<Model>('gpt-5-nano-2025-08-07');
  const [assistantId, setAssistantId] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');

  const handleGenerateScript = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Por favor, insira sua Chave da API da OpenAI.');
      return;
    }
    
    let script = '';
    if (mode === 'assistant') {
      if (!assistantId.trim()) {
        alert('Por favor, insira seu ID do Assistente da OpenAI.');
        return;
      }
      script = generateScriptCode({ mode, apiKey, assistantId });
    } else {
      script = generateScriptCode({ mode, apiKey, systemInstruction: systemPrompt, model });
    }

    setGeneratedScript(script);
    setAppState('setup');
  }, [apiKey, systemPrompt, model, mode, assistantId]);

  const handleSetupComplete = useCallback((url: string) => {
    setWebhookUrl(url);
    setAppState('complete');
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SheetIcon className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-slate-700">Integrador de Chatbot IA para Planilhas</span>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8 md:py-16 flex flex-col items-center">
        {appState === 'initial' && (
          <div className="w-full max-w-2xl animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Configure seu Chatbot de IA
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                    Insira seus dados abaixo para gerar um Google Apps Script personalizado.
                </p>
            </div>
            <form onSubmit={handleGenerateScript} className="mt-10 bg-white p-8 rounded-lg shadow-lg border border-slate-200 space-y-6">
              <div className="flex justify-center p-1 bg-slate-100 rounded-lg">
                <button type="button" onClick={() => setMode('chatbot')} className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'chatbot' ? 'bg-white text-blue-600 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                  Chatbot Padrão
                </button>
                <button type="button" onClick={() => setMode('assistant')} className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'assistant' ? 'bg-white text-blue-600 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                  Assistente de IA
                </button>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">Chave da API da OpenAI</label>
                <div className="relative">
                  <KeyIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
              
              {mode === 'chatbot' ? (
                <>
                  <div>
                    <label htmlFor="systemPrompt" className="block text-sm font-medium text-slate-700 mb-2">Personalidade do Chatbot (Prompt do Sistema)</label>
                    <div className="relative">
                      <ChatBubbleIcon className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" />
                       <textarea
                        id="systemPrompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={4}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Ex: Você é um assistente prestativo para uma empresa de SaaS..."
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-slate-700 mb-2">Modelo de IA</label>
                     <div className="relative">
                      <CpuChipIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value as Model)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                      >
                        <option value="gpt-5-nano-2025-08-07">GPT-5 Nano (Padrão)</option>
                        <option value="gpt-5-mini-2025-08-07">GPT-5 Mini</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="assistantId" className="block text-sm font-medium text-slate-700 mb-2">ID do Assistente da OpenAI</label>
                  <div className="relative">
                    <IdentificationIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="assistantId"
                      type="text"
                      value={assistantId}
                      onChange={(e) => setAssistantId(e.target.value)}
                      placeholder="asst_..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">O modelo, as instruções e as ferramentas são gerenciados nas configurações do seu Assistente na OpenAI.</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Gerar Script e Continuar
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {appState === 'setup' && (
          <IntegrationWizard scriptCode={generatedScript} onComplete={handleSetupComplete} />
        )}

        {appState === 'complete' && webhookUrl && (
          <EmbedCodeView webhookUrl={webhookUrl} />
        )}
      </main>
      
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Desenvolvido com React, Tailwind CSS e Google Apps Script.</p>
      </footer>
    </div>
  );
};

export default App;
