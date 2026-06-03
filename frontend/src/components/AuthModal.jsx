import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose(); // Fecha a janela em caso de sucesso
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        // Dica: O Supabase por defeito pede para confirmar o email. 
        // Para testares mais rápido agora, podes desligar isso nas Settings > Auth do Supabase.
        onClose(); 
      }
    } catch (err) {
      setErrorMsg(err.message === 'Invalid login credentials' ? 'Email ou password incorretos.' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000bb] z-[100] flex justify-center items-center backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#1c2a39] border border-gray-600 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden flex flex-col relative">
        
        {/* Botão Fechar no Canto */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="p-8">
          <h3 className="text-white text-2xl font-bold mb-1 text-center">
            {isLogin ? 'Iniciar Sessão' : 'Criar Conta'}
          </h3>
          <p className="text-gray-400 text-xs text-center mb-6">
            Acede ao teu laboratório bioinformático pessoal
          </p>

          {errorMsg && (
            <div className="bg-red-900/40 border border-red-500/50 text-red-300 text-xs p-3 rounded mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#15202b] border border-gray-600 rounded-md p-2.5 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="investigador@feup.pt"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#15202b] border border-gray-600 rounded-md p-2.5 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full bg-[#2c5364] hover:bg-[#3a6b82] text-white font-bold py-2.5 rounded-md transition-colors shadow-lg border border-[#48829c] disabled:opacity-50"
            >
              {isLoading ? 'A processar...' : (isLogin ? 'Entrar' : 'Registar')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              className="text-gray-400 hover:text-blue-400 text-sm transition-colors cursor-pointer"
            >
              {isLogin ? 'Não tens conta? Regista-te' : 'Já tens conta? Inicia sessão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}