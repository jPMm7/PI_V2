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

// Aceitamos a propriedade onGeneSelect vinda do pai
export default function ToolDemo({ onAnalysisComplete }) {
  const [searchTerm, setSearchTerm] = useState('TP53');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  const [refSpecies, setRefSpecies] = useState('homo_sapiens');
  const [compSpecies, setCompSpecies] = useState('felis_catus');

  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [refSeq, setRefSeq] = useState('');
  const [compSeq, setCompSeq] = useState('');
  const [refId, setRefId] = useState('');
  const [compId, setCompId] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const [debugLogs, setDebugLogs] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGenes = GENE_DATABASE.filter(gene => 
    gene.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchEnsemblData = async (species, geneSymbol) => {
    try {
      const lookupRes = await fetch(`https://rest.ensembl.org/lookup/symbol/${species}/${geneSymbol}?expand=1`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!lookupRes.ok) throw new Error(`O gene ${geneSymbol} não tem correspondência no genoma de ${species.replace(/_/g, ' ')}.`);
      const geneData = await lookupRes.json();

      let translationId = null;
      for (const transcript of (geneData.Transcript || [])) {
        if (transcript.Translation && transcript.Translation.id) {
          translationId = transcript.Translation.id;
          break; 
        }
      }

      if (!translationId) throw new Error(`Sem proteína mapeada para o gene ${geneSymbol} em ${species}.`);

      const seqRes = await fetch(`https://rest.ensembl.org/sequence/id/${translationId}?type=protein`, {
        headers: { 'Content-Type': 'text/x-fasta' } 
      });
      
      if (!seqRes.ok) throw new Error(`Falha ao extrair a sequência de ${translationId}`);
      const rawFastaText = await seqRes.text();

      const cleanedSequence = rawFastaText.split('\n').filter(line => !line.startsWith('>')).join('');

      return { 
        id: translationId, sequence: cleanedSequence,
        debug: { rawFastaReceived: rawFastaText, finalCleanedSequence: cleanedSequence }
      };
    } catch (err) {
      throw err;
    }
  };

  const handleSmartSearch = async () => {
    if (!GENE_DATABASE.includes(searchTerm.toUpperCase())) {
      setErrorMsg("Por favor, seleciona um gene válido do catálogo.");
      return;
    }
    
    setIsSearching(true);
    setErrorMsg('');
    setShowResults(false);
    setDebugLogs(null);
    setShowSuggestions(false); 

    try {
      const targetGene = searchTerm.toUpperCase();
      const [refData, compData] = await Promise.all([
        fetchEnsemblData(refSpecies, targetGene),
        fetchEnsemblData(compSpecies, targetGene)
      ]);

      setRefSeq(refData.sequence);
      setCompSeq(compData.sequence);
      setRefId(refData.id);
      setCompId(compData.id);
      
      setDebugLogs({ referencia: refData.debug, comparacao: compData.debug });
      setShowResults(true);

      if (onAnalysisComplete) {
        onAnalysisComplete({
          gene: targetGene,
          refSpecies: refSpecies,
          compSpecies: compSpecies
        });
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const getAlignmentStats = () => {
    let mutations = 0;
    const minLength = Math.min(refSeq.length, compSeq.length);
    for (let i = 0; i < minLength; i++) {
      if (refSeq[i] !== compSeq[i]) mutations++;
    }
    const identityPercentage = (((minLength - mutations) / minLength) * 100).toFixed(2);
    return { mutations, minLength, identityPercentage };
  };

  const getSequenceComposition = (sequence) => {
    const counts = {};
    for (let char of sequence) {
      counts[char] = (counts[char] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const CompositionStats = ({ seq, title, colorClass }) => {
    const stats = getSequenceComposition(seq);
    return (
      <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm mt-3">
        <h4 className={`text-sm font-bold mb-2 ${colorClass}`}>Composição de Aminoácidos: {title}</h4>
        <div className="flex flex-wrap gap-2">
          {stats.map(([aa, count]) => (
            <span key={aa} className="bg-gray-100 text-gray-700 text-xs font-mono px-2 py-1 rounded border border-gray-300">
              <strong className={colorClass}>{aa}:</strong> {count}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="tool" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-2">Motor de Pesquisa Ensembl API</h2>
      <p className="mb-6 text-gray-700">Explora o nosso catálogo curado de genes associados a doenças e compara a sua evolução em vários mamíferos.</p>
      
      <div className="bg-[#eef3f8] p-6 rounded-lg border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1 w-full relative" ref={dropdownRef}>
          <label className="block font-semibold text-[#1c2a39] mb-2">Gene</label>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#2c5364] uppercase"
            placeholder="Ex: TP53"
          />
          {showSuggestions && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
              {filteredGenes.length > 0 ? (
                filteredGenes.map((gene) => (
                  <li 
                    key={gene}
                    onClick={() => {
                      setSearchTerm(gene);
                      setShowSuggestions(false);
                      setErrorMsg('');
                    }}
                    className="p-3 hover:bg-[#eef3f8] cursor-pointer text-[#1c2a39] font-medium border-b border-gray-100 last:border-0"
                  >
                    🧬 {gene}
                  </li>
                ))
              ) : (
                <li className="p-3 text-gray-500 italic">Nenhum gene encontrado no catálogo.</li>
              )}
            </ul>
          )}
        </div>

        <div className="flex-1 w-full">
          <label className="block font-semibold text-[#1c2a39] mb-2">Referência</label>
          <select value={refSpecies} onChange={(e) => setRefSpecies(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5364]">
            {SPECIES_DATABASE.map(species => (
              <option key={`ref-${species.id}`} value={species.id}>{species.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 w-full">
          <label className="block font-semibold text-[#1c2a39] mb-2">Comparação</label>
          <select value={compSpecies} onChange={(e) => setCompSpecies(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c5364]">
            {SPECIES_DATABASE.map(species => (
              <option key={`comp-${species.id}`} value={species.id}>{species.name}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <button onClick={handleSmartSearch} disabled={isSearching || !searchTerm} className="w-full bg-[#2c5364] text-white px-8 py-3 rounded-md hover:bg-[#1c2a39] transition-colors font-medium disabled:opacity-50">
            {isSearching ? 'A extrair...' : 'Pesquisar'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Aviso do Sistema</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {showResults && (
        <div className="mt-8 animate-fade-in">
          <div className="bg-[#1c2a39] p-5 rounded-t-lg border-b border-gray-600 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-white text-lg font-bold m-0 flex items-center gap-2">
              🧬 Alinhamento: <span className="text-[#6ec1ff]">{searchTerm.toUpperCase()}</span>
            </h3>
            <div className="flex gap-3 text-sm">
              <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full border border-gray-600">
                Tamanho: <strong>{getAlignmentStats().minLength} aa</strong>
              </span>
              <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-full border border-red-800">
                Mutações: <strong>{getAlignmentStats().mutations}</strong>
              </span>
              <span className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full border border-green-800">
                Identidade: <strong>{getAlignmentStats().identityPercentage}%</strong>
              </span>
            </div>
          </div>

          <div className="bg-[#1c2a39] text-gray-300 p-5 rounded-b-lg font-mono text-sm overflow-x-auto mb-6">
            <div className="flex mb-1 items-center">
              <div className="w-48 shrink-0 pr-2">
                <span className="text-blue-400 font-bold block truncate" title={refSpecies.replace(/_/g, ' ')}>{refSpecies.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="text-gray-500 text-xs block">{refId}</span>
              </div>
              <div className="flex gap-[1px]">
                {refSeq.split('').map((char, index) => (
                  <span key={`h-${index}`} className="w-[14px] text-center inline-block">{char}</span>
                ))}
              </div>
            </div>

            <div className="flex my-2 items-center py-1  ">
              <div className="w-48 shrink-0 pr-2 text-right">
                <span className="text-gray-400 text-[9px] font-semibold uppercase tracking-wider block">Posição</span>
              </div>
              <div className="flex gap-[1px]">
                {refSeq.split('').map((_, index) => {
                  const pos = index + 1;
                  const isDecade = pos % 10 === 0;
                  const displayNum = isDecade ? pos : (pos % 10);
                  return (
                    <span key={`ruler-${index}`} className={`w-[14px] text-center inline-block ${isDecade ? 'text-[9.5px] text-white font-bold' : 'text-[7.5px] text-gray-500'}`} style={{ overflow: 'visible' }}>
                      {displayNum}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-48 shrink-0 pr-2">
                <span className="text-green-400 font-bold block truncate" title={compSpecies.replace(/_/g, ' ')}>{compSpecies.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="text-gray-500 text-xs block">{compId}</span>
              </div>
              <div className="flex gap-[1px]">
                {compSeq.split('').map((char, index) => {
                  const isDiff = char !== refSeq[index];
                  return (
                    <span key={`c-${index}`} className={`w-[14px] text-center inline-block rounded-sm ${isDiff ? 'bg-red-500 text-white font-bold' : 'text-gray-400'}`}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <CompositionStats seq={refSeq} title={refSpecies.replace(/_/g, ' ').toUpperCase()} colorClass="text-blue-600" />
            <CompositionStats seq={compSeq} title={compSpecies.replace(/_/g, ' ').toUpperCase()} colorClass="text-green-600" />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowDebug(!showDebug)}>
              <h4 className="text-[#1c2a39] font-bold m-0 flex items-center gap-2">
                <span className="text-xl">{showDebug ? '▼' : '▶'}</span> 
                Modo de Depuração (Raw API Data)
              </h4>
            </div>
            {showDebug && debugLogs && (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                  <p className="font-bold text-sm text-blue-600 mb-2">1. Resposta da API (FASTA Bruto)</p>
                  <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap p-2 bg-gray-100 rounded">
                    {debugLogs.comparacao.rawFastaReceived}
                  </pre>
                </div>
                <div className="bg-white p-3 border border-gray-300 rounded shadow-sm">
                  <p className="font-bold text-sm text-green-600 mb-2">2. Filtrado para o Alinhador</p>
                  <pre className="text-xs text-gray-800 overflow-x-auto break-all p-2 bg-green-50 rounded">
                    {debugLogs.comparacao.finalCleanedSequence}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}