import { motion } from "framer-motion";
import { Trophy, Flame, ArrowUpRight } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "███████", karma: 4820, projects: 23, streak: 12, badge: "🔥" },
  { rank: 2, name: "███████", karma: 4215, projects: 19, streak: 8, badge: "⚡" },
  { rank: 3, name: "███████", karma: 3980, projects: 21, streak: 10, badge: "🎯" },
  { rank: 4, name: "AnonymousForge_42", karma: 3650, projects: 17, streak: 6, badge: "" },
  { rank: 5, name: "███████", karma: 3420, projects: 15, streak: 9, badge: "" },
];

const LeaderboardPreview = () => {
  return (
    <section id="leaderboard" className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-destructive/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-mono text-destructive">LIVE EVERY SUNDAY</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground">
            The Sunday Reveal
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Top projects go live. Community votes. Identities stay hidden until you earn the reveal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-karma" />
              <span className="font-mono text-sm font-bold text-foreground">Week 47 Leaderboard</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Season 4</span>
          </div>

          <div className="divide-y divide-border/30">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="px-4 py-3 flex items-center gap-4 hover:bg-secondary/30 transition-colors group"
              >
                <span className={`font-mono text-sm font-bold w-6 text-center ${
                  entry.rank === 1 ? "text-karma" : entry.rank === 2 ? "text-muted-foreground" : entry.rank === 3 ? "text-warning" : "text-muted-foreground"
                }`}>
                  #{entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground truncate">{entry.name}</span>
                    {entry.badge && <span className="text-sm">{entry.badge}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="w-3 h-3 text-destructive" />
                  <span className="font-mono">{entry.streak}w</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">{entry.projects} ships</div>
                <div className="font-mono text-sm font-bold text-karma">{entry.karma.toLocaleString()}</div>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-border/50 text-center">
            <span className="text-xs text-muted-foreground font-mono">Identity reveals at 5,000 Karma</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
