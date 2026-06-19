export default function About() {
  return (
    <section id="about" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-2xl font-bold mb-4 mt-0">Sobre o Projeto</h2>
      
      <div className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          As proteínas evoluem através de mudanças coordenadas, onde as interações compensatórias ajudam a preservar a sua função apesar de eventuais mutações prejudiciais.
        </p>
        <p>
          Esta aplicação web fornece uma forma interativa de detetar estas interações, tornando possível explorar variações biológicas tanto em alinhamentos de sequência como em representações estruturais 3D.
        </p>
      </div>
    </section>
  );
}