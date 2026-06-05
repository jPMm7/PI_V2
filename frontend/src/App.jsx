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

  // NOVO: Estado que guarda o índice exato (0, 1, 2...) em que o utilizador clicou
  const [selectedGridIndex, setSelectedGridIndex] = useState(null);

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      
      <main className="max-w-[1100px] mx-auto px-5 py-10">
        <About />
        <Objectives />
        <Methodology />
        
        {/* Passamos o estado e a função de atualizar para ambos os componentes! */}
        <ToolDemo 
          onAnalysisComplete={setAnalysisState} 
          selectedGridIndex={selectedGridIndex}
          onResidueSelect={setSelectedGridIndex}
        />
        
        <ProteinViewer 
          analysisState={analysisState} 
          selectedGridIndex={selectedGridIndex}
          onResidueSelect={setSelectedGridIndex}
        /> 
        
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;