export default function Objectives() {
  const objectivesList = [
    {
      icon: "🎯",
      title: "Objetivo Principal",
      desc: "Desenvolver uma plataforma web para identificar alterações compensatórias de aminoácidos em mutações associadas a doenças humanas."
    },
    {
      icon: "🗄️",
      title: "Dados e Uploads",
      desc: "Integração direta com o Ensembl (genómica) e repositórios estruturais 3D como o PDB e AlphaFold. Suporta também uploads de sequências manuais (FASTA)."
    },
    {
      icon: "🔬",
      title: "Análise Comparativa",
      desc: "Contrasta as sequências de referência humanas com ortólogos de mamíferos para detetar potenciais efeitos compensatórios."
    },
    {
      icon: "🧬",
      title: "Visualização 3D",
      desc: "Apresenta interativamente alinhamentos de sequências e os respetivos impactos estruturais espaciais para mapear dinâmicas compensatórias."
    }
  ];

  return (
    <section id="objectives" className="bg-white p-[30px] mb-[30px] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-6">Objetivos e Funcionalidades</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {objectivesList.map((item, index) => (
          <div key={index} className="bg-[#eef3f8] p-5 rounded-lg border border-gray-200 transition-colors hover:border-[#2c5364]/30 hover:bg-[#e6edf4]">
            <h3 className="font-bold text-[#1c2a39] flex items-center gap-2 mb-2">
              <span className="text-xl">{item.icon}</span> {item.title}
            </h3>
            <p className="text-sm text-gray-600 m-0 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}