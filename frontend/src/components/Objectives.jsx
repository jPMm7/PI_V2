export default function Objectives() {
  const objectivesList = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#2c5364]"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
      title: "Objetivo Principal",
      desc: "Desenvolver uma plataforma web para identificar alterações compensatórias de aminoácidos em mutações associadas a doenças humanas."
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#2c5364]"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
      title: "Dados e Uploads",
      desc: "Integração direta com o Ensembl (genómica) e repositórios estruturais 3D como o PDB e AlphaFold. Suporta também uploads de sequências manuais (FASTA)."
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#2c5364]"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>,
      title: "Análise Comparativa",
      desc: "Contrasta as sequências de referência humanas com ortólogos de mamíferos para detetar potenciais efeitos compensatórios."
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#2c5364]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
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
              <span className="flex items-center justify-center shrink-0">{item.icon}</span> {item.title}
            </h3>
            <p className="text-sm text-gray-600 m-0 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}