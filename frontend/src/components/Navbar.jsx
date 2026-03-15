export default function Navbar() {
  // Agora mapeamos o texto que aparece no botão para o ID exato da secção
  const navItems = [
    { label: 'Projeto', id: 'about' },
    { label: 'Objetivos', id: 'objectives' },
    { label: 'Metodologia', id: 'method' },
    { label: 'Ferramenta', id: 'tool' },
    { label: 'Equipa', id: 'team' },
    { label: 'Contacto', id: 'contact' }
  ];

  return (
    <nav className="bg-[#1c2a39] p-4 text-center sticky top-0 z-50 shadow-md">
      <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
        {navItems.map((item) => (
          <a 
            key={item.id} 
            href={`#${item.id}`} 
            className="text-white font-semibold hover:text-[#6ec1ff] transition-colors decoration-transparent"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}