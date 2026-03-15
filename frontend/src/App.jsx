import './App.css';
import ToolDemo from './components/ToolDemo';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Plataforma de Interações Compensatórias 🧬</h1>
      <p>O React está vivo e a funcionar!</p>
      <hr />
      {/* Aqui estamos a chamar o componente que já criaste */}
      <ToolDemo /> 
    </div>
  );
}

export default App;