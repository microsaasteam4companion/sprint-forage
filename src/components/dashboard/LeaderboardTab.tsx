import { motion } from "framer-motion";
import { Trophy, Flame, Medal, ArrowUp, ArrowDown, Minus, Crown, Star, Filter, Ghost } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

const filters = ["All Time", "This Season", "This Week", "By Region"];

const LeaderboardTab = () => {
  const [activeFilter, setActiveFilter] = useState("This Season");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("karma", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        prevRank: index + 1, // Snapshot doesn't give us delta yet
        name: dataToName(doc.data()),
        karma: doc.data().karma || 0,
        projects: doc.data().projectsCount || 0,
        streak: doc.data().streak || 0,
        rating: doc.data().rating || 0,
        badge: index === 0 ? "👑" : index === 1 ? "🔥" : index === 2 ? "⚡" : "",
        revealed: (doc.data().karma || 0) > 5000,
      }));
      setLeaderboard(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const dataToName = (data: any) => {
    if (data.karma > 5000) return data.githubUsername;
    // Anonymize low karma users
    return `Anon_${data.uid?.substring(0, 4)}`;
  };

  const rankChange = (curr: number, prev: number) => {
    if (prev > curr) return <ArrowUp className="w-3 h-3 text-success" />;
    if (prev < curr) return <ArrowDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-karma" /> Global Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Top engineers ranked by Karma score · Updated live</p>
        </div>
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <Button
              key={f}
              variant={activeFilter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(f)}
              className={activeFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
            >
              {f}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Top 3 podium */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((entry, i) => (
          <div key={entry.rank} className={`glass rounded-xl p-5 text-center ${i === 0 ? "border-karma/30 ring-1 ring-karma/20" : ""}`}>
            <div className="text-3xl mb-2">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
            </div>
            <div className="font-mono text-sm font-bold text-foreground mb-1">
              {entry.name}
            </div>
            <div className="font-mono text-2xl font-black text-karma mb-2">{entry.karma.toLocaleString()}</div>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono">{entry.projects} ships</span>
              <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-destructive" />{entry.streak}w</span>
              <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-karma" />{entry.rating}</span>
            </div>
          </div>
        ))}
        {leaderboard.length === 0 && !loading && (
           <div className="col-span-3 py-12 text-center text-muted-foreground font-mono italic">
             No legends forged yet. Be the first.
           </div>
        )}
      </motion.div>

      {/* Full list */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30 grid grid-cols-12 text-xs text-muted-foreground font-mono">
          <span className="col-span-1">Rank</span>
          <span className="col-span-1">Δ</span>
          <span className="col-span-3">Engineer</span>
          <span className="col-span-2 text-right">Karma</span>
          <span className="col-span-2 text-right">Projects</span>
          <span className="col-span-1 text-right">Streak</span>
          <span className="col-span-2 text-right">Rating</span>
        </div>
        {leaderboard.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`px-4 py-3 grid grid-cols-12 items-center text-sm hover:bg-secondary/20 transition-colors border-b border-border/10 ${
              entry.highlight ? "bg-primary/5 border-l-2 border-l-primary" : ""
            }`}
          >
            <span className={`col-span-1 font-mono font-bold ${entry.rank <= 3 ? "text-karma" : "text-muted-foreground"}`}>
              #{entry.rank}
            </span>
            <span className="col-span-1">{rankChange(entry.rank, entry.prevRank)}</span>
            <div className="col-span-3 flex items-center gap-2">
              <span className={`font-mono ${entry.highlight ? "text-primary font-bold" : "text-foreground"}`}>
                {entry.name}
              </span>
              {entry.badge && <span className="text-sm">{entry.badge}</span>}
              {entry.revealed && <span className="text-[9px] px-1 py-0.5 rounded bg-success/10 text-success border border-success/20 font-bold">REVEALED</span>}
            </div>
            <span className="col-span-2 text-right font-mono font-bold text-karma">{entry.karma.toLocaleString()}</span>
            <span className="col-span-2 text-right font-mono text-muted-foreground">{entry.projects}</span>
            <span className="col-span-1 text-right font-mono text-muted-foreground flex items-center justify-end gap-1">
              <Flame className="w-3 h-3 text-destructive" />{entry.streak}
            </span>
            <span className="col-span-2 text-right font-mono text-muted-foreground flex items-center justify-end gap-1">
              <Star className="w-3 h-3 text-karma" />{entry.rating}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LeaderboardTab;
