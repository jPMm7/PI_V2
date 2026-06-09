import React, { useState, useMemo } from 'react';

export default function CompensatoryPanel({ compensatoryPairs, focusedPair, setFocusedPair, onResidueSelect, isToolMode }) {
  // 1. ESTADOS
  const [sortConfig, setSortConfig] = useState({ key: 'dist', direction: 'asc' });
  const [unit, setUnit] = useState('A'); // Unidades possíveis: 'A', 'nm', 'pm'

  // 2. CÉREBRO DE ORDENAÇÃO
  const sortedPairs = useMemo(() => {
    if (!compensatoryPairs) return [];
    let sortableItems = [...compensatoryPairs];
    
    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'nivel') {
         aValue = parseFloat(a.dist);
         bValue = parseFloat(b.dist);
      } else {
         aValue = parseFloat(aValue);
         bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sortableItems;
  }, [compensatoryPairs, sortConfig]);

  // 3. FUNÇÕES INTERATIVAS
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 4. CONVERSOR MATEMÁTICO DE UNIDADES EM TEMPO REAL
  const formatDist = (valInA) => {
    const val = parseFloat(valInA);
    if (unit === 'nm') return (val / 10).toFixed(2);  // 10 Å = 1.00 nm
    if (unit === 'pm') return (val * 100).toFixed(0); // 1 Å = 100 pm
    return val.toFixed(1);                            // Angstrom original
  };

  const unitSymbol = unit === 'nm' ? 'nm' : unit === 'pm' ? 'pm' : 'Å';

  // 5. COMPONENTES VISUAIS AUXILIARES
  const SortArrows = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    const isAsc = isActive && sortConfig.direction === 'asc';
    const isDesc = isActive && sortConfig.direction === 'desc';
    
    return (
      <div className="inline-flex flex-col items-center justify-center ml-2 align-middle">
        <svg width="12" height="8" viewBox="0 0 10 6" className={`mb-[2px] transition-colors ${isAsc ? 'fill-[#4fc3f7]' : 'fill-gray-600 group-hover:fill-gray-400'}`}>
          <polygon points="5,0 10,6 0,6" />
        </svg>
        <svg width="12" height="8" viewBox="0 0 10 6" className={`transition-colors ${isDesc ? 'fill-[#4fc3f7]' : 'fill-gray-600 group-hover:fill-gray-400'}`}>
          <polygon points="5,6 0,0 10,0" />
        </svg>
      </div>
    );
  };

  if (!compensatoryPairs || compensatoryPairs.length === 0) return null;

  return (
    <section className={`flex flex-col relative animate-fade-in overflow-hidden ${isToolMode ? 'h-full max-h-none mb-0 bg-transparent rounded-none border-none' : 'bg-[#1c2a39] rounded-[10px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-gray-700/50 max-h-[400px] mb-8'}`}>              
      {/* CABEÇALHO COM O NOVO SELETOR DE UNIDADES */}
      <div className={`p-4 border-b border-gray-700/50 relative z-10 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isToolMode ? 'bg-[#15202b]' : 'bg-[#1c2a39]'}`}>
        <div>
          <h3 className="text-white text-base font-bold mb-1 flex items-center gap-2 m-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            Relatório de Interações Compensatórias ({compensatoryPairs.length})
          </h3>
          <p className="text-gray-400 text-xs m-0 max-w-2xl">
            Mutações com proximidade espacial crítica (≤ 6.5Å). A segunda mutação pode ter ocorrido evolutivamente para compensar a desestabilização da primeira.
          </p>
        </div>

        {/* ---> NOVO: SELETOR DE UNIDADES <--- */}
        <div className="flex items-center gap-2 shrink-0 bg-[#15202b] p-1.5 rounded-lg border border-gray-700 shadow-inner">
          <label className="text-[10px] uppercase font-bold text-gray-400 pl-2">Escala:</label>
          <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value)}
            className="bg-[#1c2a39] text-white text-xs font-bold border border-gray-600 rounded px-2 py-1 outline-none cursor-pointer hover:border-[#4fc3f7] transition-colors"
          >
            <option value="A">Angstroms (Å)</option>
            <option value="nm">Nanómetros (nm)</option>
            <option value="pm">Picómetros (pm)</option>
          </select>
        </div>
      </div>

      {/* TABELA DE DADOS INTERATIVA */}
      <div className="overflow-y-auto custom-scrollbar relative z-10 h-full">
        <table className="w-full text-left text-sm text-gray-300 border-collapse">
          <thead className="text-sm text-gray-400 uppercase bg-[#15202b] sticky top-0 z-20 shadow-sm">
            <tr>
              <th onClick={() => requestSort('resi1')} className="px-6 py-4 font-bold border-b border-gray-700/50 cursor-pointer hover:bg-[#1c2a39] hover:text-gray-200 transition-colors group select-none">
                Mutação 1 <SortArrows columnKey="resi1" />
              </th>
              <th onClick={() => requestSort('resi2')} className="px-6 py-4 font-bold border-b border-gray-700/50 cursor-pointer hover:bg-[#1c2a39] hover:text-gray-200 transition-colors group select-none">
                Mutação 2 <SortArrows columnKey="resi2" />
              </th>
              <th onClick={() => requestSort('dist')} className="px-6 py-4 font-bold text-center border-b border-gray-700/50 cursor-pointer hover:bg-[#1c2a39] hover:text-gray-200 transition-colors group select-none">
                {/* O título da tabela atualiza automaticamente o símbolo! */}
                Distância 3D ({unitSymbol}) <SortArrows columnKey="dist" />
              </th>
              <th onClick={() => requestSort('nivel')} className="px-6 py-4 font-bold text-center border-b border-gray-700/50 cursor-pointer hover:bg-[#1c2a39] hover:text-gray-200 transition-colors group select-none">
                Potencial de Interação <SortArrows columnKey="nivel" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPairs.map((pair, idx) => {
              // A classificação é SEMPRE feita com base nos Angstroms reais para não haver falhas matemáticas
              const distOriginalEmA = parseFloat(pair.dist);
              let nivel = "Forte";
              let color = "text-orange-400 bg-orange-900/20 border-orange-800/30";
              
              if (distOriginalEmA > 4.5) {
                nivel = "Moderada";
                color = "text-blue-400 bg-blue-900/20 border-blue-800/30";
              }
              
              const isFocused = focusedPair && focusedPair.resi1 === pair.resi1 && focusedPair.resi2 === pair.resi2;

              return (
                <tr 
                  key={idx} 
                  onClick={() => {
                    if (onResidueSelect) onResidueSelect(null); // Limpa as esferas do 3D
                    if (setFocusedPair) setFocusedPair(pair);   // Ativa o Voo Duplo!
                  }}
                  className={`border-b border-gray-700/30 transition-colors cursor-pointer group ${isFocused ? 'bg-[#2c5364] shadow-inner border-l-4 border-l-[#4fc3f7]' : 'bg-[#1c2a39] hover:bg-[#233547]'}`}
                >
                  <td className="px-6 py-3 font-mono font-bold text-gray-200">
                    Posição <span className="text-blue-300">{pair.resi1}</span>
                  </td>
                  <td className="px-6 py-3 font-mono font-bold text-gray-200">
                    Posição <span className="text-green-300">{pair.resi2}</span>
                  </td>
                  <td className="px-6 py-3 font-mono font-bold text-center text-white">
                    {/* Exibe o número convertido em tempo real! */}
                    {formatDist(pair.dist)} {unitSymbol}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border tracking-wider shadow-sm ${color}`}>
                      {nivel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="h-2 bg-[#1c2a39]"></div>
      </div>

    </section>
  );
}