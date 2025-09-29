import React from 'react';
import { ExtensionsIcon, CodeBracketIcon, DeployIcon, LinkIcon, UserGroupIcon } from './icons';

const TutorialStep: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}> = ({ icon, title, description }) => (
  <li className="flex gap-4">
    <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
      <div className="mt-1 text-slate-600 space-y-2">{description}</div>
    </div>
  </li>
);

const Tutorial: React.FC = () => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-slate-200 h-full">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Instruções de Configuração</h3>
      <ol className="space-y-6">
        <TutorialStep
          icon={<ExtensionsIcon className="w-6 h-6 text-slate-600" />}
          title="1. Abra o Google Apps Script"
          description={
            <p>
              Na sua Planilha Google, vá ao menu e clique em{' '}
              <span className="font-semibold">Extensões</span> &rarr;{' '}
              <span className="font-semibold">Apps Script</span>.
            </p>
          }
        />
        <TutorialStep
          icon={<CodeBracketIcon className="w-6 h-6 text-slate-600" />}
          title="2. Cole o Código Personalizado"
          description={
            <>
                <p>
                    Apague qualquer código existente no arquivo <code className="bg-slate-100 text-sm p-1 rounded">Code.gs</code>.
                </p>
                <p>
                    Cole o código fornecido à esquerda. Sua Chave de API, personalidade e modelo já foram incluídos para você.
                </p>
                <p>
                    Salve o projeto do script (Ctrl+S ou Cmd+S).
                </p>
            </>
          }
        />
        <TutorialStep
          icon={<DeployIcon className="w-6 h-6 text-slate-600" />}
          title="3. Implante como um Aplicativo da Web"
          description={
            <>
                <p>
                    Clique no botão azul <span className="font-semibold">Implantar</span> no canto superior direito e selecione{' '}
                    <span className="font-semibold">Nova implantação</span>.
                </p>
                <p>
                    Clique no ícone de engrenagem ao lado de "Selecionar tipo" e escolha <span className="font-semibold">Aplicativo da web</span>.
                </p>
            </>
          }
        />
        <TutorialStep
          icon={<UserGroupIcon className="w-6 h-6 text-slate-600" />}
          title="4. Configure o Acesso"
          description={
            <>
                <p>Na configuração da implantação:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Dê uma descrição (ex: "Chatbot v1").</li>
                    <li>Deixe "Executar como" definido como "Eu".</li>
                    <li>
                        Para "Quem tem acesso", selecione <span className="font-semibold">Qualquer pessoa</span>. Isso é necessário para que o chatbot possa chamar esta URL de um site público.
                    </li>
                </ul>
                <p className="mt-2">Clique em <span className="font-semibold">Implantar</span> e autorize as permissões do script quando solicitado.</p>
            </>
          }
        />
        <TutorialStep
          icon={<LinkIcon className="w-6 h-6 text-slate-600" />}
          title="5. Obtenha a URL do Webhook"
          description={
            <>
                <p>
                    Após autorizar, um modal de "Implantação atualizada com sucesso" aparecerá. Copie a <span className="font-semibold">URL do aplicativo da web</span>.
                </p>
                <p>
                    Cole esta URL na caixa de entrada abaixo e clique em "Gerar Código de Incorporação".
                </p>
            </>
          }
        />
      </ol>
    </div>
  );
};

export default Tutorial;