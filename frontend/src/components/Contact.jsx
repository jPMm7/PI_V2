export default function Contact() {
  return (
    <section id="contact" className="relative mt-24 mb-24 flex items-center">
      
      {/* Background colored block */}
      <div className="bg-[#2c5364] rounded-xl w-full md:w-[85%] flex flex-col md:flex-row shadow-xl overflow-hidden min-h-[500px]">
        
        {/* Left Side (Text Info) */}
        <div className="w-full md:w-[45%] text-white p-10 md:p-12 flex flex-col gap-10 justify-center">
          

          <div>
            <h4 className="flex items-center gap-3 font-bold uppercase tracking-wider mb-3 text-[#4fc3f7] text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Localização
            </h4>
            <p className="text-gray-100 font-medium">Universidade do Porto, FEUP</p>
            <p className="text-gray-100 font-medium">4200-465 Porto, Portugal</p>
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
