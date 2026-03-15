import Header from './components/Header';
import Navbar from './components/Navbar';
import About from './components/About';
import ToolDemo from './components/ToolDemo';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      
      {/* Este main atua como a classe .container original */}
      <main className="max-w-[1100px] mx-auto px-5 py-10">
        <About />
        <ToolDemo />
      </main>
    </div>
  );
}

export default App;