export default function Team() {
  // A lista da vossa equipa baseada no protótipo original
  const teamMembers = [
    { name: "Gonçalo Santos", role: "Bioinformática" },
    { name: "João Ferreira", role: "Programação" },
    { name: "José Ferreira", role: "Análise de Dados" },
    { name: "João Marques", role: "Mais Responsável" }
  ];

  return (
    <section id="team" className="bg-white p-[30px] mb-[30px] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-6">Equipa</h2>
      
      {/* Container Flexbox: flex-wrap permite que os blocos desçam de linha em ecrãs pequenos */}
      <div className="flex flex-wrap gap-5">
        
        {teamMembers.map((member, index) => (
          /* flex-1 faz com que ocupem o mesmo espaço, min-w-[200px] garante que não ficam esmagados */
          <div 
            key={index} 
            className="flex-1 min-w-[200px] bg-[#eef3f8] p-5 rounded-lg text-center hover:bg-[#e2eaf4] transition-colors"
          >
            <h3 className="text-[#1c2a39] text-xl font-semibold mt-0 mb-2">{member.name}</h3>
            <p className="text-gray-700 m-0">{member.role}</p>
          </div>
        ))}

      </div>
    </section>
  );
}