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
  // O ESTADO PARTILHADO AGORA SUPORTA MÚLTIPLAS ESPÉCIES!
  const [analysisState, setAnalysisState] = useState({
    gene: 'TP53',
    refSpecies: 'homo_sapiens',
    compSpeciesList: ['felis_catus', 'pan_troglodytes'] // <-- Agora é um Array!
  });

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      
      <main className="max-w-[1100px] mx-auto px-5 py-10">
        <About />
        <Objectives />
        <Methodology />
        
        <ToolDemo onAnalysisComplete={setAnalysisState} />
        <ProteinViewer analysisState={analysisState} /> 
        
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;