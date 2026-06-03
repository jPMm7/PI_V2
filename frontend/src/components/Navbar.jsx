import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, signOut } = useAuth(); // Importa o utilizador e a função de logout do nosso Contexto
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navItems = [
    { label: 'Projeto', id: 'about' },
    { label: 'Objetivos', id: 'objectives' },
    { label: 'Metodologia', id: 'method' },
    { label: 'Ferramenta', id: 'tool' },
    { label: 'Equipa', id: 'team' },
    { label: 'Contacto', id: 'contact' }
  ];

  return (
    <>
      <nav className="bg-[#1c2a39] p-4 text-center sticky top-0 z-50 shadow-md flex justify-between items-center px-8">
        
        {/* Espaço vazio à esquerda para equilibrar o layout ou colocar um logotipo */}
        <div className="w-[120px] hidden md:block"></div>
        
        {/* Links Centrais */}
        <div className="flex justify-center gap-4 sm:gap-8 flex-wrap flex-1">
          {navItems.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className="text-gray-300 font-semibold hover:text-white transition-colors decoration-transparent text-sm"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Módulo de Autenticação à Direita */}
        <div className="flex items-center justify-end w-auto md:w-[200px]">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Mostra um pequeno avatar e o início do email */}
              <div className="flex items-center gap-2 bg-[#15202b] px-3 py-1.5 rounded-full border border-gray-700 cursor-default">
                <div className="w-5 h-5 rounded-full bg-[#2c5364] flex items-center justify-center text-white text-[10px] font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-300 text-xs font-semibold max-w-[80px] truncate" title={user.email}>
                  {user.email.split('@')[0]}
                </span>
              </div>
              
              {/* Botão de Sair (Logout) */}
              <button 
                onClick={signOut}
                className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Terminar Sessão"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-[#2c5364] hover:bg-[#3a6b82] text-white px-4 py-1.5 rounded-full font-semibold text-sm transition-colors cursor-pointer shadow-sm border border-[#48829c]"
            >
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* Renderiza a janela invisível no topo da árvore HTML */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}