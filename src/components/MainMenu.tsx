import { Users, Wifi, Settings, BarChart2, DollarSign, Megaphone } from 'lucide-react';

interface MainMenuProps {
  onLocalPlay: () => void;
  onOnlinePlay: () => void;
}

export default function MainMenu({ onLocalPlay, onOnlinePlay }: MainMenuProps) {
  // Generate random blocky "stars" or particles for the background
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 4 + 2}s`,
    animationDelay: `${Math.random() * 2}s`,
    size: Math.random() > 0.7 ? '4px' : '2px',
  }));

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col items-center justify-center font-vt323 selection:bg-pink-600 selection:text-white">
      {/* Background with subtle grid pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Pixelated Background Particles */}
      <div className="absolute inset-0 z-0 opacity-40">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-cyan-600 animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Main Content Container - styled like a giant Card */}
      <div className="z-10 flex flex-col items-center w-full max-w-2xl px-6 py-12 relative">
        
        {/* Card Border / Frame decorations */}
        <div className="absolute inset-0 border-[6px] border-cyan-800 bg-slate-800/80 backdrop-blur-xs shadow-[0_0_30px_rgba(34,211,238,0.15)] z-[-1]">
           <div className="absolute top-2 left-2 w-4 h-4 bg-pink-600"></div>
           <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-400"></div>
           <div className="absolute bottom-2 left-2 w-4 h-4 bg-cyan-400"></div>
           <div className="absolute bottom-2 right-2 w-4 h-4 bg-pink-600"></div>
           <div className="absolute inset-4 border-2 border-slate-700/50"></div>
        </div>
        
        {/* Title / Logo */}
        <div className="mb-12 mt-4 transform transition-transform hover:-translate-y-2 duration-200">
          <div className="relative">
            <h1 className="text-pink-600 text-4xl md:text-5xl font-press-start text-center drop-shadow-[4px_4px_0_rgba(15,23,42,1)]" style={{ WebkitTextStroke: '1px #4ae1de' }}>
              IMPOSTOR
            </h1>
            <h2 className="text-cyan-400 text-xl font-vt323 tracking-widest text-center mt-2 uppercase">
              // Version 1.0.0
            </h2>
          </div>
        </div>

        {/* Action Cards (Buttons) */}
        <div className="w-full flex flex-col sm:flex-row gap-6 mb-10 px-4 justify-center">
          {/* Local Card */}
          <button 
            onClick={onLocalPlay}
            className="group relative flex-1 bg-slate-900 border-4 border-cyan-700 p-6 text-white text-3xl transition-all duration-200 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-[0_10px_0_#0f172a,0_10px_20px_rgba(34,211,238,0.4)] active:translate-y-0 active:shadow-[0_2px_0_#0f172a] outline-none focus:border-pink-500"
          >
            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 opacity-50 group-hover:opacity-100 group-hover:bg-pink-500"></div>
            <span className="font-press-start text-lg block mb-2 text-cyan-300 group-hover:text-white transition-colors">LOCAL</span>
            <span className="font-vt323 text-slate-400 text-xl group-hover:text-cyan-100">Play offline with friends</span>
          </button>
          
          {/* Online Card */}
          <button 
            onClick={onOnlinePlay}
            className="group relative flex-1 bg-slate-900 border-4 border-pink-700 p-6 text-white text-3xl transition-all duration-200 hover:-translate-y-2 hover:border-pink-500 hover:shadow-[0_10px_0_#0f172a,0_10px_20px_rgba(236,72,153,0.4)] active:translate-y-0 active:shadow-[0_2px_0_#0f172a] outline-none focus:border-cyan-400"
          >
            <div className="absolute top-1 right-1 w-2 h-2 bg-pink-500 opacity-50 group-hover:opacity-100 group-hover:bg-cyan-400"></div>
            <span className="font-press-start text-lg block mb-2 text-pink-400 group-hover:text-white transition-colors">ONLINE</span>
            <span className="font-vt323 text-slate-400 text-xl group-hover:text-pink-100">Connect to servers</span>
          </button>
        </div>

        {/* Secondary Menu Text Buttons */}
        <div className="flex gap-8 mb-10 font-press-start text-xs md:text-sm text-slate-500">
          <button className="hover:text-cyan-400 transition-colors uppercase relative group">
            <span className="group-hover:opacity-100 opacity-0 absolute -left-4 text-pink-500">▶</span> How to Play
          </button>
          <button className="hover:text-cyan-400 transition-colors uppercase relative group">
            <span className="group-hover:opacity-100 opacity-0 absolute -left-4 text-pink-500">▶</span> Free Play
          </button>
        </div>

        {/* Bottom Small Icons */}
        <div className="flex justify-center gap-6 mt-4">
          {[Megaphone, Settings, BarChart2, DollarSign].map((Icon, idx) => (
            <button key={idx} className="bg-slate-900 border-2 border-cyan-800 p-3 hover:bg-slate-700 hover:border-cyan-400 hover:-translate-y-1 transition-all text-cyan-500 hover:text-white active:translate-y-0">
              <Icon size={24} strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
