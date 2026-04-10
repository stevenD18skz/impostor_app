import { Users, Wifi, Settings, BarChart2, DollarSign, Megaphone } from 'lucide-react';

interface MainMenuProps {
  onLocalPlay: () => void;
  onOnlinePlay: () => void;
}

export default function MainMenu({ onLocalPlay, onOnlinePlay }: MainMenuProps) {
  // Generate random stars for the background
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 2}s`,
    animationDelay: `${Math.random() * 2}s`,
  }));

  return (
    <div className="relative w-full h-screen bg-linear-to-br from-indigo-900 to-cyan-900 overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Starry Background */}
      <div className="absolute inset-0 z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full opacity-50 animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              width: Math.random() > 0.5 ? '2px' : '3px',
              height: Math.random() > 0.5 ? '2px' : '3px',
              animationDuration: star.animationDuration,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center w-full max-w-md px-4 py-8">
        
        {/* Title / Logo */}
        <div className="mb-16 transform transition-transform hover:scale-105 duration-300">
          <h1 className="text-white text-6xl md:text-7xl font-black tracking-widest text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            EL IMPOSTOR
          </h1>
        </div>

        {/* Main Buttons Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={onLocalPlay}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl py-6 px-2 text-xl md:text-2xl font-bold uppercase tracking-wider hover:bg-white/20 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300"
          >
            Local
          </button>
          
          <button 
            onClick={onOnlinePlay}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl py-6 px-2 text-xl md:text-2xl font-bold uppercase tracking-wider hover:bg-white/20 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300"
          >
            En Línea
          </button>
          
          <button 
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white/50 rounded-2xl py-6 px-2 text-lg md:text-xl font-bold uppercase tracking-wider transition-all duration-300 cursor-not-allowed"
          >
            Como Jugar
          </button>
          
          <button 
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white/50 rounded-2xl py-6 px-2 text-lg md:text-xl font-bold uppercase tracking-wider transition-all duration-300 cursor-not-allowed"
          >
            Modo Libre
          </button>
        </div>

        {/* Bottom Circular Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all text-white">
            <Megaphone size={28} />
          </button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all text-white">
            <Settings size={28} />
          </button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all text-white">
            <BarChart2 size={28} />
          </button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all text-white">
            <DollarSign size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
