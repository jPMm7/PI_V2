import { useEffect, useRef, useState } from 'react';

const HUMAN_FALLBACK = {
  "BRCA1": "4IGK", "BRCA2": "1IYJ", "EGFR": "1M14", "PTEN": "1D5R", "APOE": "1LE4", "APP": "1MWP", 
  "SNCA": "1X6B", "HTT": "6EZV", "CFTR": "5UAK", "TNF": "1TNF", "IL6": "1ALU", "VEGFA": "1VPF",
  "APC": "3NMW" 
};



export default function ProteinViewer({ analysisState, selectedGridIndex, onResidueSelect, activeCompSpecies, setActiveCompSpecies }) {
  const { gene, refSpecies, compSpeciesList, refSequence, compSequences } = analysisState;


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

  const [syncViews, setSyncViews] = useState(false);
  const syncIntervalRef = useRef(null);

  const isZoomingRef = useRef(false); // Sinal para pausar a sincronização durante as viagens

  // NOVO: Memória exata de qual animal está desenhado na janela neste exato milissegundo
  const loadedLeftRef = useRef(null);
  const loadedRightRef = useRef(null);

  const [outOfBoundsLeft, setOutOfBoundsLeft] = useState(false);
  const [outOfBoundsRight, setOutOfBoundsRight] = useState(false);

  useEffect(() => {
    if (!syncViews || !instLeft.current || !instRight.current) {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      return;
    }

    let lastLeftView = instLeft.current.getView();
    let lastRightView = instRight.current.getView();

    // Funções Matemáticas Avançadas para Rotação 3D (Quaternions)
    const invertQuat = (q) => [-q[0], -q[1], -q[2], q[3]];
    const multQuat = (a, b) => [
      a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1], // X
      a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0], // Y
      a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3], // Z
      a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2]  // W
    ];

    // O Motor que calcula as diferenças e as aplica
    const applyRelativeView = (current, last, targetLast) => {
      // 1. Delta de Translação (Arrastar/Pan)
      const dx = current[0] - last[0];
      const dy = current[1] - last[1];
      const dz = current[2] - last[2];
      
      // 2. Delta de Zoom (Escala multiplicativa)
      const zoomRatio = current[3] / (last[3] || 1);

      // 3. Delta de Rotação (Quaternions)
      const qCurrent = [current[4], current[5], current[6], current[7]];
      const qLast = [last[4], last[5], last[6], last[7]];
      const qTargetLast = [targetLast[4], targetLast[5], targetLast[6], targetLast[7]];
      
      const deltaQ = multQuat(qCurrent, invertQuat(qLast));
      const newTargetQ = multQuat(deltaQ, qTargetLast);

      return [
        targetLast[0] + dx,
        targetLast[1] + dy,
        targetLast[2] + dz,
        targetLast[3] * zoomRatio,
        newTargetQ[0], newTargetQ[1], newTargetQ[2], newTargetQ[3]
      ];
    };

    syncIntervalRef.current = setInterval(() => {
      if (!instLeft.current || !instRight.current) return;
      
      const currentLeftView = instLeft.current.getView();
      const currentRightView = instRight.current.getView();

      // MAGIA: SE ESTIVER A VOAR (ZOOM) OU A CARREGAR UMA PROTEÍNA, PAUSA A FÍSICA!
      if (isZoomingRef.current || loadingLeft || loadingRight) {
        lastLeftView = currentLeftView;
        lastRightView = currentRightView;
        return; 
      }

      const leftChanged = JSON.stringify(currentLeftView) !== JSON.stringify(lastLeftView);
      const rightChanged = JSON.stringify(currentRightView) !== JSON.stringify(lastRightView);

      if (leftChanged) {
        const newRightView = applyRelativeView(currentLeftView, lastLeftView, lastRightView);
        instRight.current.setView(newRightView);
        lastLeftView = currentLeftView;
        lastRightView = newRightView;
      } else if (rightChanged) {
        const newLeftView = applyRelativeView(currentRightView, lastRightView, lastLeftView);
        instLeft.current.setView(newLeftView);
        lastRightView = currentRightView;
        lastLeftView = newLeftView;
      }
    }, 30);

    return () => clearInterval(syncIntervalRef.current);
  }, [syncViews]);

  // NOVO: Ref para guardar a última versão das sequências e do foco para evitar colisões
  const latestDataRef = useRef({ refSequence, compSequences, activeCompSpecies, onResidueSelect, selectedGridIndex });
  useEffect(() => {
    latestDataRef.current = { refSequence, compSequences, activeCompSpecies, onResidueSelect, selectedGridIndex };
  }, [refSequence, compSequences, activeCompSpecies, onResidueSelect, selectedGridIndex]);

  // NOVO: Função para descobrir qual a verdadeira posição 3D do animal em relação à grelha
  const getOffset = (refSeq, compSeq) => {
    if (!refSeq || !compSeq) return 0;
    let maxMatches = 0; let bestOffset = 0;
    const range = Math.max(refSeq.length, compSeq.length);
    for (let offset = -range; offset <= range; offset++) {
      let matches = 0;
      for (let i = 0; i < refSeq.length; i++) {
        if (refSeq[i] === compSeq[i + offset]) matches++;
      }
      if (matches > maxMatches) { maxMatches = matches; bestOffset = offset; }
    }
    return bestOffset;
  };

  // NOVO: Efeito que dispara o Zoom e as Etiquetas 3D quando a Grelha muda!
  useEffect(() => {
    if (loadingLeft || loadingRight) return;
    
    // ---> MAGIA SUPREMA AQUI <---
    // Só avança se a janela 3D já tiver MESMO o animal certo desenhado!
    // Isto impede o bug de focar no gato quando a janela ainda tem o gorila.
    if (loadedLeftRef.current !== refSpecies || loadedRightRef.current !== activeCompSpecies) return;

    isZoomingRef.current = true;

    if (selectedGridIndex === null || selectedGridIndex === undefined) {
      instLeft.current?.removeAllLabels();
      instRight.current?.removeAllLabels();
      instLeft.current?.removeAllShapes();
      instRight.current?.removeAllShapes();
      instLeft.current?.render();
      instRight.current?.render();
      
      setOutOfBoundsLeft(false);
      setOutOfBoundsRight(false);
      
      setTimeout(() => { isZoomingRef.current = false; }, 100);
      return;
    }

    // Zoom no Humano (Esquerda)
    if (instLeft.current && refSequence) {
      instLeft.current.removeAllLabels();
      instLeft.current.removeAllShapes(); 
      
      let atomFoundLeft = false;
      
      if (selectedGridIndex >= 0 && selectedGridIndex < refSequence.length) {
        const refResi = selectedGridIndex + 1; // PDB usa índice base-1
        const atomsLeft = instLeft.current.selectedAtoms({resi: refResi, atom: "CA"});
        
        // MAGIA: SÓ FAZ ZOOM SE O ÁTOMO EXISTIR REALMENTE NO 3D!
        if (atomsLeft && atomsLeft.length > 0) {
          atomFoundLeft = true;
          instLeft.current.addSphere({center: {x: atomsLeft[0].x, y: atomsLeft[0].y, z: atomsLeft[0].z}, radius: 2.5, color: "#4fc3f7", alpha: 0.6});
          instLeft.current.addLabel(`Humano: Posição ${refResi}`, { backgroundColor: "#2c5364", fontColor: "white", backgroundOpacity: 0.9, showBackground: true }, { resi: refResi });
          instLeft.current.zoomTo({resi: refResi}, 800);
        }
      }
      
      setOutOfBoundsLeft(!atomFoundLeft);
      instLeft.current.render();
    }

    // Zoom no Animal (Direita)
    if (instRight.current && activeCompSpecies && compSequences?.[activeCompSpecies]) {
      instRight.current.removeAllLabels();
      instRight.current.removeAllShapes();

      let atomFoundRight = false;
      const offset = getOffset(refSequence, compSequences[activeCompSpecies]);
      const compIndex = selectedGridIndex + offset;
      
      if (compIndex >= 0 && compIndex < compSequences[activeCompSpecies].length) {
        const compResi = compIndex + 1;
        const atomsRight = instRight.current.selectedAtoms({resi: compResi, atom: "CA"});

        // MAGIA: SÓ FAZ ZOOM SE O ÁTOMO EXISTIR REALMENTE NO 3D!
        if (atomsRight && atomsRight.length > 0) {
          atomFoundRight = true;
          const refChar = refSequence[selectedGridIndex];
          const compChar = compSequences[activeCompSpecies][compIndex];
          const isMutation = !refChar || refChar !== compChar;
          const labelColor = isMutation ? "#ef4444" : "#64748b";

          instRight.current.addSphere({center: {x: atomsRight[0].x, y: atomsRight[0].y, z: atomsRight[0].z}, radius: 2.5, color: isMutation ? "red" : "gray", alpha: 0.6});
          instRight.current.addLabel(`${activeCompSpecies.replace(/_/g, ' ')}: Pos ${compResi}`, { backgroundColor: labelColor, fontColor: "white", backgroundOpacity: 0.9, showBackground: true }, { resi: compResi });
          instRight.current.zoomTo({resi: compResi}, 800);
        }
      }
      
      setOutOfBoundsRight(!atomFoundRight);
      instRight.current.render();
    }

    setTimeout(() => { isZoomingRef.current = false; }, 850);
    
  // ---> ATENÇÃO: Adiciona o `refSpecies` ao fim desta linha! <---
  }, [selectedGridIndex, activeCompSpecies, refSequence, compSequences, loadingLeft, loadingRight, refSpecies]);

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
      
      // Se a IA do AlphaFold não tiver a estrutura (ex: proteínas gigantes), vai disparar este erro e saltar para o 'catch'!
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

      // ATIVADOR DE CLIQUES NO 3D
      viewer.setClickable({}, true, function(atom) {
        if (!atom || !atom.resi) return;
        const { refSequence, compSequences, activeCompSpecies, onResidueSelect } = latestDataRef.current;
        if (!onResidueSelect) return;

        if (isLeft) {
          onResidueSelect(atom.resi - 1);
        } else {
          if (!refSequence || !compSequences?.[activeCompSpecies]) return;
          const offset = getOffset(refSequence, compSequences[activeCompSpecies]);
          onResidueSelect(atom.resi - 1 - offset); // Converte a posição 3D de volta para a posição da Grelha
        }
      });
      
      applyStyles(viewer, isLeft); 
      if (latestDataRef.current.selectedGridIndex === null) viewer.zoomTo();
      setLabel(sourceName);

    } catch (err) {
      
      // NOVO: MOTOR DE RESGATE (FALLBACK) PARA A BASE DE DADOS RCSB PDB
      if (targetSpeciesId === 'homo_sapiens' && HUMAN_FALLBACK[targetGene]) {
        try {
          const pdbId = HUMAN_FALLBACK[targetGene];
          setLabel(`A transferir PDB: ${pdbId}...`);
          
          // Vai buscar a estrutura real validada em laboratório!
          const pdbRes = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);
          if (pdbRes.ok) {
            const pdbText = await pdbRes.text();
            viewer.clear();
            viewer.addModel(pdbText, "pdb", { keepH: false });

                  // ATIVADOR DE CLIQUES NO 3D
            viewer.setClickable({}, true, function(atom) {
              if (!atom || !atom.resi) return;
              const { refSequence, compSequences, activeCompSpecies, onResidueSelect } = latestDataRef.current;
              if (!onResidueSelect) return;

              if (isLeft) {
                onResidueSelect(atom.resi - 1);
              } else {
                if (!refSequence || !compSequences?.[activeCompSpecies]) return;
                const offset = getOffset(refSequence, compSequences[activeCompSpecies]);
                onResidueSelect(atom.resi - 1 - offset); // Converte a posição 3D de volta para a posição da Grelha
              }
            });

            applyStyles(viewer, isLeft);
            // SÓ faz zoom de ecrã inteiro se não houver mutação clicada!
            if (latestDataRef.current.selectedGridIndex === null) viewer.zoomTo();
            setLabel(`RCSB PDB: ${pdbId}`); // Indica na UI que é uma estrutura real e não IA
            setLoading(false);
            return; // Sai da função com sucesso
          }
        } catch (fallbackErr) {
           console.warn("Falha no motor de resgate RCSB.");
        }
      }

      // Se não houver fallback ou também falhar, mostra o botão clássico
      setLabel("MANUAL_UPLOAD");
    } finally {
      // ---> NOVO: Regista oficialmente que este animal terminou de ser pintado no ecrã!
      if (isLeft) loadedLeftRef.current = targetSpeciesId;
      else loadedRightRef.current = targetSpeciesId;
      
      setLoading(false);
    }
  };

  useEffect(() => {
    // Nota o 'true' no final, garante que as mutações não ficam invertidas na janela esquerda
    if (gene && refSpecies) loadStructure(gene, refSpecies, instLeft.current, setLabelLeft, setLoadingLeft, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gene, refSpecies]);

  useEffect(() => {
    // Nota o 'false' no final, garante o alinhamento de fragmentos na janela direita
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
      
      // ---> NOVO: Liberta o bloqueio de zoom para ficheiros locais!
      loadedRightRef.current = activeCompSpecies; 
    };
    reader.readAsText(file);
  };

  return (
    <section id="3d-viewer" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-2">Análise Estrutural Comparativa</h2>
      <p className="mb-6 text-gray-700">Compara fisicamente o impacto das variações peptídicas lado a lado.</p>
      
      {/* BARRA DE FILTROS (MANTIDA IGUAL PARA NÃO PERDERES OPÇÕES) */}
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
            <option value="mutations">Diferenças Mutacionais (Vermelho)</option>
            <option value="#00ff00">Verde Néon</option>
            <option value="#ffffff">Branco Puro</option>
          </select>
        </div>
      </div>

      {/* NOVO: BARRA SLEEK ESCURA DE NAVEGAÇÃO 3D (FICA COLADA AOS QUADROS 3D) */}
      <div className="bg-[#1c2a39] p-4 mb-4 flex flex-col md:flex-row gap-4 justify-between items-center rounded-lg border border-gray-700 shadow-md">
        <h3 className="text-white font-bold m-0 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          Navegação Avançada
        </h3>

        <div className="flex flex-wrap gap-2 justify-center">
          
          {/* BOTÃO DE REMOVER FOCO (SÓ APARECE QUANDO CLICAS NA GRELHA) */}
          {selectedGridIndex !== null && (
            <button 
              onClick={() => onResidueSelect && onResidueSelect(null)}
              className="bg-red-900/40 hover:bg-red-600 text-red-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 border border-red-800/50 shadow-sm animate-fade-in cursor-pointer"
              title="Limpar seleção e afastar câmara"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Remover Foco
            </button>
          )}

          {/* BOTÃO DE RESET AQUI! */}
          <button 
            onClick={() => {
              if (onResidueSelect) onResidueSelect(null); 
              isZoomingRef.current = true; // PAUSA A SINCRONIZAÇÃO
              
              if (instLeft.current) { instLeft.current.zoomTo(); instLeft.current.render(); }
              if (instRight.current) { instRight.current.zoomTo(); instRight.current.render(); }
              
              // O zoom default do 3Dmol dura cerca de 1 segundo, reativa depois!
              setTimeout(() => { isZoomingRef.current = false; }, 1050);
            }}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 border border-gray-600 shadow-sm cursor-pointer"
            title="Restaurar posição e zoom iniciais"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
            Centrar
          </button>
          

          {/* BOTÃO DE SINCRONIZAR VISTAS */}
          <button 
            onClick={() => setSyncViews(!syncViews)}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
              syncViews 
                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.5)]' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600 shadow-sm'
            }`}
            title="Trancar as duas câmaras para se moverem em espelho"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            {syncViews ? 'Vistas Trancadas 🔗' : 'Sincronizar Vistas'}
          </button>

          {/* BOTÃO DE AUTO-ROTAÇÃO */}
          <button 
            onClick={() => setIsSpinning(!isSpinning)}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 border cursor-pointer ${
              isSpinning ? 'bg-[#4fc3f7] text-[#1c2a39] border-[#4fc3f7]' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
            }`}
            title="Ativar/Desativar auto-rotação"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.1-8.54L2 9M2.5 22v-6h6M21.87 8.43a9 9 0 1 0-3.1 8.54L22 15"></path></svg>
            Auto-Rotação
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
            
            {/* OVERLAY ESQUERDO (HUMANO) -> Variável outOfBoundsLeft */}
            {outOfBoundsLeft && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/80 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg font-mono text-xs z-20 shadow-lg backdrop-blur-sm flex items-center gap-2 animate-fade-in pointer-events-none">
                <span className="text-yellow-500">⚠️</span>
                N/A (Posição sem estrutura 3D)
              </div>
            )}
            
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
            <select 
              value={activeCompSpecies} 
              onChange={(e) => {
                setActiveCompSpecies(e.target.value);
                // Reset automático quando mudamos de animal
                if (onResidueSelect) onResidueSelect(null); 
                if (instLeft.current) { instLeft.current.zoomTo(); instLeft.current.render(); }
              }}
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
            
            {/* OVERLAY DIREITO (ANIMAL) -> Variável outOfBoundsRight */}
            {outOfBoundsRight && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/80 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg font-mono text-xs z-20 shadow-lg backdrop-blur-sm flex items-center gap-2 animate-fade-in pointer-events-none">
                <span className="text-yellow-500">⚠️</span>
                N/A (Posição sem estrutura 3D)
              </div>
            )}
            
            {labelRight === "MANUAL_UPLOAD" ? (
              <div className="absolute inset-0 bg-[#1c2a39] flex flex-col items-center justify-center text-white z-10 p-6 text-center">
                <span className="text-sm font-mono mb-2 text-yellow-400">⚠️ Estrutura 3D não encontrada na IA.</span>
                <span className="text-xs text-gray-400 mb-4">Se este é um ficheiro local que carregaste (FASTA) ou uma proteína desconhecida, faz o upload do ficheiro .pdb correspondente.</span>
                <label className="bg-[#2c5364] hover:bg-[#3a6b82] text-white px-5 py-2 rounded cursor-pointer font-bold text-xs transition-colors shadow-lg border border-[#48829c]">
                  Upload Ficheiro .PDB
                  <input type="file" accept=".pdb" className="hidden" onChange={(e) => handleManualUpload(e, instRight.current, setLabelRight)} />
                </label>
              </div>
            ) : loadingRight && (
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