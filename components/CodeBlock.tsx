
import React, { useState, useCallback } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg relative h-full flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-900/50 rounded-t-lg">
        <span className="text-xs font-mono text-slate-400">Code.gs</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
          {copied ? 'Copiado!' : 'Copiar Código'}
        </button>
      </div>
      <div className="overflow-auto p-4 flex-grow">
        <pre className="text-sm text-slate-100 whitespace-pre-wrap">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;