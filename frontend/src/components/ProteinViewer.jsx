import { useEffect, useRef, useState } from 'react';

export default function ProteinViewer({ analysisState }) {
  const { gene, refSpecies, compSpecies } = analysisState;

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

  // O PIPELINE AGORA É 100% UNIVERSAL PARA TODAS AS ESPÉCIES (INCLUINDO HUMANO)
  const loadStructure = async (targetGene, targetSpeciesId, viewer, setLabel, setLoading) => {
    if (!viewer) return;
    setLoading(true);

    try {
      const speciesName = targetSpeciesId.replace(/_/g, ' ');
      setLabel(`A mapear no UniProt...`);
      
      // Consulta dinâmica ao catálogo global da UniProt para qualquer espécie
      const uniprotUrl = `https://rest.uniprot.org/uniprotkb/search?query=(gene:${targetGene})+AND+(organism_name:"${speciesName}")&size=1&format=json`;
      const uniprotRes = await fetch(uniprotUrl);
      
      if (!uniprotRes.ok) throw new Error("Falha na API do UniProt");
      const uniprotJson = await uniprotRes.json();

      if (!uniprotJson.results || uniprotJson.results.length === 0) {
        throw new Error(`Sem registo para ${targetGene} no organismo ${speciesName}`);
      }
      
      const accession = uniprotJson.results[0].primaryAccession;

      // Consulta dinâmica à API do AlphaFold para obter o modelo preditivo mais recente
      setLabel(`A contactar IA AlphaFold...`);
      const afRes = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${accession}`);
      if (!afRes.ok) throw new Error("Sem IA AlphaFold.");
      
      const afJson = await afRes.json();
      if (!afJson || afJson.length === 0) throw new Error("PDB não gerado.");
      
      const modelUrl = afJson[0].pdbUrl;
      const sourceName = `AlphaFold: ${accession} (IA)`;

      // Descarrega o ficheiro coordenadas e renderiza no respetivo ecrã WebGL
      setLabel(`A renderizar macromolécula...`);
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error("Ficheiro não descarregável");
      const pdbText = await response.text();

      viewer.clear();
      viewer.addModel(pdbText, "pdb", { keepH: false });
      
      const styleConfig = {};
      styleConfig[proteinStyle] = { color: proteinColor };
      viewer.setStyle({ resn: "HOH", invert: true }, styleConfig);
      
      viewer.spin(isSpinning);
      viewer.zoomTo();
      viewer.render();
      setLabel(sourceName);

    } catch (err) {
      console.warn("Estrutura indisponível:", err);
      setLabel("MANUAL_UPLOAD");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gene && refSpecies) loadStructure(gene, refSpecies, instLeft.current, setLabelLeft, setLoadingLeft);
    if (gene && compSpecies) loadStructure(gene, compSpecies, instRight.current, setLabelRight, setLoadingRight);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gene, refSpecies, compSpecies]);

  useEffect(() => {
    const applyStyles = (viewer) => {
      if (!viewer) return;
      const styleConfig = {};
      styleConfig[proteinStyle] = { color: proteinColor };
      viewer.setStyle({ resn: "HOH", invert: true }, styleConfig);
      viewer.spin(isSpinning);
      viewer.render();
    };
    applyStyles(instLeft.current);
    applyStyles(instRight.current);
  }, [proteinStyle, proteinColor, isSpinning]);

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
          <select value={proteinStyle} onChange={(e) => setProteinStyle(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5364]">
            <option value="cartoon">Cartoon (Fitas)</option>
            <option value="stick">Stick (Ligações)</option>
            <option value="sphere">Sphere (Átomos 3D)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-[#1c2a39] mb-2 text-sm">Esquema de Cor</label>
          <select value={proteinColor} onChange={(e) => setProteinColor(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5364]">
            <option value="spectrum">Arco-íris (Spectrum)</option>
            <option value="#00ff00">Verde Néon</option>
            <option value="#ffffff">Branco Puro</option>
          </select>
        </div>
        <div className="w-full md:w-auto">
          <button onClick={() => setIsSpinning(!isSpinning)} className={`w-full py-2 px-6 rounded-md font-semibold transition-colors ${isSpinning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#2c5364] hover:bg-[#1c2a39] text-white'}`}>
            {isSpinning ? 'Parar ⏹' : 'Animar 3D ⟳'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LADO ESQUERDO (HUMANO / REFERÊNCIA) */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#1c2a39] text-white px-4 py-2 rounded-t-lg font-bold flex justify-between items-center border-b-4 border-blue-500">
            <span>{refSpecies.replace(/_/g, ' ').toUpperCase()}</span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-300">
              {labelLeft === 'MANUAL_UPLOAD' ? 'AGUARDAR MODELO' : labelLeft}
            </span>
          </div>
          <div className="relative w-full h-[400px] rounded-b-lg overflow-hidden border-2 border-gray-200">
            {loadingLeft && (
              <div className="absolute inset-0 bg-[#1c2a39] flex flex-col items-center justify-center text-white z-10">
                <div className="animate-spin text-blue-500 text-3xl mb-2">⚙</div>
                <span className="text-xs font-mono animate-pulse">{labelLeft || 'A calcular...'}</span>
              </div>
            )}
            {labelLeft === 'MANUAL_UPLOAD' && (
              <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-700 z-10 p-6 text-center">
                <p className="mb-4 font-bold">Estrutura não mapeada pelo UniProt.</p>
                <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors">
                  Carregar Ficheiro PDB
                  <input type="file" accept=".pdb" className="hidden" onChange={(e) => handleManualUpload(e, instLeft.current, setLabelLeft)} />
                </label>
              </div>
            )}
            <div ref={viewerLeftRef} className="w-full h-full bg-[#1c2a39]"></div>
          </div>
        </div>

        {/* LADO DIREITO (ANIMAL / COMPARAÇÃO) */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#1c2a39] text-white px-4 py-2 rounded-t-lg font-bold flex justify-between items-center border-b-4 border-green-500">
            <span>{compSpecies.replace(/_/g, ' ').toUpperCase()}</span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-green-300">
              {labelRight === 'MANUAL_UPLOAD' ? 'AGUARDAR MODELO' : labelRight}
            </span>
          </div>
          <div className="relative w-full h-[400px] rounded-b-lg overflow-hidden border-2 border-gray-200">
            {loadingRight && (
              <div className="absolute inset-0 bg-[#1c2a39] flex flex-col items-center justify-center text-white z-10">
                <div className="animate-spin text-green-500 text-3xl mb-2">⚙</div>
                <span className="text-xs font-mono animate-pulse">{labelRight || 'A calcular...'}</span>
              </div>
            )}
            {labelRight === 'MANUAL_UPLOAD' && (
              <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-700 z-10 p-6 text-center">
                <p className="mb-4 font-bold">Estrutura não mapeada pelo UniProt.</p>
                <label className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors">
                  Carregar Ficheiro PDB
                  <input type="file" accept=".pdb" className="hidden" onChange={(e) => handleManualUpload(e, instRight.current, setLabelRight)} />
                </label>
              </div>
            )}
            <div ref={viewerRightRef} className="w-full h-full bg-[#1c2a39]"></div>
          </div>
        </div>

      </div>
    </section>
  );
}