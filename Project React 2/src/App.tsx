import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

interface Advice {
  id: number;
  advice: string;
}

// Background Particles Component for the parallax effect
const Particles = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  // Generate random fixed positions for particles
  const particles = useRef(
    Array.from({ length: 15 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      depth: Math.random() * 3 + 1, // depth factor for parallax
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-cyan-400 opacity-40 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: (mousePosition.x / window.innerWidth - 0.5) * p.depth * -50,
            y: (mousePosition.y / window.innerHeight - 0.5) * p.depth * -50,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using a random string to prevent caching issues which are common with this API
      const response = await fetch(`https://api.adviceslip.com/advice?t=${new Date().getTime()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAdvice(data.slip);
    } catch (err) {
      setError("Lost connection to the station. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();

    // Track mouse position for parallax
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Background Parallax Particles */}
      <Particles mousePosition={mousePosition} />

      <main className="z-10 flex flex-col items-center justify-center w-full max-w-3xl px-6">
        <div className="h-[400px] flex items-center justify-center w-full relative">
          <AnimatePresence mode="wait">
            {loading ? (
              // Loading state: Spinning galaxy / loader
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                >
                  <Loader2 size={48} className="mb-4" />
                </motion.div>
                <p className="tracking-[0.2em] uppercase text-sm font-medium">Calibrating Antigravity...</p>
              </motion.div>
            ) : error ? (
              // Error state: Floating notification
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-md"
              >
                <AlertCircle />
                <p>{error}</p>
              </motion.div>
            ) : advice ? (
              // Quote Card
              <motion.div
                key={advice.id}
                // Enter from bottom with spring, exit to top weightlessly
                initial={{ opacity: 0, y: 300, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -500, scale: 0.8 }}
                transition={{
                  type: "spring",
                  bounce: 0.4,
                  duration: 1.2,
                }}
                className="absolute w-full"
              >
                {/* Continuous floating animation wrapper */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 1, -1, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-full flex justify-center"
                >
                  <div className="relative group max-w-2xl w-full">
                    {/* Outer Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    
                    {/* Glassmorphic Card */}
                    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 md:p-14 shadow-2xl overflow-hidden flex flex-col items-center text-center">
                      
                      {/* Decorative internal elements */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                      
                      {/* Draggable Text Container */}
                      <motion.div
                        className="cursor-grab active:cursor-grabbing"
                        // Draggable constraints & physics
                        drag
                        dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
                        dragElastic={0.4}
                        // Gives a slow drift effect when released instead of instant snap
                        dragTransition={{ bounceStiffness: 100, bounceDamping: 20 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <p className="text-2xl md:text-4xl font-medium tracking-wide leading-relaxed text-slate-100 drop-shadow-md">
                          &quot;{advice.advice}&quot;
                        </p>
                        <p className="text-cyan-400/70 text-sm mt-6 tracking-[0.3em] uppercase font-semibold">
                          Slip #{advice.id}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Antigravity Button */}
        <motion.button
          onClick={fetchAdvice}
          disabled={loading}
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(34, 211, 238, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          className="mt-12 group relative px-8 py-4 bg-slate-800/50 backdrop-blur-md border border-cyan-500/30 rounded-full text-cyan-50 uppercase tracking-[0.2em] text-sm font-semibold overflow-hidden transition-colors hover:bg-slate-800/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Button Hover effect background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          
          <span className="relative flex items-center gap-3">
            <Sparkles size={18} className="text-cyan-400 group-hover:animate-pulse" />
            Generate New Advice
          </span>
        </motion.button>
      </main>

      {/* Foreground subtle overlay for vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/50 to-slate-950"></div>
    </div>
  );
}
