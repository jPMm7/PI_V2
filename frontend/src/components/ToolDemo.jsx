import { useState } from 'react';

export default function ToolDemo() {
  const [sequence, setSequence] = useState('');
  const [result, setResult] = useState('');

  const handleAnalysis = () => {
    if (!sequence) {
      setResult('Por favor, insere uma sequência válida.');
      return;
    }
    // Aqui no futuro o React vai comunicar com o servidor Node.js dos teus colegas
    setResult('Análise concluída: identificadas 2 diferenças de aminoácidos e 1 mutação compensatória putativa entre a referência humana e o proteoma do gato (Felis catus).');
  };

  return (
    <section id="tool" className="card">
      <h2>Demonstração da Ferramenta</h2>
      <p>Introduz uma sequência de proteína para simular análise:</p>
      
      <textarea 
        rows="5" 
        placeholder="Insere sequência de aminoácidos..."
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
        style={{ width: '100%', marginBottom: '15px' }}
      />
      
      <button onClick={handleAnalysis} style={{ background: '#2c5364', color: 'white', padding: '10px 18px' }}>
        Analisar
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#eef3f8', borderRadius: '8px' }}>
          <p>{result}</p>
        </div>
      )}
    </section>
  );
}