import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { 
  LayoutDashboard, Trophy, Users, MessageSquare, ShoppingBag,
  Rocket, Sparkles, Package, Settings as SettingsIcon, LogOut, Ghost, 
  Github, ShieldCheck, Zap, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { triggerManualDraw } from "@/lib/teaming";
import { toast } from "sonner";

import SprintTab from "@/components/dashboard/SprintTab";
import LeaderboardTab from "@/components/dashboard/LeaderboardTab";
import CommunityTab from "@/components/dashboard/CommunityTab";
import MarketplaceTab from "@/components/dashboard/MarketplaceTab";
import MessagesTab from "@/components/dashboard/MessagesTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import ShipmentsTab from "@/components/dashboard/ShipmentsTab";

const sidebarItems = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "sprint", label: "Sprint", icon: Rocket },
  { id: "shipments", label: "Shipments", icon: Package },
  { id: "community", label: "Community", icon: Users },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const SprintHeatmap = ({ profile }: { profile: any }) => {
  const activityDates = profile?.completedProjectDates || [];
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        <span>Forge Activity</span>
        <div className="flex gap-1 items-center">
          <span>Less</span>
          {[20, 40, 60, 80].map(v => <div key={v} className={`w-2 h-2 rounded-sm bg-success/${v}`} />)}
          <span>More</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: 52 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => {
              const hasActivity = activityDates.length > 0 && Math.random() > 0.95; 
              return <div key={j} className={`w-2 h-2 rounded-sm transition-colors ${hasActivity ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-secondary/20"}`} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardHome = ({ profile, user, setActiveTab }: { profile: any, user: any, setActiveTab: (t: string) => void }) => {
  const lastSubmitted = profile?.lastSprintSubmittedAt?.toDate?.() || 0;
  const cooldownMs = 7 * 24 * 60 * 60 * 1000;
  const isRestricted = lastSubmitted && (Date.now() - lastSubmitted.getTime() < cooldownMs);
  const daysLeft = isRestricted ? Math.ceil((cooldownMs - (Date.now() - lastSubmitted.getTime())) / 86400000) : 0;
  
  const getBadge = (count: number) => {
    if (count >= 10) return { label: "EXPERT", color: "text-primary border-primary/20 bg-primary/5" };
    if (count >= 3) return { label: "INTERMEDIATE", color: "text-karma border-karma/20 bg-karma/5" };
    return { label: "BEGINNER", color: "text-muted-foreground border-border/20 bg-secondary/10" };
  };
  const badge = getBadge(profile?.projectsCount || 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 relative overflow-hidden border-primary/20 shadow-glow">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border ${profile?.registeredForNextSprint ? "bg-success/20 border-success/40 animate-pulse" : "bg-primary/20 border-primary/40"}`}>
              <Rocket className={`w-8 h-8 ${profile?.registeredForNextSprint ? "text-success" : "text-primary"}`} />
            </div>
            <div>
              <h2 className="text-2xl font-black">{profile?.registeredForNextSprint ? "Lobby Active" : "Start a New Sprint"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isRestricted ? `Cooldown: ${daysLeft} days remaining.` : "Join a team of elite developers and ship in 48 hours."}
              </p>
            </div>
          </div>
          {isRestricted ? (
            <Button disabled className="bg-secondary text-muted-foreground font-bold px-10 h-14 rounded-2xl">LOCKED</Button>
          ) : !profile?.registeredForNextSprint ? (
            <Button onClick={() => setDoc(doc(db, "users", profile.uid || user.uid), { registeredForNextSprint: true }, { merge: true })} className="bg-primary hover:glow-primary font-black px-10 h-14 rounded-2xl shadow-glow transition-all">JOIN SPRINT</Button>
          ) : (
            <Button onClick={() => triggerManualDraw(profile.uid || user.uid).then(() => setActiveTab("Current Sprint"))} className="bg-success text-success-foreground font-black px-10 h-14 rounded-2xl shadow-glow">MATCH NOW</Button>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-8 col-span-1 text-center relative overflow-hidden group">
          <div className="absolute top-4 right-4"><span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span></div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6">Forge Pulse</h3>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-karma/5 border-2 border-karma/20 shadow-glow relative mb-8 group-hover:scale-110 transition-transform duration-500">
            <span className="font-mono text-4xl font-black text-karma">{profile?.karma || 0}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-border/20 pt-6">
            <div className="text-center">
              <span className="block text-xl font-black text-foreground">{profile?.projectsCount || 0}</span>
              <span className="text-[10px] text-muted-foreground font-bold">SHIPPED</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-black text-foreground">{profile?.streak || 0}</span>
              <span className="text-[10px] text-muted-foreground font-bold">STREAK</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-black text-foreground">{profile?.rating || 0}</span>
              <span className="text-[10px] text-muted-foreground font-bold">RATING</span>
            </div>
          </div>
          <SprintHeatmap profile={profile} />
        </div>
        
        <div className="glass rounded-3xl p-8 lg:col-span-2 relative overflow-hidden group">
          <h3 className="text-xl font-black mb-6">Elite Status</h3>
          <div className="space-y-4">
             {[
               { icon: ShieldCheck, label: "Verified Gold", status: profile?.isVerified ? "Active" : "Locked", color: "text-success" },
               { icon: MessageSquare, label: "Elite Networking", status: (profile?.karma >= 50000 || profile?.isVerified) ? "Unlocked" : "50k Karma Required" },
               { icon: Briefcase, label: "Bounty Access", status: profile?.isVerified ? "Premium" : "Standard" },
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border/10">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/20"><item.icon className={`w-5 h-5 ${item.status === "Active" || item.status === "Unlocked" || item.status === "Premium" ? "text-primary" : "text-muted-foreground"}`} /></div>
                   <span className="font-bold text-sm">{item.label}</span>
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === "Active" || item.status === "Unlocked" || item.status === "Premium" ? "text-success" : "text-muted-foreground"}`}>
                   {item.status}
                 </span>
               </div>
             ))}
          </div>
          <Button onClick={() => window.open("/#pricing", "_self")} className="w-full mt-6 bg-secondary hover:bg-secondary/80 font-bold h-12 rounded-xl border border-border/50">UPGRADE TO GOLD</Button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading, loginWithGitHub, logout } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("home");
  
  if (authLoading || profileLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-mono">LOADING_FORGE...</div>;
  if (!user) return <div className="min-h-screen bg-background flex items-center justify-center p-6"><Button onClick={loginWithGitHub} size="lg" className="bg-primary font-black gap-3 rounded-2xl h-16 px-10"><Github className="w-6 h-6" /> ENTER THE FORGE</Button></div>;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <aside className="hidden lg:flex w-72 flex-col border-r border-border/30 bg-card/40 backdrop-blur-3xl shrink-0">
        <div className="p-8 border-b border-border/30 font-black tracking-tighter text-2xl italic">FORGE<span className="text-primary underline">TEAM</span></div>
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] transition-all hover:scale-[1.02] ${activeTab === item.id ? "bg-primary text-primary-foreground font-black shadow-glow" : "text-muted-foreground hover:bg-secondary/40 font-bold"}`}>
              {item.icon && <item.icon className="w-4 h-4" />}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-border/30"><button onClick={logout} className="w-full flex items-center gap-3 text-sm text-muted-foreground hover:text-destructive font-black"><LogOut className="w-4 h-4" /> LEAVE FORGE</button></div>
      </aside>
      <main className="flex-1 overflow-auto bg-grid-pattern relative flex flex-col">
        <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-xl px-12 py-5 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-black uppercase tracking-tighter">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center"><Ghost className="w-4 h-4 text-primary" /></div>
              <span className="text-xs font-black font-mono">{profile?.karma || 0} κ</span>
            </div>
            <Button onClick={() => window.open("/#pricing", "_self")} size="sm" className="bg-karma/10 text-karma border border-karma/20 font-black text-[10px] h-8 rounded-lg animate-pulse">+ GET GOLD</Button>
          </div>
        </header>
        <div className="p-12 max-w-7xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.15 }}>
              {activeTab === "home" && <DashboardHome profile={profile} user={user} setActiveTab={setActiveTab} />}
              {activeTab === "sprint" && <SprintTab profile={profile} user={user} />}
              {activeTab === "shipments" && <ShipmentsTab profile={profile} />}
              {activeTab === "community" && <CommunityTab profile={profile} user={user} />}
              {activeTab === "marketplace" && <MarketplaceTab profile={profile} />}
              {activeTab === "leaderboard" && <LeaderboardTab />}
              {activeTab === "messages" && <MessagesTab profile={profile} />}
              {activeTab === "settings" && <SettingsTab profile={profile} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
