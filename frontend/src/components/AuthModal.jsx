import { useState } from 'react';
import { useAuth } from '../context/AuthContext';


export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

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
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-3 text-gray-400 text-xs">OU</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          <button 
            type="button"
            onClick={signInWithGoogle}
            className="w-full bg-white text-gray-800 font-bold py-2.5 rounded-md hover:bg-gray-200 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Entrar com Google
          </button>
          
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