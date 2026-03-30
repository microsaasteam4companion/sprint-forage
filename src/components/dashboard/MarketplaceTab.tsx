import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, DollarSign, Clock, Users, ArrowUpRight, Star, Filter, Tag, TrendingUp, Sparkles, Plus, Lock, ShieldCheck, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, where, getDocs, limit, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

const MarketplaceTab = ({ profile }: { profile: any }) => {
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newBounty, setNewBounty] = useState({ title: "", description: "", budget: "", skills: "", deadline: "2w" });

  const isAdmin = profile?.isAdmin || profile?.uid === "5Nh85kUF2VUMLHSC2REYnLYlOqr2";
  const isVerified = (profile?.karma || 0) >= 10000 || profile?.isVerified || isAdmin;

  useEffect(() => {
    const q = query(collection(db, "bounties"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBounties(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("isVerified", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVerifiedCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const totalPool = bounties.reduce((sum, b) => {
    const budget = b.budget?.toString().replace(/[$,]/g, "") || "0";
    return sum + (parseFloat(budget) || 0);
  }, 0);

  const avgReward = bounties.length > 0 ? totalPool / bounties.length : 0;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  };

  const handlePostBounty = async () => {
    if (!newBounty.title || !newBounty.description || !newBounty.budget) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const skillsArray = newBounty.skills ? newBounty.skills.split(",").map(s => s.trim()) : ["React", "AI"];
      await addDoc(collection(db, "bounties"), {
        ...newBounty,
        skills: skillsArray,
        postedBy: profile?.displayName || "Anonymous",
        postedByUid: profile?.uid,
        createdAt: serverTimestamp(),
        status: "OPEN",
        applicants: 0,
        isHot: true
      });
      setShowPostModal(false);
      setNewBounty({ title: "", description: "", budget: "", skills: "", deadline: "2w" });
      toast.success("Bounty Posted Successfully!");
    } catch (e) {
      toast.error("Failed to post bounty");
    }
  };

  const handleParticipate = async (bounty: any) => {
    if (!isVerified) {
       toast.info("Participating in Premium Bounties requires a $10 fee for Unverified users.");
       window.open("/#pricing", "_self");
       return;
    }

    if (!profile?.uid || !bounty.postedByUid) return;
    if (profile.uid === bounty.postedByUid) {
      toast.error("You cannot apply to your own bounty.");
      return;
    }

    try {
      // Check for existing conversation
      const participants = [profile.uid, bounty.postedByUid].sort();
      const q = query(
        collection(db, "conversations"),
        where("participants", "==", participants),
        limit(1)
      );
      
      const snap = await getDocs(q);
      let convoId;

      if (snap.empty) {
        // Create new request
        const docRef = await addDoc(collection(db, "conversations"), {
          participants,
          participantsNames: [profile.displayName || "Anonymous", bounty.postedBy || "Founder"],
          status: "request",
          lastMessage: `Applied for bounty: ${bounty.title}`,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        convoId = docRef.id;

        // Add initial message
        await addDoc(collection(db, "conversations", convoId, "messages"), {
          text: `Hi! I'm interested in your bounty: "${bounty.title}". I'd like to contribute.`,
          senderUid: profile.uid,
          senderName: profile.displayName || "Anonymous",
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Application Sent! Networking request added to your Messages.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send application.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> Bounty Marketplace
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Founders post · Elite teams build · Verified payoffs</p>
        </div>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <Button onClick={() => setShowPostModal(true)} className="bg-primary hover:glow-primary font-bold shadow-glow rounded-xl px-6 h-11 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Post Bounty
            </Button>
          ) : (
            <div className="text-[10px] bg-secondary/50 px-3 py-1.5 rounded-lg text-muted-foreground border border-border/50 font-mono italic">
              Verification required to post
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Bounties", value: bounties.length.toString(), icon: ShoppingBag },
          { label: "Total Pool", value: formatCurrency(totalPool), icon: DollarSign },
          { id: "verified-teams", label: "Verified Teams", value: (verifiedCount || 0).toString(), icon: Users },
          { label: "Avg. Reward", value: formatCurrency(avgReward), icon: TrendingUp },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-4 text-center border-primary/5">
            <stat.icon className="w-4 h-4 text-primary mx-auto mb-2" />
            <div className="font-mono text-xl font-bold text-foreground">{stat.value}</div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {bounties.length > 0 ? bounties.map((bounty, i) => (
          <motion.div
            key={bounty.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-5 border-border/10 relative overflow-hidden group transition-all ${!isVerified && !isAdmin ? "" : "hover:border-primary/30"}`}
          >
            {/* Blurring for Unverified users */}
            {!isVerified && !isAdmin && (
               <div className="absolute inset-x-0 bottom-0 top-[60px] z-20 backdrop-blur-md bg-background/40 flex flex-col items-center justify-center p-6 text-center">
                  <Lock className="w-6 h-6 text-muted-foreground mb-2" />
                  <p className="text-xs font-bold text-foreground">Content Blurred</p>
                  <p className="text-[10px] text-muted-foreground mb-4">Verification Gold required to view technical details</p>
                  <Button onClick={() => handleParticipate(bounty)} size="sm" className="bg-primary text-[10px] font-black h-8 px-4 rounded-lg">
                    PARTICIPATE FOR $10
                  </Button>
               </div>
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{bounty.title}</h3>
                  <div className="flex gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-black tracking-widest uppercase">
                      {bounty.status}
                    </span>
                    {bounty.isHot && <span className="text-[10px] animate-bounce">🔥</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-black text-karma">{bounty.budget}</div>
                  <span className="text-[9px] text-muted-foreground font-bold italic uppercase tracking-tighter">Gold Escrow</span>
                </div>
              </div>
              
              <div className={!isVerified && !isAdmin ? "filter blur-lg select-none" : ""}>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {bounty.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(bounty.skills || ["React", "AI"]).map((s: string) => (
                    <span key={s} className="text-[9px] px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/20">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{bounty.deadline || "2w"}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{bounty.applicants || 0} teams</span>
                </div>
                <Button 
                   onClick={() => handleParticipate(bounty)}
                   className="h-8 rounded-lg bg-primary text-[10px] font-black uppercase px-4 shadow-glow"
                >
                  Apply
                </Button>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-12 text-center glass rounded-3xl border-dashed border-border/40">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">Marketplace Empty</h3>
            <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto mt-2">No active bounties at the moment. Check back soon for new technical missions.</p>
          </div>
        )}
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass w-full max-w-lg p-8 rounded-3xl relative border-primary/20 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-50" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/20 pb-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40">
                     <Plus className="w-5 h-5 text-primary" />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold">New Marketplace Bounty</h3>
                     <p className="text-xs text-muted-foreground">Post a technical challenge for the Forge teams</p>
                   </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Bounty Title</label>
                    <input 
                      placeholder="e.g. build a high-performance Rust WASM module" 
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm outline-none focus:ring-1 ring-primary transition-all"
                      value={newBounty.title}
                      onChange={e => setNewBounty({...newBounty, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Mission Requirements</label>
                    <textarea 
                      rows={3}
                      placeholder="Technical specs, expected output, and tech stack..." 
                      className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm outline-none focus:ring-1 ring-primary transition-all resize-none"
                      value={newBounty.description}
                      onChange={e => setNewBounty({...newBounty, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Tech Stack</label>
                      <input 
                        placeholder="React, Rust, WASM" 
                        className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm outline-none focus:ring-1 ring-primary transition-all"
                        value={newBounty.skills}
                        onChange={e => setNewBounty({...newBounty, skills: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Deadline</label>
                      <input 
                        placeholder="2w / 4w / 2mo" 
                        className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm outline-none focus:ring-1 ring-primary transition-all"
                        value={newBounty.deadline}
                        onChange={e => setNewBounty({...newBounty, deadline: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Bounty Budget</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <input 
                        placeholder="1,500" 
                        className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-mono outline-none focus:ring-1 ring-primary transition-all"
                        value={newBounty.budget}
                        onChange={e => setNewBounty({...newBounty, budget: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border/20">
                   <Button onClick={() => setShowPostModal(false)} variant="ghost" className="flex-1 rounded-xl">Discard</Button>
                   <Button onClick={handlePostBounty} className="flex-1 bg-primary font-black shadow-glow rounded-xl h-12">FORGE BOUNTY</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplaceTab;
