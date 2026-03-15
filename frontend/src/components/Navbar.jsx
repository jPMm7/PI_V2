export default function Navbar() {
  const links = ['Projeto', 'Objetivos', 'Metodologia', 'Ferramenta', 'Equipa', 'Contacto'];

  return (
    <nav className="bg-[#1c2a39] p-4 text-center sticky top-0 z-50 shadow-md">
      <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
        {links.map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="text-white font-semibold hover:text-[#6ec1ff] transition-colors decoration-transparent"
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}