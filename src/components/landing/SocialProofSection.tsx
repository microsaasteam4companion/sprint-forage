import { motion } from "framer-motion";

const testimonials = [
  {
    text: "I got matched with a backend dev from Nigeria and a designer from Japan. We shipped a Kanban board in 5 days. Now we're cofounders.",
    author: "Anon_Forge_182",
    karma: 6200,
    badge: "🔥 12-week streak",
  },
  {
    text: "Three companies reached out to me after seeing my Karma score and shipped projects. ForgeTeam is my resume now.",
    author: "███████",
    karma: 8400,
    badge: "💼 Hired via Forge",
  },
  {
    text: "I used to struggle finding motivated peers in college. Here, everyone shows up because the deadline is real.",
    author: "Anon_Dev_77",
    karma: 3800,
    badge: "🎓 Student",
  },
];

const counters = [
  { value: "47", label: "Countries", suffix: "" },
  { value: "94", label: "Avg. completion rate", suffix: "%" },
  { value: "3.2", label: "Avg team rating", suffix: "/5" },
  { value: "12", label: "Recruiters active", suffix: "+" },
];

const SocialProofSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">From the Forge</span>
          <h2 className="text-4xl md:text-5xl font-black mt-3 text-foreground">
            Real Stories. Anonymous Heroes.
          </h2>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-4 mb-20">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6 flex flex-col justify-between hover:border-primary/20 transition-colors"
            >
              <p className="text-sm text-foreground/80 leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-foreground">{t.author}</span>
                  <p className="text-[10px] text-karma font-mono">{t.karma.toLocaleString()} κ</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground font-mono">{t.badge}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Counter strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {counters.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black font-mono text-primary">
                {c.value}<span className="text-lg text-muted-foreground">{c.suffix}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
