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
import CompensatoryPanel from './components/CompensatoryPanel';

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

  const [focusedPair, setFocusedPair] = useState(null);

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
          
          {/* LADO ESQUERDO: Alinhamentos + Painel de Interações (Agrupados!) */}
          {/* O "gap-3" controla o espaçamento entre a janela de cima e a de baixo. Podes mudar para gap-2 ou gap-4! */}
          <div className="md:col-span-2 xl:col-span-8 order-1 xl:order-1 flex flex-col gap-1">
            
            <ToolDemo 
              onAnalysisComplete={setAnalysisState} 
              selectedGridIndex={selectedGridIndex}
              onResidueSelect={(idx) => {
                setSelectedGridIndex(idx);
                setFocusedPair(null); // Limpa a tabela se clicares na grelha
              }}
              setActiveCompSpecies={setActiveCompSpecies}
            />

            <CompensatoryPanel 
              compensatoryPairs={compensatoryPairs} 
              focusedPair={focusedPair}                   
              setFocusedPair={setFocusedPair}             
              onResidueSelect={setSelectedGridIndex}      
            />

          </div>

          {/* LADO DIREITO: Visualizadores 3D */}
          <div className="md:col-span-2 xl:col-span-4 xl:row-span-2 order-2 xl:order-2 xl:sticky xl:top-24 z-30 relative">
            <ProteinViewer 
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