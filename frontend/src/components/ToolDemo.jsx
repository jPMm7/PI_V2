import { useState, useRef, useEffect } from 'react';

const GENE_DATABASE = [
  "TP53", "BRCA1", "BRCA2", "EGFR", "PTEN", "APOE", "APP", "SNCA", "HTT", 
  "CFTR", "INS", "TNF", "IL6", "VEGFA", "MYC", "KRAS", "PIK3CA", "AKT1", 
  "MTOR", "RB1", "VWF", "F8", "F9", "DMD", "HBB", "HBA1", "HEXA", "GBA", 
  "LRRK2", "PARK7", "PINK1", "CDH1", "APC", "MLH1", "MSH2", "SMAD4"
].sort();

const SPECIES_DATABASE = [
  { id: 'homo_sapiens', name: 'Homo sapiens (Humano)' },
  { id: 'pan_troglodytes', name: 'Pan troglodytes (Chimpanzé)' },
  { id: 'gorilla_gorilla', name: 'Gorilla gorilla (Gorila)' },
  { id: 'macaca_mulatta', name: 'Macaca mulatta (Macaco Rhesus)' },
  { id: 'mus_musculus', name: 'Mus musculus (Rato Doméstico)' },
  { id: 'rattus_norvegicus', name: 'Rattus norvegicus (Ratazana)' },
  { id: 'felis_catus', name: 'Felis catus (Gato)' },
  { id: 'canis_lupus_familiaris', name: 'Canis lupus (Cão)' },
  { id: 'sus_scrofa', name: 'Sus scrofa (Porco)' },
  { id: 'bos_taurus', name: 'Bos taurus (Vaca)' },
  { id: 'equus_caballus', name: 'Equus caballus (Cavalo)' },
  { id: 'loxodonta_africana', name: 'Loxodonta africana (Elefante)' },
  { id: 'oryctolagus_cuniculus', name: 'Oryctolagus cuniculus (Coelho)' },
  { id: 'delphinus_delphis', name: 'Delphinus delphis (Golfinho)' }
];

export default function ToolDemo({ onAnalysisComplete }) {
  const [searchTerm, setSearchTerm] = useState('TP53');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  

  const [refSpecies, setRefSpecies] = useState('homo_sapiens');
  const [compSpeciesList, setCompSpeciesList] = useState(['felis_catus', 'pan_troglodytes']);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const multiSelectRef = useRef(null);

  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [refDataState, setRefDataState] = useState(null);
  const [compDataListState, setCompDataListState] = useState([]);
  const [showResults, setShowResults] = useState(false);

 // NOVO: Estado para saber qual a linha que está ativamente em modo de edição
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  
  // NOVO: Estado para controlar a Janela Dinâmica (Modal) das Mutações
  const [mutationModal, setMutationModal] = useState({ isOpen: false, species: '', mutations: [] });

  const handleMoveTrack = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Validar limites (não subir o primeiro, não descer o último)
    if (newIndex < 0 || newIndex >= compSpeciesList.length) return;

    // 1. Trocar posições na lista de controlo de espécies
    const updatedSpeciesList = [...compSpeciesList];
    const tempSpecies = updatedSpeciesList[index];
    updatedSpeciesList[index] = updatedSpeciesList[newIndex];
    updatedSpeciesList[newIndex] = tempSpecies;
    setCompSpeciesList(updatedSpeciesList);

    // 2. Trocar posições na lista de dados das sequências (para mover os aminoácidos em sincronia)
    const updatedDataList = [...compDataListState];
    const tempData = updatedDataList[index];
    updatedDataList[index] = updatedDataList[newIndex];
    updatedDataList[newIndex] = tempData;
    setCompDataListState(updatedDataList);

    // 3. Notificar reativamente o componente pai e o visualizador 3D
    if (onAnalysisComplete) {
      onAnalysisComplete({
        gene: searchTerm.toUpperCase(),
        refSpecies: refSpecies,
        compSpeciesList: updatedSpeciesList,
        refSequence: refDataState?.sequence,
        compSequences: updatedDataList.reduce((acc, item) => {
          if (item && !item.error) acc[item.species] = item.sequence;
          return acc;
        }, {})
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowSuggestions(false);
      if (multiSelectRef.current && !multiSelectRef.current.contains(event.target)) setShowMultiSelect(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGenes = GENE_DATABASE.filter(gene => gene.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleSpecies = (speciesId) => {
    setCompSpeciesList(prev => 
      prev.includes(speciesId) ? prev.filter(id => id !== speciesId) : [...prev, speciesId]
    );
  };

  const fetchEnsemblData = async (species, geneSymbol) => {
    try {
      const baseSymbol = geneSymbol.toUpperCase();
      let geneData = null;
      let lookupRes = null;

      // ESTRATÉGIA DE BUSCA 1: Nomenclatura Humana/Primatas (Tudo Maiúsculo) -> Ex: TP53
      lookupRes = await fetch(`https://rest.ensembl.org/lookup/symbol/${species}/${baseSymbol}?expand=1`, {
        headers: { 'Content-Type': 'application/json' }
      });

      // ESTRATÉGIA DE BUSCA 2: Nomenclatura de Roedores/Mamíferos (Capitalizado) -> Ex: Trp53
      if (!lookupRes.ok) {
        const capitalized = baseSymbol.charAt(0) + baseSymbol.slice(1).toLowerCase();
        lookupRes = await fetch(`https://rest.ensembl.org/lookup/symbol/${species}/${capitalized}?expand=1`, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // ESTRATÉGIA DE BUSCA 3: Minúsculas absolutas -> Ex: tp53
      if (!lookupRes.ok) {
        lookupRes = await fetch(`https://rest.ensembl.org/lookup/symbol/${species}/${baseSymbol.toLowerCase()}?expand=1`, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!lookupRes.ok) throw new Error(`Gene não mapeado pelo Ensembl nesta espécie.`);
      
      geneData = await lookupRes.json();
      
      // ALGORITMO BIOINFORMÁTICO DE SELEÇÃO DE ISOFORMA (Resolve a dúvida da professora)
      let bestTranslationId = null;
      let maxLength = 0;

      for (const transcript of (geneData.Transcript || [])) {
        if (transcript.Translation && transcript.Translation.id) {
          const currentLength = transcript.Translation.length || 0;

          // Se o Ensembl nos disser explicitamente que esta é a isoforma canónica, paramos logo!
          if (transcript.is_canonical === 1) {
            bestTranslationId = transcript.Translation.id;
            break;
          }

          // Se não houver indicação canónica, vamos guardando a proteína mais longa
          if (currentLength > maxLength) {
            maxLength = currentLength;
            bestTranslationId = transcript.Translation.id;
          }
        }
      }

      if (!bestTranslationId) throw new Error(`Sequência peptídica não encontrada no genoma.`);

      // Extração da FASTA final
      const seqRes = await fetch(`https://rest.ensembl.org/sequence/id/${bestTranslationId}?type=protein`, {
        headers: { 'Content-Type': 'text/x-fasta' } 
      });
      
      if (!seqRes.ok) throw new Error(`Falha na extração de ${bestTranslationId}`);
      
      const rawFastaText = await seqRes.text();
      const cleanedSequence = rawFastaText.split('\n').filter(line => !line.startsWith('>')).join('');

      return { id: bestTranslationId, sequence: cleanedSequence, species: species, rawFastaText };
    } catch (err) {
      return { species: species, error: err.message, sequence: '' };
    }
  };

  const handleSmartSearch = async () => {
    if (!GENE_DATABASE.includes(searchTerm.toUpperCase())) {
      setErrorMsg("Seleciona um gene válido."); return;
    }
    if (compSpeciesList.length === 0) {
      setErrorMsg("Seleciona pelo menos uma espécie para comparar."); return;
    }
    
    setIsSearching(true);
    setErrorMsg('');
    setShowResults(false);
    setShowSuggestions(false); 
    setShowMultiSelect(false);

    try {
      const targetGene = searchTerm.toUpperCase();
      
      const [refData, ...compDataArray] = await Promise.all([
        fetchEnsemblData(refSpecies, targetGene),
        ...compSpeciesList.map(species => fetchEnsemblData(species, targetGene))
      ]);

      if (refData.error) throw new Error(`Referência Falhou: ${refData.error}`);

      setRefDataState(refData);
      setCompDataListState(compDataArray);
      setShowResults(true);

      if (onAnalysisComplete) {
        onAnalysisComplete({
          gene: targetGene,
          refSpecies: refSpecies,
          compSpeciesList: compSpeciesList,
          refSequence: refData.sequence,
          compSequences: compDataArray.reduce((acc, item) => {
            if (item && !item.error) acc[item.species] = item.sequence;
            return acc;
          }, {})
        });
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // NOVO: AÇÃO DE APAGAR UMA LINHA DIRECTAMENTE NO RESULTADO
  const handleDeleteTrack = (speciesId) => {
    const updatedList = compSpeciesList.filter(id => id !== speciesId);
    setCompSpeciesList(updatedList);
    setCompDataListState(prev => prev.filter(item => item.species !== speciesId));
   

    // Sincroniza imediatamente com o componente Pai e o Visualizador 3D
    if (onAnalysisComplete) {
      onAnalysisComplete({
        gene: searchTerm.toUpperCase(),
        refSpecies: refSpecies,
        compSpeciesList: updatedList,
        refSequence: refDataState?.sequence,
        compSequences: compDataListState.filter(item => item.species !== speciesId).reduce((acc, item) => {
          if (item && !item.error) acc[item.species] = item.sequence;
          return acc;
        }, {})
      });
    }
  };


  // NOVO: AÇÃO DE ADICIONAR UMA NOVA ESPÉCIE INLINE
  const handleAddTrack = async (newSpeciesId) => {
    if (!newSpeciesId) return;
    setIsAddingTrack(false);
    
    const targetGene = searchTerm.toUpperCase();

    // Atualiza a lista geral
    const updatedList = [...compSpeciesList, newSpeciesId];
    setCompSpeciesList(updatedList);

    // Linha de carregamento temporária
    setCompDataListState(prev => [...prev, { species: newSpeciesId, sequence: '', loading: true }]);

    // Dispara API
    const newData = await fetchEnsemblData(newSpeciesId, targetGene);

    // ATUALIZAÇÃO SEGURA: Sem side-effects dentro do setState!
    setCompDataListState(prev => {
      const next = [...prev];
      const idx = next.findIndex(item => item.species === newSpeciesId);
      if (idx !== -1) next[idx] = newData;
      return next;
    });

    // Sincroniza com o PAI no escopo correto (Acaba com o erro da consola!)
    if (onAnalysisComplete) {
      const currentDataList = compDataListState.filter(item => item.species !== newSpeciesId);
      currentDataList.push(newData);

      onAnalysisComplete({
        gene: targetGene,
        refSpecies: refSpecies,
        compSpeciesList: updatedList,
        refSequence: refDataState?.sequence,
        compSequences: currentDataList.reduce((acc, item) => {
          if (item && !item.error) acc[item.species] = item.sequence;
          return acc;
        }, {})
      });
    }
  };

  // 2. ESTATÍSTICAS COM JANELA DESLIZANTE INFINITA E NOTAÇÃO HGVS
  const calculateStats = (refSeq, compSeq) => {
    if (!compSeq || !refSeq) return { mutations: 0, identity: 0, offset: 0, mutationDetails: [] };
    let maxMatches = 0;
    let bestOffset = 0;
    const range = Math.max(refSeq.length, compSeq.length);

    // 1. Procura o encaixe perfeito de ponta a ponta
    for (let offset = -range; offset <= range; offset++) {
      let matches = 0;
      for (let i = 0; i < refSeq.length; i++) {
        const compIdx = i + offset;
        if (compIdx >= 0 && compIdx < compSeq.length) {
          if (refSeq[i] === compSeq[compIdx]) matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestOffset = offset;
      }
    }

    // 2. Extrair as mutações na notação V50G
    const mutationDetails = [];
    let mutationsCount = 0;
    let matches = 0;

    for (let i = 0; i < refSeq.length; i++) {
      const compIdx = i + bestOffset;
      // Analisa apenas as partes onde as duas proteínas se sobrepõem
      if (compIdx >= 0 && compIdx < compSeq.length) {
        const refChar = refSeq[i];
        const compChar = compSeq[compIdx];
        
        if (refChar === compChar) {
          matches++;
        } else {
          mutationsCount++;
          // Cria a string HGVS: [Original][Posição][Mutado]
          mutationDetails.push(`${refChar}${i + 1}${compChar}`); 
        }
      }
    }

    const minLength = Math.min(refSeq.length, compSeq.length);
    const identity = ((matches / minLength) * 100).toFixed(1);
    
    return { 
      mutations: mutationsCount, 
      identity: identity > 100 ? 100 : identity,
      offset: bestOffset,
      mutationDetails: mutationDetails // <-- Exportar para a UI
    };
  };

  return (
    <section id="tool" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-2">Motor de Alinhamento Múltiplo (MSA)</h2>
      <p className="mb-6 text-gray-700">Explora o nosso catálogo e alinha várias espécies em simultâneo contra o proteoma de referência.</p>
      
      <div className="bg-[#eef3f8] p-6 rounded-lg border border-gray-200 mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* INPUT GENE */}
        <div className="flex-1 w-full relative" ref={dropdownRef}>
          <label className="block font-semibold text-[#1c2a39] mb-2">Gene</label>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#2c5364] uppercase"
          />
          {showSuggestions && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredGenes.map((gene) => (
                <li key={gene} onClick={() => { setSearchTerm(gene); setShowSuggestions(false); }} className="p-3 hover:bg-[#eef3f8] cursor-pointer font-medium border-b border-gray-100">
                  🧬 {gene}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SELECT REFERÊNCIA */}
        <div className="flex-1 w-full">
          <label className="block font-semibold text-[#1c2a39] mb-2">Referência</label>
          <select value={refSpecies} onChange={(e) => setRefSpecies(e.target.value)} className="w-full bg-white border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5364]">
            {SPECIES_DATABASE.map(species => (
              <option key={`ref-${species.id}`} value={species.id}>{species.name}</option>
            ))}
          </select>
        </div>
        
        {/* DROPDOWN ESPÉCIES */}
        <div className="flex-1 w-full relative" ref={multiSelectRef}>
          <label className="block font-semibold text-[#1c2a39] mb-2">Animais a Comparar</label>
          <div 
            onClick={() => setShowMultiSelect(!showMultiSelect)} 
            className="w-full bg-white border border-gray-300 p-3 rounded-md cursor-pointer flex justify-between items-center hover:border-[#2c5364]"
          >
            <span className="text-gray-700 font-medium">
              {compSpeciesList.length === 0 ? 'Selecionar espécies...' : `${compSpeciesList.length} Espécies Ativas`}
            </span>
            <span className="text-xs">▼</span>
          </div>

          {showMultiSelect && (
            <div className="absolute z-20 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-xl max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
              {SPECIES_DATABASE.filter(s => s.id !== refSpecies).map(species => (
                <label key={`ms-${species.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200">
                  <input 
                    type="checkbox" 
                    checked={compSpeciesList.includes(species.id)}
                    onChange={() => toggleSpecies(species.id)}
                    className="w-4 h-4 text-[#2c5364] rounded focus:ring-[#2c5364] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">{species.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-full lg:w-auto">
          <button onClick={handleSmartSearch} disabled={isSearching} className="w-full bg-[#2c5364] text-white px-8 py-3 rounded-md hover:bg-[#1c2a39] transition-colors font-medium disabled:opacity-50">
            {isSearching ? 'A extrair...' : 'Alinhar Tudo'}
          </button>
        </div>
      </div>

      {errorMsg && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"><p className="font-bold">Aviso</p><p>{errorMsg}</p></div>}

      {showResults && refDataState && (
        <div className="mt-8 animate-fade-in">
          
          <div className="bg-[#1c2a39] text-gray-300 p-5 rounded-b-lg font-mono text-sm overflow-x-auto mb-6">
            
            {/* NOVO: CÁLCULO DA GRELHA DINÂMICA MAXIMIZADA */}
            {(() => {
              let maxGridLength = refDataState.sequence.length;
              
              compDataListState.forEach(compData => {
                if (!compData.loading && !compData.error && compData.sequence) {
                  const stats = calculateStats(refDataState.sequence, compData.sequence);
                  // O tamanho necessário é o tamanho da proteína do animal menos o desvio inicial
                  const requiredLength = compData.sequence.length - stats.offset;
                  if (requiredLength > maxGridLength) {
                    maxGridLength = requiredLength;
                  }
                }
              });

              // Cria um array com o tamanho exato da maior sequência para mapear a grelha
              const gridIndices = Array.from({ length: maxGridLength }, (_, i) => i);

              return (
                <>
            {/* LINHA DE REFERÊNCIA (FIXA NO SCROLL) */}
                  <div className="flex mb-1 items-center">
                    <div className="w-64 shrink-0 pr-4 bg-[#1c2a39] sticky left-0 z-10 flex flex-col justify-center border-r border-gray-700/30 mr-2">
                      <span className="text-blue-400 font-bold block truncate" title={refDataState.species.replace(/_/g, ' ')}>⭐ {refDataState.species.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-gray-500 text-[10px]">ID: {refDataState.id}</span>
                    </div>
                    <div className="flex gap-[1px]">
                      {gridIndices.map((index) => {
                        const char = refDataState.sequence[index];
                        return (
                          <span key={`h-${index}`} className={`w-[14px] text-center inline-block font-bold ${!char ? 'text-gray-500 opacity-30' : ''}`}>
                            {char || '-'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

            {/* A RÉGUA DE POSIÇÕES */}
                  <div className="flex my-3 items-center bg-[#15202b] py-1.5 rounded-sm border-y border-gray-700/50">
                    <div className="w-64 shrink-0 pr-4 text-right bg-[#15202b] sticky left-0 z-10 border-r border-gray-700/30 mr-2">
                      <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block">Posição</span>
                    </div>
                    <div className="flex gap-[1px]">
                      {gridIndices.map((index) => {
                        const pos = index + 1;
                        const isDecade = pos % 10 === 0;
                        return (
                          <span key={`ruler-${index}`} className={`w-[14px] text-center inline-block ${isDecade ? 'text-[9.5px] text-white font-bold' : 'text-[7.5px] text-gray-500'}`} style={{ overflow: 'visible' }}>
                            {isDecade ? pos : (pos % 10)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

            {/* AS PISTAS DE COMPARAÇÃO INTERATIVAS (EDITAR / APAGAR) */}
            <div className="flex flex-col gap-2">
              {compDataListState.map((compData, trackIdx) => {
                const hasData = !compData.loading && !compData.error;
                const stats = hasData ? calculateStats(refDataState.sequence, compData.sequence) : { mutations: 0, identity: 0 };

                return (
                  <div 
                    key={`track-${compData.species}`} // DICA: Usar o ID da espécie como key em vez do trackIdx ajuda o React a animar a troca de posição corretamente
                    className="flex items-center hover:bg-gray-800/40 rounded py-1 transition-all duration-300 ease-in-out transform opacity-100"
                  >
                    
                    {/* COLUNA ESQUERDA FIXA COM OS BOTÕES DE LIXO E EDIÇÃO */}
                    <div className="w-64 shrink-0 pr-4 bg-[#1c2a39] sticky left-0 z-10 flex flex-col justify-center border-r border-gray-700/50 mr-2">
                      <span className="text-green-400 font-bold block truncate" title={compData.species.replace(/_/g, ' ')}>
                        {compData.species.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      
                      {/* Sub-barra de Status + Botões */}
                      <div className="flex justify-between items-center text-[10px] mt-0.5">
                        {hasData ? (
                          <div className="flex gap-3 items-center">
                            {/* BOTÃO DE RELATÓRIO EVIDENTE */}
                            <button 
                              onClick={() => setMutationModal({ isOpen: true, species: compData.species, mutations: stats.mutationDetails })}
                              className="bg-red-900/30 text-red-300 border border-red-800/50 hover:bg-red-600 hover:text-white hover:border-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 -ml-1"
                              title="Abrir Relatório Detalhado"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                              <span className="font-bold">{stats.mutations} Mut</span>
                            </button>
                            <span className="text-green-300 font-bold py-0.5">Id: {stats.identity}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">---</span>
                        )}
                        
                        {/* BOTÕES DE REORDENAÇÃO TÁTICA (SUBIR / DESCER) COM ÍCONES MINIMALISTAS */}
                        <div className="flex gap-2 ml-auto items-center">
                          
                          {/* Botão de Subir (Seta para Cima) */}
                          <button 
                            onClick={() => handleMoveTrack(trackIdx, 'up')}
                            disabled={trackIdx === 0}
                            className={`text-gray-400 hover:text-blue-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-gray-700/50 ${
                              trackIdx === 0 ? 'opacity-10 cursor-not-allowed hover:text-gray-400 hover:bg-transparent' : ''
                            }`}
                            title="Subir Pista"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          </button>
                          
                          {/* Botão de Descer (Seta para Baixo) */}
                          <button 
                            onClick={() => handleMoveTrack(trackIdx, 'down')}
                            disabled={trackIdx === compSpeciesList.length - 1}
                            className={`text-gray-400 hover:text-blue-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-gray-700/50 ${
                              trackIdx === compSpeciesList.length - 1 ? 'opacity-10 cursor-not-allowed hover:text-gray-400 hover:bg-transparent' : ''
                            }`}
                            title="Descer Pista"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>

                          {/* Botão de Apagar (Mantém-se minimalista ao lado) */}
                          <button 
                            onClick={() => handleDeleteTrack(compData.species)}
                            className="text-red-400/80 hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-gray-700/50 ml-1"
                            title="Remover Faixa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                          
                        </div>
                      </div>
                    </div>

                    {/* COLUNA DIREITA FLUIDA (Aminoácidos alinhados de forma inteligente) */}
                          {compData.loading ? (
                            <span className="text-xs text-blue-300 animate-pulse pl-2 italic">A atualizar via Ensembl API...</span>
                          ) : compData.error ? (
                            <span className="text-red-400 text-xs pl-2 truncate max-w-xl" title={compData.error}>⚠️ {compData.error}</span>
                          ) : (
                            <div className="flex gap-[1px]">
                              {gridIndices.map((index) => {
                                const refChar = refDataState.sequence[index];
                                const compIdx = index + stats.offset;
                                const compChar = compData.sequence[compIdx];

                                if (compIdx < 0 || compIdx >= compData.sequence.length) {
                                  return (
                                    <span 
                                      key={`c-${trackIdx}-${index}`} 
                                      className="w-[14px] text-center inline-block rounded-sm text-gray-500 opacity-30 font-bold"
                                      title="Gap de Sequência"
                                    >
                                      -
                                    </span>
                                  );
                                }

                                // Nova Lógica: Se o humano não tiver letra nesta posição, é sempre uma diferença (inserção)
                                const isDiff = !refChar || compChar !== refChar;
                                return (
                                  <span 
                                    key={`c-${trackIdx}-${index}`} 
                                    className={`w-[14px] text-center inline-block rounded-sm ${isDiff ? 'bg-red-500 text-white font-bold' : 'text-gray-400 opacity-60'}`}
                                  >
                                    {compChar}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                  </div>
                );
              })}

              {/* BOTÃO + ADICIONAR NOVA FAIXA INLINE */}
              <div className="flex items-center py-2">
                <div className="w-64 shrink-0 pr-4 sticky left-0 z-10 flex flex-col justify-center mr-2">
                  {isAddingTrack ? (
                    <div className="flex items-center gap-2">
                      <select 
                        onChange={(e) => handleAddTrack(e.target.value)}
                        defaultValue=""
                        className="bg-[#15202b] text-white text-xs p-1.5 rounded border border-gray-600 w-full focus:outline-none focus:border-blue-400"
                      >
                        <option value="" disabled>Selecionar espécie...</option>
                        {SPECIES_DATABASE.map(s => (
                          <option 
                            key={`add-${s.id}`} 
                            value={s.id} 
                            disabled={s.id === refSpecies || compSpeciesList.includes(s.id)}
                          >
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={() => setIsAddingTrack(false)}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingTrack(true)}
                      className="flex items-center justify-center gap-2 w-full py-1.5 border border-dashed border-gray-600 rounded text-gray-400 hover:text-blue-400 hover:border-blue-400 hover:bg-[#15202b] transition-all text-xs font-semibold cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Adicionar Espécie
                    </button>
                  )}
                </div>
              </div>
            </div> 
            </>
          );
        })()}
          </div>
        </div>
      )}
      {/* NOVO: JANELA DINÂMICA (MODAL) DO RELATÓRIO DE MUTAÇÕES */}
      {mutationModal.isOpen && (
        <div className="fixed inset-0 bg-[#000000bb] z-50 flex justify-center items-center backdrop-blur-md p-4 animate-fade-in">
          {/* Mudança para rounded-2xl e overflow-hidden para arredondamento perfeito */}
          <div className="bg-[#1c2a39] border border-gray-600 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            
            {/* Cabeçalho do Modal (um pouco mais espaçoso) */}
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-[#15202b]">
              <h3 className="text-white text-lg font-bold m-0 flex items-center gap-2">
                🧬 Perfil Mutacional: <span className="text-green-400">{mutationModal.species.replace(/_/g, ' ').toUpperCase()}</span>
              </h3>
              <button 
                onClick={() => setMutationModal({ isOpen: false, species: '', mutations: [] })} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Corpo com a grelha de mutações */}
            <div className="p-6 overflow-y-auto">
              <p className="text-gray-300 mb-6 text-sm">
                Foram detetadas <strong>{mutationModal.mutations.length}</strong> divergências peptídicas em relação à referência humana <span className="italic">({refSpecies.replace(/_/g, ' ')})</span>. Abaixo encontra-se o mapeamento na notação HGVS (Original ➔ Posição ➔ Mutado).
              </p>
              
              {mutationModal.mutations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mutationModal.mutations.map((mut, idx) => (
                    <span 
                      key={idx} 
                      className="bg-red-900/30 text-red-300 border border-red-800/50 px-2.5 py-1.5 rounded text-sm font-mono shadow-sm hover:bg-red-900/50 transition-colors cursor-default"
                    >
                      {mut}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 italic py-8 border border-dashed border-gray-700 rounded-lg">
                  Não foram detetadas mutações. A sequência é 100% idêntica.
                </div>
              )}
            </div>
            
            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button 
                onClick={() => setMutationModal({ isOpen: false, species: '', mutations: [] })} 
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors text-sm font-semibold cursor-pointer"
              >
                Fechar Relatório
              </button>
            </div>
            
          </div>
        </div>
      )}

    </section>
  );
}