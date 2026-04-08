import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, Heart, MessageSquare, ArrowUpRight, Search, 
  Filter, TrendingUp, Sparkles, ShoppingCart, Verified,
  Triangle, Code2, Users, X, Github, AlertTriangle, Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from "sonner";

const ShipmentsTab = ({ profile }: { profile: any }) => {
  const [ships, setShips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShip, setSelectedShip] = useState<any>(null);

  useEffect(() => {
    // We'll fetch completed teams or a dedicated 'ships' collection
    // For now, let's look for completed teams
    const q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setShips(data.filter(t => t.status === "completed")); 
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleUpvote = async (shipId: string, upvotes: string[]) => {
    if (!profile?.uid) return;
    const isUpvoted = upvotes?.includes(profile.uid);
    try {
      await updateDoc(doc(db, "teams", shipId), {
        upvotes: isUpvoted ? arrayRemove(profile.uid) : arrayUnion(profile.uid)
      });
    } catch (e) {
      toast.error("Failed to upvote");
    }
  };

  const handleAddSuggestion = async (e: any, shipId: string) => {
    e.preventDefault();
    const text = e.target.elements.suggestion.value;
    if (!text.trim() || !profile) return;
    
    try {
      await updateDoc(doc(db, "teams", shipId), {
        suggestions: arrayUnion({
          text,
          author: profile.githubUsername || profile.displayName || "Anonymous",
          createdAt: new Date().toISOString()
        })
      });
      e.target.reset();
      toast.success("Suggestion added!");
    } catch(err) {
      toast.error("Failed to add suggestion.");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" /> Shipped Projects
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Products forged in the heat of a sprint · Upvote the best · Buy the future</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase">Trending Today</span>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-1 border border-border/40 rounded-xl overflow-hidden bg-card/20 divide-y divide-border/40">
        {ships.length === 0 && !loading && (
          <div className="py-20 text-center">
             <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
             <p className="text-muted-foreground font-mono italic">No projects have reached the 'Shipped' status yet. Be the first!</p>
          </div>
        )}

        {ships.map((ship, i) => {
          const isUpvoted = ship.upvotes?.includes(profile?.uid);
          return (
            <motion.div
              key={ship.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-6 p-4 hover:bg-white/5 transition-all group cursor-pointer"
              onClick={() => setSelectedShip(ship)}
            >
              <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/40 min-w-[50px] bg-secondary/20 group-hover:border-primary/40 transition-colors"
                onClick={(e) => { e.stopPropagation(); toggleUpvote(ship.id, ship.upvotes || []); }}
              >
                <Triangle className={`w-3 h-3 mb-1 ${isUpvoted ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs font-bold ${isUpvoted ? "text-primary" : "text-foreground"}`}>{ship.upvotes?.length || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{ship.projectName}</h3>
                <p className="text-xs text-muted-foreground truncate">{ship.description || "A revolutionary tech sprint project."}</p>
              </div>
              <div className="hidden md:flex -space-x-2">
                 {(ship.memberDetails || ship.memberNames || []).slice(0, 4).map((member: any, idx: number) => {
                   const name = typeof member === 'string' ? member : member.name;
                   return (
                    <div key={idx} className="w-7 h-7 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px] font-bold" title={name}>
                      {name?.[0].toUpperCase()}
                    </div>
                   );
                 })}
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          );
        })}
      </div>

      {/* Ship Detail Modal */}
      <AnimatePresence>
        {selectedShip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass w-full max-w-5xl max-h-full overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedShip(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col lg:flex-row min-h-full">
                {/* Left Side: Preview & Data */}
                <div className="flex-1 p-6 md:p-10 border-r border-white/5">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="flex -space-x-3">
                        {(selectedShip.memberDetails || []).map((m: any, i: number) => (
                           <div key={i} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary shadow-lg" title={`${m.name} (${m.role})`}>
                              {m.name[0]}
                           </div>
                        ))}
                      </div>
                      <div className="ml-2">
                        <h4 className="text-sm font-bold text-foreground">{selectedShip.forgeTeamName || `Team ${selectedShip.teamId}`}</h4>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Sprint Completed</p>
                      </div>
                   </div>

                   <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">{selectedShip.projectName}</h2>
                   <p className="text-lg text-muted-foreground leading-relaxed mb-8">{selectedShip.description}</p>

                   {/* Preview Iframe */}
                   {selectedShip.deployUrl && (
                     <div className="mb-8 p-1 bg-gradient-to-br from-primary/30 to-transparent rounded-2xl">
                        <div className="w-full aspect-video md:aspect-[21/9] bg-background rounded-xl overflow-hidden border border-white/10 shadow-inner relative group">
                           <iframe 
                             src={selectedShip.deployUrl} 
                             className="w-full h-full object-cover transition-opacity duration-500" 
                             sandbox="allow-scripts allow-same-origin"
                             title={`${selectedShip.projectName} live preview`}
                           />
                           <a href={selectedShip.deployUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <Button className="font-bold gap-2 rounded-xl"><Rocket className="w-4 h-4" /> Open Full Production</Button>
                           </a>
                        </div>
                     </div>
                   )}

                   <div className="space-y-6">
                      <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm">
                         <h5 className="text-[10px] uppercase font-black text-primary mb-3 tracking-widest flex items-center gap-1.5"><Zap className="w-3 h-3" /> The Overall Idea</h5>
                         <p className="text-sm leading-relaxed text-foreground font-medium">{selectedShip.problem || "Solving a core technical challenge in the ecosystem."}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 shadow-sm">
                           <h5 className="text-[10px] uppercase font-black text-muted-foreground mb-3 tracking-widest flex items-center gap-1.5"><Rocket className="w-3 h-3" /> Outcome</h5>
                           <p className="text-sm leading-relaxed text-foreground/80">{selectedShip.expectedOutcome || "Project objective achieved."}</p>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 shadow-sm">
                           <h5 className="text-[10px] uppercase font-black text-muted-foreground mb-3 tracking-widest flex items-center gap-1.5"><Verified className="w-3 h-3" /> Criteria Met</h5>
                           <p className="text-sm leading-relaxed text-foreground/80">{selectedShip.successCriteria || "All sprint requirements satisfied."}</p>
                        </div>
                      </div>

                      {/* Team Journey Section */}
                      <div className="space-y-4">
                         <h4 className="text-xs font-black uppercase tracking-widest text-foreground/50 ml-1">Team's Journey</h4>
                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 bg-secondary/20 rounded-2xl border border-border/40">
                               <h5 className="text-[10px] uppercase font-black text-foreground mb-2 flex items-center gap-1.5">Approach</h5>
                               <p className="text-xs leading-relaxed text-muted-foreground italic">{selectedShip.approaches || "Standard agile development approach."}</p>
                            </div>
                            <div className="p-5 bg-destructive/5 rounded-2xl border border-destructive/10">
                               <h5 className="text-[10px] uppercase font-black text-destructive mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Challenges</h5>
                               <p className="text-xs leading-relaxed text-muted-foreground italic">{selectedShip.challenges || "No major blockers encountered."}</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 shadow-sm">
                         <h5 className="text-[10px] uppercase font-black text-muted-foreground mb-3 tracking-widest flex items-center gap-1.5"><Code2 className="w-3 h-3" /> Tech Stack</h5>
                         <div className="flex flex-wrap gap-2">
                            {selectedShip.techStack?.map((t: string) => (
                              <span key={t} className="px-3 py-1 bg-secondary rounded-lg text-xs font-bold border border-border/40">{t}</span>
                            ))}
                         </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4">
                         <Button onClick={() => toggleUpvote(selectedShip.id, selectedShip.upvotes || [])} className={`flex-1 h-12 rounded-2xl font-black uppercase text-xs gap-3 font-mono tracking-widest ${selectedShip.upvotes?.includes(profile?.uid) ? "bg-primary text-primary-foreground shadow-glow" : "bg-card border border-border/50 text-foreground hover:bg-secondary"}`}>
                            <Triangle className={`w-4 h-4 ${selectedShip.upvotes?.includes(profile?.uid) ? "fill-current" : ""}`} /> 
                            Support Transmission [{selectedShip.upvotes?.length || 0}]
                         </Button>
                         {selectedShip.repoUrl && (
                           <a href={selectedShip.repoUrl} target="_blank" rel="noopener noreferrer">
                             <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/10 hover:bg-white/10 shrink-0"><Github className="w-5 h-5" /></Button>
                           </a>
                         )}
                      </div>
                   </div>
                </div>

                {/* Right Side: Suggestions */}
                <div className="w-full lg:w-96 p-6 md:p-10 bg-white/[0.02] overflow-y-auto">
                   <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                      <MessageSquare className="w-5 h-5 text-primary" /> Suggestions
                   </h3>
                   
                   <div className="space-y-4 mb-8">
                     {(!selectedShip.suggestions || selectedShip.suggestions.length === 0) ? (
                        <div className="py-10 text-center flex flex-col items-center gap-3">
                           <Sparkles className="w-8 h-8 text-muted-foreground/20" />
                           <p className="text-xs text-muted-foreground italic">No technical feedback yet.</p>
                        </div>
                     ) : (
                        selectedShip.suggestions.map((s: any, idx: number) => (
                           <div key={idx} className="bg-secondary/30 rounded-2xl p-4 border border-border/40 shadow-sm">
                             <div className="flex items-center gap-2 mb-2">
                               <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">{s.author[0]}</div>
                               <span className="text-[10px] font-bold text-foreground/80">{s.author}</span>
                             </div>
                             <p className="text-sm text-foreground/90 leading-relaxed font-medium">{s.text}</p>
                           </div>
                        ))
                     )}
                   </div>

                   <div className="sticky bottom-0 bg-transparent pt-4">
                      <form onSubmit={(e) => { handleAddSuggestion(e, selectedShip.id); }} className="space-y-3">
                        <textarea 
                          name="suggestion"
                          rows={3}
                          placeholder="What could be improved?" 
                          className="w-full bg-background border border-border/50 rounded-2xl p-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner resize-none appearance-none"
                        />
                        <Button type="submit" className="w-full h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-foreground text-background hover:bg-foreground/90">Post Suggestion</Button>
                      </form>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShipmentsTab;
