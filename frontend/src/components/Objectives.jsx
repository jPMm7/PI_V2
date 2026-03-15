export default function Objectives() {
  // Lista de objetivos retirada do vosso protótipo inicial
  const objectivesList = [
    {
      title: "Comparação de Proteomas",
      desc: "Analisar sequências proteicas humanas e de outras espécies."
    },
    {
      title: "Deteção de Mutações",
      desc: "Identificar mutações relacionadas com doenças genéticas."
    },
    {
      title: "Análise Evolutiva",
      desc: "Estudar diferenças evolutivas entre espécies."
    },
    {
      title: "Compensatory Mutations",
      desc: "Detetar possíveis mutações que compensam alterações prejudiciais."
    }
  ];

  return (
    <section id="objectives" className="bg-white p-[30px] mb-[30px] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-6">Objetivos</h2>
      
      {/* Aqui recriamos a classe .grid do vosso colega de forma automática */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
        
        {/* O React vai percorrer a lista acima e gerar um cartão para cada objetivo */}
        {objectivesList.map((item, index) => (
          <div key={index} className="bg-[#eef3f8] p-5 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-[#1c2a39] text-xl font-semibold mt-0 mb-2">{item.title}</h3>
            <p className="text-gray-700 m-0">{item.desc}</p>
          </div>
        ))}

      </div>
    </section>
  );
}