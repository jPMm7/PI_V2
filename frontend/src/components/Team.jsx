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
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4fc3f7]"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {member.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}