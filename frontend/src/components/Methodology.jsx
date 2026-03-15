export default function Methodology() {
  // Os passos exatos do vosso pipeline bioinformático
  const steps = [
    "Obtenção de sequências proteicas de bases de dados (UniProt / NCBI)",
    "Alinhamento de sequências com algoritmos bioinformáticos",
    "Comparação entre sequências humanas e não humanas",
    "Deteção automática de mutações",
    "Análise das diferenças estruturais e funcionais"
  ];

  return (
    <section id="method" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-4">Metodologia</h2>
      <p className="mb-4 text-gray-700">O pipeline bioinformático do projeto inclui:</p>
      
      {/* list-decimal cria os números 1, 2, 3... e marker: muda a cor do próprio número */}
      <ol className="list-decimal pl-6 space-y-3 text-gray-700 marker:text-[#2c5364] marker:font-semibold">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </section>
  );
}