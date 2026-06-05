import { useState } from 'react';
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

function App() {
  const [analysisState, setAnalysisState] = useState({
    gene: 'TP53',
    refSpecies: 'homo_sapiens',
    compSpeciesList: ['felis_catus', 'pan_troglodytes']
  });

  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  const [activeCompSpecies, setActiveCompSpecies] = useState('felis_catus');
  
  // O estado das Mutações Compensatórias vive aqui no "Cérebro" principal da App!
  const [compensatoryPairs, setCompensatoryPairs] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar />
      
      {/* TEXTOS INTRODUTÓRIOS (Mantêm largura ideal para leitura) */}
      <div className="max-w-[1100px] mx-auto px-5 pt-10">
        <About />
        <Objectives />
        <Methodology />
      </div>

      {/* DASHBOARD DA FERRAMENTA (Design Assimétrico 70% / 30%) */}
      <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-8 items-start">
          
          {/* CANTO SUPERIOR ESQUERDO: Alignment Options (Ocupa 8 colunas em 12 = ~67%) */}
          <div className="md:col-span-2 xl:col-span-8 order-1">
            <ToolDemo 
              onAnalysisComplete={setAnalysisState} 
              selectedGridIndex={selectedGridIndex}
              onResidueSelect={setSelectedGridIndex}
              setActiveCompSpecies={setActiveCompSpecies}
            />
          </div>

          {/* CANTO DIREITO: Visualizadores 3D (Ocupa 4 colunas em 12 = ~33%) */}
          {/* Fica Sticky para te acompanhar enquanto lês as mutações na esquerda! */}
          <div className="md:col-span-2 xl:col-span-4 xl:row-span-2 order-2 xl:order-2 sticky top-24 z-30">
            <ProteinViewer 
              analysisState={analysisState} 
              selectedGridIndex={selectedGridIndex}
              onResidueSelect={setSelectedGridIndex}
              activeCompSpecies={activeCompSpecies}       
              setActiveCompSpecies={setActiveCompSpecies} 
              compensatoryPairs={compensatoryPairs}   
              setCompensatoryPairs={setCompensatoryPairs} 
            /> 
          </div>

          {/* CANTO INFERIOR ESQUERDO: Distance Tab (Painel de Mutações) */}
          <div className="md:col-span-2 xl:col-span-8 order-3 xl:order-3">
            {compensatoryPairs.length > 0 && (
              <section className="bg-[#1c2a39] flex flex-col rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] border-t-4 border-yellow-500 mb-8 relative overflow-hidden animate-fade-in max-h-[350px]">
                
                {/* Efeito Visual Cyberpunk no fundo (agora mais subtil) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>
                
                {/* CABEÇALHO FIXO DO PAINEL */}
                <div className="p-4 border-b border-gray-700/50 relative z-10 shrink-0 bg-[#1c2a39]">
                  <h3 className="text-yellow-400 text-base font-bold mb-1 flex items-center gap-8 m-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                    Interações Compensatórias ({compensatoryPairs.length})
                  </h3>
                  <p className="text-gray-400 text-xs m-0 max-w-4xl">
                    Mutações com proximidade espacial crítica (≤ 6.5Å). A segunda mutação pode ter ocorrido para compensar a desestabilização da primeira.
                  </p>
                </div>

                {/* ÁREA COM SCROLL INTERNO PARA AS MUTAÇÕES */}
                <div className="p-4 overflow-y-auto custom-scrollbar relative z-10 h-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
                    {compensatoryPairs.map((pair, idx) => (
                      <div key={idx} className="bg-[#15202b] border border-gray-700/80 rounded-lg p-2.5 flex flex-col items-center justify-center gap-2 hover:border-yellow-500/60 hover:shadow-[0_0_10px_rgba(234,179,8,0.15)] transition-all cursor-crosshair group" title={`Distância exata: ${pair.dist} Angstroms`}>
                        <div className="flex items-center gap-2 text-white font-mono text-[11px] sm:text-xs">
                          <span className="font-bold text-blue-400 group-hover:scale-110 transition-transform">Pos {pair.resi1}</span>
                          <span className="text-gray-600">↔</span>
                          <span className="font-bold text-green-400 group-hover:scale-110 transition-transform">Pos {pair.resi2}</span>
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-[10px] font-bold border border-yellow-500/20 w-full text-center tracking-widest shadow-inner">
                          {pair.dist}Å
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>
            )}
          </div>

        </div>
      </main>

      {/* RODAPÉ E EQUIPA */}
      <div className="max-w-[1100px] mx-auto px-5 pb-10">
        <Team />
        <Contact />
      </div>
      
      <Footer />
    </div>
  );
}

export default App;