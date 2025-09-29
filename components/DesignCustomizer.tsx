import React from 'react';

export interface DesignSettings {
  primaryColor: string;
  textColor: string;
  initialMessage: string;
  headerTitle: string;
  position: 'bottom-right' | 'bottom-left';
}

interface DesignCustomizerProps {
    design: DesignSettings;
    onDesignChange: React.Dispatch<React.SetStateAction<DesignSettings>>;
}

const DesignCustomizer: React.FC<DesignCustomizerProps> = ({ design, onDesignChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onDesignChange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePositionChange = (position: 'bottom-right' | 'bottom-left') => {
        onDesignChange(prev => ({ ...prev, position }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Personalize seu Chatbot</h3>
            <div className="space-y-6">
                <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-slate-700 mb-2">Cor Principal</label>
                    <div className="relative flex items-center gap-4">
                        <input
                            type="color"
                            id="primaryColor"
                            name="primaryColor"
                            value={design.primaryColor}
                            onChange={handleChange}
                            className="w-12 h-10 p-1 bg-white border border-slate-300 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={design.primaryColor}
                            name="primaryColor"
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono text-sm"
                         />
                    </div>
                </div>
                 <div>
                    <label htmlFor="textColor" className="block text-sm font-medium text-slate-700 mb-2">Cor do Texto e Ícones</label>
                    <div className="relative flex items-center gap-4">
                        <input
                            type="color"
                            id="textColor"
                            name="textColor"
                            value={design.textColor}
                            onChange={handleChange}
                            className="w-12 h-10 p-1 bg-white border border-slate-300 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={design.textColor}
                            name="textColor"
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono text-sm"
                         />
                    </div>
                </div>
                <div>
                    <label htmlFor="headerTitle" className="block text-sm font-medium text-slate-700 mb-2">Título do Cabeçalho</label>
                    <input
                        type="text"
                        id="headerTitle"
                        name="headerTitle"
                        value={design.headerTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>
                <div>
                    <label htmlFor="initialMessage" className="block text-sm font-medium text-slate-700 mb-2">Mensagem de Saudação Inicial</label>
                    <textarea
                        id="initialMessage"
                        name="initialMessage"
                        value={design.initialMessage}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Posição do Chatbot</label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handlePositionChange('bottom-right')}
                            className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${design.position === 'bottom-right' ? 'bg-white text-blue-600 shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                            Canto Inferior Direito
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePositionChange('bottom-left')}
                            className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${design.position === 'bottom-left' ? 'bg-white text-blue-600 shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                        >
                           Canto Inferior Esquerdo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignCustomizer;