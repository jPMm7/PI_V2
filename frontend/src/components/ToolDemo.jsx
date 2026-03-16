import { useState } from 'react';

export default function ToolDemo() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Os primeiros 60 aminoácidos das sequências reais que extraíste do Ensembl
  const humanSeq = "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP";
  const catSeq   = "MQEPPLELTIEPPLSQETFSELWNLLPENNVLSSELSSAMNELPLSEDVANWLDEAPDDA";

  const handleAnalysis = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    // Simular o atraso do processamento no servidor Node.js/PyTorch
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <section id="tool" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-2">Alinhamento de Sequências</h2>
      <p className="mb-6 text-gray-700">Demonstração interativa de deteção de mutações (Referência vs Mamífero Não-Humano).</p>
      
      <div className="bg-[#eef3f8] p-5 rounded-lg border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-[#1c2a39] m-0">Referência: <span className="font-normal">Homo sapiens (Gene TP53)</span></p>
          <p className="font-semibold text-[#1c2a39] m-0 mt-1">Comparação: <span className="font-normal">Felis catus (Gene TP53)</span></p>
        </div>
        
        <button 
          onClick={handleAnalysis} 
          disabled={isAnalyzing}
          className="bg-[#2c5364] text-white px-6 py-3 rounded-md hover:bg-[#1c2a39] transition-colors font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isAnalyzing ? 'A processar algoritmo...' : 'Executar Alinhamento'}
        </button>
      </div>

      {/* RESULTADOS DA ANÁLISE */}
      {showResults && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-bold text-[#1c2a39] mb-3 border-b pb-2">Resultados do Alinhamento</h3>
          
          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm bg-gray-200 block"></span>
              <span className="text-gray-700">Match (Conservado)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm bg-red-500 block"></span>
              <span className="text-gray-700">Mismatch / Mutação</span>
            </div>
          </div>

          {/* O container com fonte monospace (crucial para bioinformática) */}
          <div className="bg-[#1c2a39] text-gray-300 p-5 rounded-lg font-mono text-base sm:text-lg overflow-x-auto shadow-inner leading-relaxed">
            
            {/* Linha do Humano */}
            <div className="flex mb-2">
              <span className="w-20 text-blue-400 font-bold shrink-0">HUMAN</span>
              <div className="flex gap-[1px]">
                {humanSeq.split('').map((char, index) => (
                  <span key={`h-${index}`} className="w-[18px] text-center inline-block">
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Linha do Gato com as verificações dinâmicas */}
            <div className="flex">
              <span className="w-20 text-green-400 font-bold shrink-0">FELIS</span>
              <div className="flex gap-[1px]">
                {catSeq.split('').map((char, index) => {
                  const isDiff = char !== humanSeq[index];
                  return (
                    <span 
                      key={`c-${index}`} 
                      className={`w-[18px] text-center inline-block rounded-sm ${isDiff ? 'bg-red-500 text-white font-bold' : 'text-gray-400'}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}