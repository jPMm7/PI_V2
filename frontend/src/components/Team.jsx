export default function Team() {
  const teamMembers = [
    { name: "Gonçalo Santos" },
    { name: "João Ferreira" },
    { name: "José Ferreira" },
    { name: "João Marques" }
  ];

  return (
    <section id="team" className="bg-white p-[30px] mb-[30px] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-6">Equipa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member, index) => (
          <div 
            key={index} 
            className="bg-[#eef3f8] p-6 rounded-lg text-center hover:bg-[#e2eaf4] transition-colors border border-gray-200"
          >
            <h3 className="text-[#1c2a39] text-xl font-semibold m-0 flex justify-center items-center gap-3">
              <span className="text-3xl text-gray-400">👤</span>
              {member.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}