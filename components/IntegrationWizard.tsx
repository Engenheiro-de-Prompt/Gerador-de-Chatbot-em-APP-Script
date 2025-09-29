import React, { useState, useCallback } from 'react';
import CodeBlock from './CodeBlock';
import Tutorial from './Tutorial';
import { LinkIcon, ArrowRightIcon } from './icons';

interface IntegrationWizardProps {
  scriptCode: string;
  onComplete: (webhookUrl: string) => void;
}

const IntegrationWizard: React.FC<IntegrationWizardProps> = ({ scriptCode, onComplete }) => {
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (webhookUrl.trim() && webhookUrl.startsWith('https://script.google.com/')) {
      onComplete(webhookUrl.trim());
    } else {
        alert("Por favor, insira uma URL válida do Aplicativo da Web do Google Apps Script.");
    }
  }, [webhookUrl, onComplete]);

  return (
    <div className="w-full max-w-7xl animate-fade-in-up">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Vamos Começar a Configuração</h2>
        <p className="mt-3 text-lg text-slate-600">Siga os passos abaixo para conectar sua Planilha Google.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
            <div className="h-[40rem]">
                <CodeBlock code={scriptCode} />
            </div>
        </div>

        <div className="flex flex-col gap-8 sticky top-24">
            <Tutorial />
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Passo 6: Obtenha seu Código de Incorporação</h3>
                <p className="text-slate-600 mb-4">Cole a URL do aplicativo da web para gerar seu snippet de chatbot seguro.</p>
                <div className="flex items-center gap-3">
                    <LinkIcon className="h-6 w-6 text-slate-400 flex-shrink-0" />
                    <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!webhookUrl.trim()}
                >
                    Gerar Código de Incorporação
                    <ArrowRightIcon className="h-5 w-5" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default IntegrationWizard;