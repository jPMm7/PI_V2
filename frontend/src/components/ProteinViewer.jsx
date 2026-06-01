import { useEffect, useRef, useState } from 'react';

const HUMAN_FALLBACK = {
  "BRCA1": "4IGK", "BRCA2": "1IYJ", "EGFR": "1M14", "PTEN": "1D5R", "APOE": "1LE4", "APP": "1MWP", 
  "SNCA": "1X6B", "HTT": "6EZV", "CFTR": "5UAK", "TNF": "1TNF", "IL6": "1ALU", "VEGFA": "1VPF"
};



export default function ProteinViewer({ analysisState }) {
  const { gene, refSpecies, compSpeciesList, refSequence, compSequences } = analysisState;

  // Estado que controla qual dos animais da lista está ativamente visível no 3D da direita
  const [activeCompSpecies, setActiveCompSpecies] = useState(compSpeciesList ? compSpeciesList[0] : 'felis_catus');

  const viewerLeftRef = useRef(null);
  const viewerRightRef = useRef(null);
  const instLeft = useRef(null);
  const instRight = useRef(null);

  const [loadingLeft, setLoadingLeft] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [labelLeft, setLabelLeft] = useState('');
  const [labelRight, setLabelRight] = useState('');

  const [proteinStyle, setProteinStyle] = useState('cartoon');
  const [proteinColor, setProteinColor] = useState('spectrum');
  const [isSpinning, setIsSpinning] = useState(false);


  // 1. INICIALIZAÇÃO DO MOTOR WEBGL (Este bloco tinha desaparecido!)
  useEffect(() => {
    if (!window.$3Dmol) return;
    if (viewerLeftRef.current && !instLeft.current) {
      instLeft.current = window.$3Dmol.createViewer(viewerLeftRef.current, { backgroundColor: '#1c2a39' });
    }
    if (viewerRightRef.current && !instRight.current) {
      instRight.current = window.$3Dmol.createViewer(viewerRightRef.current, { backgroundColor: '#1c2a39' });
    }
    return () => {
      if (instLeft.current) instLeft.current.removeAllModels();
      if (instRight.current) instRight.current.removeAllModels();
    };
  }, []);

  const applyStyles = (viewer, isLeft) => {
    if (!viewer) return;

    if (proteinColor === 'mutations' && refSequence && compSequences?.[activeCompSpecies]) {
      const activeSequence = compSequences[activeCompSpecies];
      
      // 1. ALGORITMO DE JANELA DESLIZANTE ILIMITADO
      let bestOffset = 0;
      let maxMatches = 0;
      const range = Math.max(refSequence.length, activeSequence.length);
      
      for (let offset = -range; offset <= range; offset++) {
        let matches = 0;
        for (let i = 0; i < refSequence.length; i++) {
          const compChar = activeSequence[i + offset];
          if (compChar && refSequence[i] === compChar) {
            matches++;
          }
        }
        if (matches > maxMatches) {
          maxMatches = matches;
          bestOffset = offset;
        }
      }

      // 2. SEGURANÇA BIOINFORMÁTICA
      const identity = maxMatches / Math.min(refSequence.length, activeSequence.length);
      
      // Pintar o esqueleto base de branco puro
      const baseStyle = {};
      baseStyle[proteinStyle] = { color: '#ffffff' };
      viewer.setStyle({ resn: "HOH", invert: true }, baseStyle);

      // Se a identidade for decente (> 20%), mapeamos as mutações
      if (identity > 0.20) {
        const targetMutations = [];

        for (let i = 0; i < refSequence.length; i++) {
          const compIdx = i + bestOffset;
          const compChar = activeSequence[compIdx];
          
          // Se as letras forem diferentes na posição de encaixe (mutação real)
          if (compChar && refSequence[i] !== compChar) {
            if (isLeft) {
              targetMutations.push(i + 1); // Coordenadas PDB do Humano
            } else {
              targetMutations.push(compIdx + 1); // Coordenadas PDB do Animal (Fragmento)
            }
          }
        }

        // CORREÇÃO CRÍTICA: Aplica vermelho APENAS aos resíduos alvo (sem o invert: true)
        if (targetMutations.length > 0) {
          const mutationStyle = {};
          mutationStyle[proteinStyle] = { color: '#ef4444' };
          viewer.setStyle({ resi: targetMutations }, mutationStyle);
        }
      } else {
        console.warn(`Fragmento incompatível detetado para ${activeCompSpecies}. Evitando marcação mutacional excessiva.`);
      }

    } else {
      // Esquemas de cores Standard
      const styleConfig = {};
      styleConfig[proteinStyle] = { color: proteinColor === 'mutations' ? 'spectrum' : proteinColor };
      viewer.setStyle({ resn: "HOH", invert: true }, styleConfig);
    }

    viewer.spin(isSpinning);
    viewer.render();
  };

  // Este useEffect garante que sempre que mudares de animal, de estilo ou as sequências atualizarem, os visualizadores são repintados
  useEffect(() => {
    applyStyles(instLeft.current, true);  // true = Ecrã Esquerdo (Humano)
    applyStyles(instRight.current, false); // false = Ecrã Direito (Animal)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proteinStyle, proteinColor, isSpinning, refSequence, compSequences, activeCompSpecies, loadingLeft, loadingRight]);

  // Força o ecrã direito a fazer reset e selecionar o 1º animal da lista sempre que a pesquisa principal no ToolDemo mudar
  useEffect(() => {
    if (compSpeciesList && compSpeciesList.length > 0) {
      if (!compSpeciesList.includes(activeCompSpecies)) {
        setActiveCompSpecies(compSpeciesList[0]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compSpeciesList]);

  const loadStructure = async (targetGene, targetSpeciesId, viewer, setLabel, setLoading, isLeft) => {
    if (!viewer) return;
    setLoading(true);

    try {
      const speciesName = targetSpeciesId.replace(/_/g, ' ');
      setLabel(`A mapear no UniProt...`);
      
      const uniprotUrl = `https://rest.uniprot.org/uniprotkb/search?query=(gene:${targetGene})+AND+(organism_name:"${speciesName}")&size=1&format=json`;
      const uniprotRes = await fetch(uniprotUrl);
      
      if (!uniprotRes.ok) throw new Error("Falha na API");
      const uniprotJson = await uniprotRes.json();

      if (!uniprotJson.results || uniprotJson.results.length === 0) throw new Error(`Sem registo`);
      const accession = uniprotJson.results[0].primaryAccession;

      setLabel(`A contactar AlphaFold...`);
      const afRes = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${accession}`);
      if (!afRes.ok) throw new Error("Sem IA AlphaFold.");
      
      const afJson = await afRes.json();
      if (!afJson || afJson.length === 0) throw new Error("PDB não gerado.");
      
      const modelUrl = afJson[0].pdbUrl;
      const sourceName = `AlphaFold: ${accession} (IA)`;

      setLabel(`A renderizar...`);
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error("Ficheiro inacessível");
      const pdbText = await response.text();

      viewer.clear();
      viewer.addModel(pdbText, "pdb", { keepH: false });
      
      applyStyles(viewer, isLeft); // <-- Agora sabe se é Humano ou Animal!
      viewer.zoomTo();
      setLabel(sourceName);

    } catch (err) {
      setLabel("MANUAL_UPLOAD");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gene && refSpecies) loadStructure(gene, refSpecies, instLeft.current, setLabelLeft, setLoadingLeft, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gene, refSpecies]);

  useEffect(() => {
    if (gene && activeCompSpecies) loadStructure(gene, activeCompSpecies, instRight.current, setLabelRight, setLoadingRight, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gene, activeCompSpecies]);


  const handleManualUpload = (e, viewer, setLabel) => {
    const file = e.target.files[0];
    if (!file || !viewer) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      viewer.clear();
      viewer.addModel(event.target.result, "pdb", { keepH: false });
      const styleConfig = {};
      styleConfig[proteinStyle] = { color: proteinColor };
      viewer.setStyle({ resn: "HOH", invert: true }, styleConfig);
      viewer.zoomTo();
      viewer.render();
      setLabel(`Ficheiro Local: ${file.name}`);
    };
    reader.readAsText(file);
  };

  return (
    <section id="3d-viewer" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-2">Análise Estrutural Comparativa</h2>
      <p className="mb-6 text-gray-700">Compara fisicamente o impacto das variações peptídicas lado a lado.</p>
      
      <div className="bg-[#eef3f8] p-6 rounded-lg border border-gray-200 mb-6 flex flex-col md:flex-row gap-6 items-end justify-between">
        <div className="flex-1 w-full flex items-center justify-center text-[#2c5364] font-bold text-lg bg-white border border-gray-300 rounded-md py-2 shadow-sm">
          🧬 Gene Ativo: {gene}
        </div>
        <div>
          <label className="block font-semibold text-[#1c2a39] mb-2 text-sm">Estilo Visual</label>
          <select value={proteinStyle} onChange={(e) => setProteinStyle(e.target.value)} className="w-full bg-white border border-gray-300 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5364]">
            <option value="cartoon">Cartoon (Fitas)</option>
            <option value="stick">Stick (Ligações)</option>
            <option value="sphere">Sphere (Átomos 3D)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-[#1c2a39] mb-2 text-sm">Esquema de Cor</label>
          <select value={proteinColor} onChange={(e) => setProteinColor(e.target.value)} className="w-full bg-white border border-gray-300 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5364]">
          <option value="spectrum">Arco-íris (Spectrum)</option>
          <option value="mutations">Diferenças Mutacionais (Vermelho)</option> {/* <-- NOVA OPÇÃO */}
          <option value="#00ff00">Verde Néon</option>
          <option value="#ffffff">Branco Puro</option>
        </select>
        </div>
        <div className="w-full md:w-auto">
          <button onClick={() => setIsSpinning(!isSpinning)} className={`w-full py-2 px-6 rounded-md font-semibold transition-colors ${isSpinning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#2c5364] hover:bg-[#1c2a39] text-white'}`}>
            {isSpinning ? 'Parar ⏹' : 'Animar ⟳'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* REFERÊNCIA HUMANA (ESQUERDA) */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#1c2a39] text-white px-4 py-2 rounded-t-lg font-bold flex justify-between items-center border-b-4 border-blue-500">
            <span>{refSpecies ? refSpecies.replace(/_/g, ' ').toUpperCase() : 'REFERÊNCIA'}</span>
            <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-blue-300">{labelLeft || 'A PROCESSAR'}</span>
          </div>
          <div className="relative w-full h-[400px] rounded-b-lg overflow-hidden border-2 border-gray-200">
            {loadingLeft && (
              <div className="absolute inset-0 bg-[#1c2a39] flex flex-col items-center justify-center text-white z-10">
                <div className="animate-spin text-blue-500 text-3xl mb-2">⚙</div>
                <span className="text-xs font-mono animate-pulse">{labelLeft || 'A calcular...'}</span>
              </div>
            )}
            <div ref={viewerLeftRef} className="w-full h-full bg-[#1c2a39]"></div>
          </div>
        </div>

        {/* ECRÃ DINÂMICO MULTI-ESPÉCIE (DIREITA) */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#1c2a39] text-white px-4 py-[5px] rounded-t-lg font-bold flex justify-between items-center border-b-4 border-green-500">
            {/* O NOVO DROPDOWN NO TOPO DA JANELA 3D */}
            <select 
              value={activeCompSpecies} 
              onChange={(e) => setActiveCompSpecies(e.target.value)}
              className="bg-[#2c5364] text-white text-sm font-bold border-none outline-none cursor-pointer py-1 px-2 rounded hover:bg-[#3a6b82] transition-colors uppercase"
            >
              {compSpeciesList && compSpeciesList.map(speciesId => (
                <option key={`3d-comp-${speciesId}`} value={speciesId}>
                  {speciesId.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-green-300">{labelRight || 'A PROCESSAR'}</span>
          </div>
          <div className="relative w-full h-[400px] rounded-b-lg overflow-hidden border-2 border-gray-200">
            {loadingRight && (
              <div className="absolute inset-0 bg-[#1c2a39] flex flex-col items-center justify-center text-white z-10">
                <div className="animate-spin text-green-500 text-3xl mb-2">⚙</div>
                <span className="text-xs font-mono animate-pulse">{labelRight || 'A calcular...'}</span>
              </div>
            )}
            <div ref={viewerRightRef} className="w-full h-full bg-[#1c2a39]"></div>
          </div>
        </div>

      </div>
    </section>
  );
}