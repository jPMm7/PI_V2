import Header from './components/Header';
import Navbar from './components/Navbar';
import About from './components/About';
import ToolDemo from './components/ToolDemo';
import Objectives from './components/Objectives';
import Team from './components/Team';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      
      {/* Este main atua como a classe .container original */}
      <main className="max-w-[1100px] mx-auto px-5 py-10">
        <About />
        <Objectives />
        <ToolDemo />
        <Team />

        
      </main>
      <Footer />
    </div>
  );
}

export default App;