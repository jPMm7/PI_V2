export default function Team() {
  const teamMembers = [
    {
      name: "Gonçalo Santos",
      linkedin: "https://www.linkedin.com/in/gon%C3%A7alo-santos-71a1a9294"
    },
    {
      name: "João Ferreira",
      linkedin: "https://www.linkedin.com/in/jo%C3%A3o-ferreira-9a31222b9/?locale=pt"
    },
    {
      name: "José Ferreira",
      linkedin: "https://www.linkedin.com/in/jos%C3%A9-pedro-marques-ferreira-915bba392?trk=blended-typeahead"
    },
    {
      name: "João Marques",
      linkedin: "https://www.linkedin.com/in/joaopmmarques1"
    }
  ];

  return (
    <section id="team" className="bg-white p-[30px] mb-[30px] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-6">Equipa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member, index) => (
          <a 
            key={index} 
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-[#eef3f8] p-6 rounded-lg hover:bg-[#e2eaf4] hover:scale-[1.01] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 border border-gray-200 cursor-pointer no-underline"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#4fc3f7]/10 group-hover:bg-[#0077b5]/10 p-3 rounded-full transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4fc3f7] group-hover:text-[#0077b5] transition-colors duration-300">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-[#1c2a39] text-lg font-semibold m-0 transition-colors duration-300 group-hover:text-[#0077b5]">
                {member.name}
              </h3>
            </div>
            <div className="text-gray-400 group-hover:text-[#0077b5] group-hover:translate-x-1 transition-all duration-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}