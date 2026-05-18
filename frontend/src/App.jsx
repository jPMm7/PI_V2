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
  // O ESTADO PARTILHADO AGORA GUARDA O PACOTE COMPLETO!
  const [analysisState, setAnalysisState] = useState({
    gene: 'TP53',
    refSpecies: 'homo_sapiens',
    compSpecies: 'felis_catus'
  });

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      
      <main className="max-w-[1100px] mx-auto px-5 py-10">
        <About />
        <Objectives />
        <Methodology />
        
        {/* Quando a pesquisa acaba, a ferramenta avisa o App.jsx */}
        <ToolDemo onAnalysisComplete={setAnalysisState} />
        
        {/* O App.jsx passa a informação toda ao novo Visualizador Duplo */}
        <ProteinViewer analysisState={analysisState} /> 
        
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;