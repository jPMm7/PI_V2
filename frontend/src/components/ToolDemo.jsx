import { useState } from 'react';

export default function ToolDemo() {
  const [sequence, setSequence] = useState('');
  const [result, setResult] = useState('');

  const handleAnalysis = () => {
    if (!sequence) {
      setResult('Por favor, insere uma sequência válida.');
      return;
    }
    setResult('Análise simulada concluída: identificadas 2 diferenças de aminoácidos e 1 mutação compensatória putativa entre a referência humana e o proteoma da espécie analisada.');
  };

  return (
    <section id="tool" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-2xl font-bold mb-4 mt-0">Demonstração da Ferramenta</h2>
      <p className="mb-4 text-gray-700">Introduz uma sequência de proteína para simular análise:</p>
      
      <textarea 
        rows="5" 
        placeholder="Insere sequência de aminoácidos (ex: referência humana vs Felis catus)..."
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
        className="w-full p-3 mt-1 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c5364] bg-white"
      />
      
      <button 
        onClick={handleAnalysis} 
        className="bg-[#2c5364] text-white px-5 py-2.5 rounded-md hover:bg-[#1c2a39] transition-colors font-medium cursor-pointer"
      >
        Analisar
      </button>

      {result && (
        <div className="mt-6 p-4 bg-[#eef3f8] rounded-lg text-gray-800 font-medium">
          <p>{result}</p>
        </div>
      )}
    </section>
  );
}