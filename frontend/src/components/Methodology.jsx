export default function Methodology() {
  return (
    <section id="method" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-6">Metodologia e Arquitetura</h2>
      
      <p className="mb-8 text-gray-700 leading-relaxed">
        A plataforma opera através de um pipeline bioinformático totalmente automatizado, dividido em dois motores principais que comunicam em tempo real com as maiores bases de dados genómicas e estruturais do mundo.
      </p>

      <div className="space-y-8">
        {/* Bloco 1: MSA */}
        <div className="border-l-4 border-blue-500 pl-5">
          <h3 className="text-xl font-bold text-[#1c2a39] flex items-center gap-3 mb-3">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">1</span>
            Motor de Alinhamento (MSA)
          </h3>
          <ul className="space-y-3 text-gray-700 marker:text-blue-500 list-disc pl-5">
            <li>
              <strong>Validação de Genes:</strong> O termo pesquisado pelo utilizador é validado contra a API REST da <strong>UniProt</strong> para garantir a extração do gene canónico humano correspondente.
            </li>
            <li>
              <strong>Extração Genómica:</strong> O sistema acede à <strong>Ensembl REST API</strong>, utilizando o módulo de <em>Homology</em> para isolar o ortólogo evolutivo exato na espécie animal alvo. De seguida, o algoritmo avalia todos os transcritos disponíveis, seleciona o canónico e efetua o download da sequência peptídica final em formato FASTA.
            </li>
            <li>
              <strong>Alinhamento e HGVS:</strong> Aplicando um algoritmo adaptativo de <em>Sliding Window</em>, o motor avalia sequências de diferentes tamanhos para determinar a janela de sobreposição perfeita (identidade máxima). As mutações são automaticamente dissecadas na nomenclatura clínica universal (ex: V50G).
            </li>
          </ul>
        </div>

        {/* Bloco 2: Visualização 3D */}
        <div className="border-l-4 border-green-500 pl-5">
          <h3 className="text-xl font-bold text-[#1c2a39] flex items-center gap-3 mb-3">
            <span className="bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">2</span>
            Motor de Renderização 3D
          </h3>
          <ul className="space-y-3 text-gray-700 marker:text-green-500 list-disc pl-5">
            <li>
              <strong>Inteligência Artificial:</strong> O acesso estrutural inicia-se traduzindo o nome do gene e espécie no ID de acesso (Accession) pela UniProt, desencadeando o download da previsão de modelação tridimensional gerada pelas redes neuronais do <strong>AlphaFold</strong>.
            </li>
            <li>
              <strong>Fallback Experimental:</strong> Perante falhas de predição na IA, um mecanismo de resgate aciona o download de coordenadas atómicas laboratoriais validadas e armazenadas no repositório <strong>RCSB PDB</strong>.
            </li>
            <li>
              <strong>Sincronização 1D-3D:</strong> Utilizando o renderizador WebGL 3Dmol, a plataforma sincroniza coordenadas bidimensionais de grelha com a volumetria molecular, acendendo pontualmente o resíduo mutado no esqueleto macromolecular.
            </li>
          </ul>
        </div>

        {/* Bloco 3: Mutações Compensatórias */}
        <div className="border-l-4 border-orange-500 pl-5">
          <h3 className="text-xl font-bold text-[#1c2a39] flex items-center gap-3 mb-3">
            <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">3</span>
            Deteção de Mutações Compensatórias
          </h3>
          <ul className="space-y-3 text-gray-700 marker:text-orange-500 list-disc pl-5">
            <li>
              <strong>Isolamento Espacial:</strong> A arquitetura purga todos os átomos não mutados do processamento analítico, isolando estritamente as coordenadas métricas (X, Y, Z) dos átomos centrais de Carbono Alfa (Cα) nos locais de variação.
            </li>
            <li>
              <strong>Matemática Euclidiana:</strong> Todos os vetores espaciais possíveis entre pares de mutações no fragmento ortólogo são cruzados via cálculos de distância Euclidiana tridimensional em tempo real.
            </li>
            <li>
              <strong>Limiar Biológico:</strong> Se a distância estrutural ressaltar <strong>igual ou inferior a 6.5 Å (Angstroms)</strong>, a proximidade química determina forte suscetibilidade estérica co-evolutiva, grafada no ecrã como um elo tracejado interconectivo.
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}