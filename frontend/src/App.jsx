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
  
  // NOVO: A espécie ativa no 3D agora é controlada centralmente aqui!
  const [activeCompSpecies, setActiveCompSpecies] = useState('felis_catus');

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      
      <main className="max-w-[1100px] mx-auto px-5 py-10">
        <About />
        <Objectives />
        <Methodology />
        
        <ToolDemo 
          onAnalysisComplete={setAnalysisState} 
          selectedGridIndex={selectedGridIndex}
          onResidueSelect={setSelectedGridIndex}
          setActiveCompSpecies={setActiveCompSpecies} // <-- Passamos o controlo para a grelha
        />
        
        <ProteinViewer 
          analysisState={analysisState} 
          selectedGridIndex={selectedGridIndex}
          onResidueSelect={setSelectedGridIndex}
          activeCompSpecies={activeCompSpecies}       // <-- Passamos o estado para o 3D
          setActiveCompSpecies={setActiveCompSpecies} // <-- Passamos o controlo para o 3D
        /> 
        
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;