export default function Contact() {
  return (
    <section id="contact" className="relative mt-24 mb-24 flex items-center">
      
      {/* Background colored block */}
      <div className="bg-[#2c5364] rounded-xl w-full md:w-[85%] flex flex-col md:flex-row shadow-xl overflow-hidden min-h-[500px]">
        
        {/* Left Side (Text Info) */}
        <div className="w-full md:w-[45%] text-white p-10 md:p-12 flex flex-col gap-10 justify-center">
          <div>
            <h4 className="flex items-center gap-3 font-bold uppercase tracking-wider mb-3 text-[#4fc3f7] text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Contactos
            </h4>
            <p className="text-gray-100 font-medium">geral@projeto.pt</p>
            <p className="text-gray-100 font-medium">suporte@projeto.pt</p>
          </div>

          <div>
            <h4 className="flex items-center gap-3 font-bold uppercase tracking-wider mb-3 text-[#4fc3f7] text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Localização
            </h4>
            <p className="text-gray-100 font-medium">Universidade do Minho, Gualtar</p>
            <p className="text-gray-100 font-medium">4710-057 Braga, Portugal</p>
          </div>

          <div>
            <h4 className="flex items-center gap-3 font-bold uppercase tracking-wider mb-3 text-[#4fc3f7] text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Horário
            </h4>
            <p className="text-gray-100 font-medium">Seg – Sex ...... 10:00 – 18:00</p>
            <p className="text-gray-100 font-medium">Sáb, Dom ....... Fechado</p>
          </div>
        </div>
      </div>

      {/* The Overlapping White Form Card */}
      <div className="md:absolute right-0 top-1/2 md:-translate-y-1/2 w-full md:w-[55%] bg-white p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-xl mt-8 md:mt-0 z-10">
        <h2 className="text-[#1c2a39] text-4xl font-bold mt-0 mb-10 uppercase tracking-tighter">Contact Us</h2>
        
        <form className="flex flex-col gap-10">
          <input 
            type="text" 
            placeholder="Enter your Name" 
            className="w-full bg-transparent border-0 border-b-[1.5px] border-gray-300 py-2 focus:outline-none focus:border-[#4fc3f7] transition-colors rounded-none placeholder-gray-400 text-gray-800 text-lg" 
          />
          
          <input 
            type="email" 
            placeholder="Enter a valid email address" 
            className="w-full bg-transparent border-0 border-b-[1.5px] border-gray-300 py-2 focus:outline-none focus:border-[#4fc3f7] transition-colors rounded-none placeholder-gray-400 text-gray-800 text-lg" 
          />
          
          <textarea 
            rows="3" 
            placeholder="Enter your message" 
            className="w-full bg-transparent border-0 border-b-[1.5px] border-gray-300 py-2 focus:outline-none focus:border-[#4fc3f7] transition-colors rounded-none placeholder-gray-400 text-gray-800 text-lg resize-none"
          ></textarea>
          
          <button 
            type="button" 
            className="border-2 border-[#1c2a39] text-[#1c2a39] font-bold uppercase px-12 py-3.5 tracking-widest hover:bg-[#1c2a39] hover:text-white transition-all self-start mt-4 text-sm cursor-pointer"
          >
            Submit
          </button>
        </form>
      </div>

    </section>
  );
}
