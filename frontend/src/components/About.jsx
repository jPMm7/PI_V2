export default function About() {
  return (
    <section id="about" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-2xl font-bold mb-4 mt-0">Sobre o Projeto</h2>
      <p className="mb-4 text-gray-700">
        Este projeto tem como objetivo desenvolver uma ferramenta bioinformática capaz
        de detetar automaticamente mutações associadas a doenças humanas em
        proteínas de espécies de mamíferos não humanos.
      </p>
      <p className="mb-4 text-gray-700">
        A ferramenta irá comparar sequências de aminoácidos humanas com sequências
        de outras espécies, permitindo identificar:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Mutações associadas a doenças</li>
        <li>Diferenças de aminoácidos entre espécies</li>
        <li>Possíveis mutações compensatórias</li>
      </ul>
    </section>
  );
}