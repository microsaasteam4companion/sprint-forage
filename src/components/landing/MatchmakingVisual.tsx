import { motion } from "framer-motion";
import { Shuffle, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const skills = ["React", "Node.js", "Python", "PostgreSQL", "DevOps", "UI/UX", "Go", "Redis", "Docker", "TypeScript"];
const names = ["Anon_42", "███████", "DevForge_99", "Builder_X", "CodeAnon_7", "███████", "Forge_11"];
const cities = ["Mumbai", "Lagos", "Berlin", "Tokyo", "São Paulo", "Toronto", "Seoul"];

const MatchmakingVisual = () => {
  const [phase, setPhase] = useState(0);
  const [slots, setSlots] = useState([
    { name: "???", skill: "???", city: "???" },
    { name: "???", skill: "???", city: "???" },
    { name: "???", skill: "???", city: "???" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === 0) {
      setSlots([
        { name: "???", skill: "???", city: "???" },
        { name: "???", skill: "???", city: "???" },
        { name: "???", skill: "???", city: "???" },
      ]);
    } else if (phase === 1) {
      const shuffleInterval = setInterval(() => {
        setSlots(prev => prev.map(() => ({
          name: names[Math.floor(Math.random() * names.length)],
          skill: skills[Math.floor(Math.random() * skills.length)],
          city: cities[Math.floor(Math.random() * cities.length)],
        })));
      }, 100);
      setTimeout(() => clearInterval(shuffleInterval), 2000);
      return () => clearInterval(shuffleInterval);
    } else if (phase === 2) {
      setSlots([
        { name: "Anon_42", skill: "React", city: "Mumbai 🇮🇳" },
        { name: "Builder_X", skill: "Node.js", city: "Lagos 🇳🇬" },
        { name: "███████", skill: "PostgreSQL", city: "Berlin 🇩🇪" },
      ]);
    }
  }, [phase]);

  const roleColors = ["text-primary", "text-accent", "text-karma"];
  const roleLabels = ["Frontend", "Backend", "Database"];

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-accent tracking-widest uppercase">The Algorithm</span>
          <h2 className="text-4xl md:text-5xl font-black mt-3 text-foreground">
            Watch the Forge Fire
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Every Monday, our matching engine pairs complementary skills from across the globe.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Status bar */}
          <div className="glass rounded-t-2xl p-4 border-b-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className={`w-4 h-4 ${phase === 1 ? "text-accent animate-spin" : phase >= 2 ? "text-success" : "text-muted-foreground"}`} />
              <span className="font-mono text-xs text-foreground">
                {phase === 0 && "Waiting for participants..."}
                {phase === 1 && "MATCHING IN PROGRESS..."}
                {phase === 2 && "TEAM FORGED ✓"}
                {phase === 3 && "Sprint starting in 3...2...1..."}
              </span>
            </div>
            {phase >= 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-success"
              >
                <Sparkles className="w-3 h-3" />
                <span className="font-mono text-xs">Team #4,291</span>
              </motion.div>
            )}
          </div>

          {/* Slots */}
          <div className="glass rounded-b-2xl border-t-0 divide-y divide-border/30">
            {slots.map((slot, i) => (
              <motion.div
                key={i}
                className="p-4 flex items-center gap-4"
                animate={phase === 1 ? { x: [0, -3, 3, 0] } : {}}
                transition={{ duration: 0.15, repeat: phase === 1 ? Infinity : 0 }}
              >
                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border/50 ${phase >= 2 ? "border-primary/30" : ""}`}>
                  <span className={`font-mono text-xs font-bold ${roleColors[i]}`}>
                    {phase >= 2 ? roleLabels[i].slice(0, 2).toUpperCase() : "??"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm ${phase >= 2 ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                      {slot.name}
                    </span>
                    {phase >= 2 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary ${roleColors[i]}`}
                      >
                        {roleLabels[i]}
                      </motion.span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{slot.skill}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{slot.city}</span>
                  </div>
                </div>
                {phase >= 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-2 h-2 rounded-full bg-success"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MatchmakingVisual;
