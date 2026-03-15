export default function Contact() {
  return (
    <section id="contact" className="bg-white p-8 mb-8 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <h2 className="text-[#1c2a39] text-[28px] font-bold mt-0 mb-6">Contacto</h2>
      
      <form className="flex flex-col gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Nome</label>
          <input 
            type="text" 
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c5364] bg-white" 
            placeholder="O teu nome" 
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input 
            type="email" 
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c5364] bg-white" 
            placeholder="O teu email" 
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Mensagem</label>
          <textarea 
            rows="4" 
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c5364] bg-white" 
            placeholder="Escreve aqui a tua mensagem..."
          ></textarea>
        </div>
        
        <button 
          type="button" 
          className="bg-[#2c5364] text-white px-6 py-2.5 rounded-md hover:bg-[#1c2a39] transition-colors font-medium cursor-pointer self-start mt-2"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}