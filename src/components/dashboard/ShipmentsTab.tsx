import { motion } from "framer-motion";
import { Rocket, Heart, MessageSquare, ArrowUpRight, Search, Filter, TrendingUp, Sparkles, ShoppingCart, Verified } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from "sonner";

const ShipmentsTab = ({ profile }: { profile: any }) => {
  const [ships, setShips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAppeal = (projectName: string) => {
     toast.success(`Appeal to Buy Sent for ${projectName}!`, {
       description: "The team has been notified. They will contact you to discuss the sale details."
     });
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

      <div className="grid grid-cols-1 gap-6">
        {ships.length === 0 && !loading && (
          <div className="py-20 text-center glass rounded-3xl border-dashed border-border/40">
             <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
             <p className="text-muted-foreground font-mono italic">No projects have reached the 'Shipped' status yet. Be the first!</p>
          </div>
        )}

        {ships.map((ship, i) => (
          <motion.div
            key={ship.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-3xl p-6 border-primary/5 hover:border-primary/20 transition-all flex flex-col md:flex-row gap-6 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Project Preview Badge */}
            <div className="w-full md:w-64 h-48 bg-secondary/30 rounded-2xl flex items-center justify-center border border-border/50 relative overflow-hidden flex-shrink-0">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
               <Sparkles className="w-12 h-12 text-primary/20" />
               <div className="absolute bottom-3 left-3 flex items-center gap-2">
                 <Verified className="w-4 h-4 text-success" />
                 <span className="text-[10px] font-bold text-success uppercase">Verified Forge Product</span>
               </div>
            </div>

            <div className="flex-1 flex flex-col relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-1">{ship.projectName}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {ship.memberNames?.map((name: string, idx: number) => (
                        <div key={idx} className="w-6 h-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px] font-bold italic" title={name}>
                          {name[0]}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Forged by Team {ship.teamId}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <button 
                     onClick={() => toggleUpvote(ship.id, ship.upvotes || [])}
                     className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all ${
                       ship.upvotes?.includes(profile?.uid) 
                         ? "bg-primary text-primary-foreground border-primary shadow-glow" 
                         : "bg-secondary/40 border-border/50 text-muted-foreground hover:border-primary/40"
                     }`}
                   >
                     <p className="text-lg font-black">{ship.upvotes?.length || 0}</p>
                     <Heart className={`w-3 h-3 ${ship.upvotes?.includes(profile?.uid) ? "fill-current" : ""}`} />
                   </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-2xl">
                 {ship.description || "A revolutionary technical product forged during a high-intensity Sprintforge event."}
              </p>

              <div className="mt-auto flex items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                   <Button variant="outline" className="h-10 rounded-xl px-5 text-sm font-bold border-primary/20 text-primary hover:bg-primary/10">
                      <ArrowUpRight className="w-4 h-4 mr-2" /> View GitHub Repo
                   </Button>
                   <Button onClick={() => handleAppeal(ship.projectName)} className="h-10 rounded-xl px-5 text-sm font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Appeal to Buy
                   </Button>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-karma/10 rounded-lg text-karma text-[10px] font-black uppercase">
                   Product Score: {((ship.upvotes?.length || 0) * 10).toLocaleString()}
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ShipmentsTab;
