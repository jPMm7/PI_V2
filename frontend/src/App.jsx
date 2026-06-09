import { useState, useEffect, useRef } from 'react'; // <-- Adiciona o useRef aqui!

import Header from './components/Header';
import Navbar from './components/Navbar';
import About from './components/About';
import ToolDemo from './components/ToolDemo';
import Objectives from './components/Objectives';
import Team from './components/Team';
import Footer from './components/Footer';
import Contact from './components/Contact';
import Methodology from './components/Methodology';
import ProteinViewer from './components/ProteinViewer';
import CompensatoryPanel from './components/CompensatoryPanel';

function App() {
  const [analysisState, setAnalysisState] = useState({
    gene: 'TP53',
    refSpecies: 'homo_sapiens',
    compSpeciesList: ['felis_catus', 'pan_troglodytes']
  });

  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  const [activeCompSpecies, setActiveCompSpecies] = useState('felis_catus');
  const [compensatoryPairs, setCompensatoryPairs] = useState([]);
  const [focusedPair, setFocusedPair] = useState(null);

  //Controla se estamos no Modo Site ou Modo Workspace
  const [isToolMode, setIsToolMode] = useState(false);

  //MOTOR DE REDIMENSIONAMENTO tipo VS CODE
  const [isDragging, setIsDragging] = useState(false);
  const [topPanelHeight, setTopPanelHeight] = useState(60); // Começa com 60% para cima, 40% para baixo
  const leftColumnRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !leftColumnRef.current) return;
      
      const containerRect = leftColumnRef.current.getBoundingClientRect();
      // Calcula a posição do rato em percentagem relativa à altura da coluna esquerda
      let newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      
      // Limites de segurança (para não esmagar completamente nenhuma das janelas, entre 20% e 80%)
      if (newHeight < 20) newHeight = 20;
      if (newHeight > 80) newHeight = 80;
      
      setTopPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Evita selecionar texto enquanto arrastas
      document.body.style.cursor = 'row-resize'; // Tranca o cursor do rato!
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  // Efeito para avisar o motor 3D que a janela mudou de tamanho (evita proteínas esmagadas)
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    return () => clearTimeout(timer);
  }, [isToolMode]);

  return (
    // Se isToolMode for true, o ecrã fica bloqueado (h-screen, overflow-hidden) e fundo muito escuro
    <div className={`transition-colors duration-500 ${isToolMode ? "h-screen w-screen overflow-hidden bg-[#0f172a] flex flex-col" : "min-h-screen bg-gray-50"}`}>
      
      {/* TEXTOS E CABEÇALHO (Escondidos no Modo Workspace usando a classe 'hidden') */}
      <div className={isToolMode ? "hidden" : "block"}>
        <Header />
        <Navbar />
         <div className="max-w-[1100px] mx-auto px-5 pt-10">
          <About />
          <Objectives />
          <Methodology />
        </div>
      </div>

      {/* BOTÃO MÁGICO DE ALTERNAR MODO */}
      <div className={`w-full flex justify-end shrink-0 z-40 transition-all ${isToolMode ? 'bg-[#1e293b] p-3 border-b border-gray-800 shadow-md' : 'max-w-[1800px] mx-auto px-6 pt-6'}`}>
        <button
          onClick={() => {
            window.scrollTo(0, 0); // Sobe a página antes de bloquear
            setIsToolMode(!isToolMode);
          }}
          className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer ${isToolMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/50' : 'bg-[#1c2a39] text-[#4fc3f7] hover:bg-[#2c5364] hover:text-white border border-[#4fc3f7]/50'}`}
        >
          {isToolMode ? '✕ Sair do Modo Workspace' : '⛶ Modo Workspace (IDE)'}
        </button>
      </div>

      {/* DASHBOARD DA FERRAMENTA */}
      <main className={isToolMode ? "flex-1 min-h-0 w-full p-4" : "w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-8"}>
        
        {/* A MUDANÇA DE LAYOUT: De Grid para Flexbox lado-a-lado */}
        <div className={`items-start ${isToolMode ? 'flex flex-row h-full w-full gap-4' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-8'}`}>
          
          {/* LADO ESQUERDO: Alinhamentos + Painel de Interações (Sólido e Unificado) */}
          <div 
            ref={leftColumnRef} 
            className={isToolMode ? "w-[60%] 2xl:w-[65%] flex flex-col h-full min-h-0 bg-[#15202b] rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden relative" : "md:col-span-2 xl:col-span-8 order-1 xl:order-1 flex flex-col gap-3"}
          >
            
            {/* PAINEL DE CIMA (Alinhamentos - Agora s/ margens no fundo!) */}
            <div 
              className={isToolMode ? "overflow-y-auto custom-scrollbar flex flex-col" : ""}
              style={isToolMode ? { height: `${topPanelHeight}%` } : {}}
            >
              <ToolDemo 
                isToolMode={isToolMode} // <-- AVISAMOS O COMPONENTE QUE ESTAMOS EM IDE MODE
                onAnalysisComplete={setAnalysisState} 
                selectedGridIndex={selectedGridIndex}
                onResidueSelect={(idx) => {
                  setSelectedGridIndex(idx);
                  setFocusedPair(null);
                }}
                setActiveCompSpecies={setActiveCompSpecies}
              />
            </div>

            {/* O NOVO "PUXADOR" ESTILO VS CODE (Linha fina de 1px) */}
            {isToolMode && (
              <div 
                className="relative z-20 cursor-row-resize flex items-center justify-center bg-gray-700 hover:bg-[#4fc3f7] transition-colors"
                style={{ height: '1px' }}
                onMouseDown={() => setIsDragging(true)}
                title="Arrastar para redimensionar"
              >
                {/* Zona de "hit" invisível mais larga para o rato agarrar facilmente */}
                <div className="absolute inset-x-0 -top-2 -bottom-2"></div>
                {/* Efeito Glow quando arrastas */}
                {isDragging && <div className="absolute inset-x-0 h-[1px] bg-[#4fc3f7] shadow-[0_0_8px_rgba(79,195,247,0.8)]"></div>}
              </div>
            )}

            {/* PAINEL DE BAIXO (Tabela de Interações - S/ margens no topo!) */}
            <div 
              className={isToolMode ? "flex flex-col min-h-0" : ""}
              style={isToolMode ? { height: `calc(${100 - topPanelHeight}% - 1px)` } : {}}
            >
              <CompensatoryPanel 
                isToolMode={isToolMode}
                compensatoryPairs={compensatoryPairs} 
                focusedPair={focusedPair}                   
                setFocusedPair={setFocusedPair}             
                onResidueSelect={setSelectedGridIndex}      
              />
            </div>

          </div>

          {/* LADO DIREITO: Visualizadores 3D */}
          <div className={isToolMode ? "w-[40%] 2xl:w-[35%] flex flex-col h-full min-h-0" : "md:col-span-2 xl:col-span-4 xl:row-span-2 order-2 xl:order-2 xl:sticky xl:top-24 z-30 relative"}>
            <ProteinViewer 
              isToolMode={isToolMode} // <-- Passamos a variável para o 3D
              analysisState={analysisState} 
              selectedGridIndex={selectedGridIndex}
              onResidueSelect={setSelectedGridIndex}
              activeCompSpecies={activeCompSpecies}       
              setActiveCompSpecies={setActiveCompSpecies}
              compensatoryPairs={compensatoryPairs}       
              setCompensatoryPairs={setCompensatoryPairs} 
              focusedPair={focusedPair}                   
              setFocusedPair={setFocusedPair}             
            /> 
          </div>

        </div>
      </main>

      {/* RODAPÉ (Escondido no Modo Workspace) */}
      <div className={isToolMode ? "hidden" : "block"}>
        <div className="max-w-[1100px] mx-auto px-5 pb-10">
          <Team />
          <Contact />
        </div>
        <Footer />
      </div>
      
    </div>
  );
}

export default App;