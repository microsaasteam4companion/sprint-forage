import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { 
  LayoutDashboard, Trophy, Users, MessageSquare, ShoppingBag,
  Rocket, Package, Settings as SettingsIcon, LogOut, Ghost, 
  Github, ShieldCheck, Briefcase, Menu, X, ArrowRight, Activity, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { triggerManualDraw } from "@/lib/teaming";
import { toast } from "sonner";

import SprintTab from "@/components/dashboard/SprintTab";
import LeaderboardTab from "@/components/dashboard/LeaderboardTab";
import CommunityTab from "@/components/dashboard/CommunityTab";
import MessagesTab from "@/components/dashboard/MessagesTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import ShipmentsTab from "@/components/dashboard/ShipmentsTab";

const sidebarItems = [
  { id: "home", label: "Overview", icon: LayoutDashboard },
  { id: "sprint", label: "Active Sprint", icon: Rocket },
  { id: "shipments", label: "Shipments", icon: Package },
  { id: "community", label: "Network", icon: Users },
  { id: "leaderboard", label: "Rankings", icon: Trophy },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const SprintHeatmap = ({ profile }: { profile: any }) => {
  // Convert completed dates to a Set of normalized date strings (YYYY-MM-DD)
  const activitySet = new Set(
    (profile?.completedProjectDates || []).map((dateStr: any) => {
      // Assuming dates might be stored as strings or Firestore Timestamps
      const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr?.toDate?.() || new Date();
      return d.toISOString().split('T')[0];
    })
  );

  return (
    <div className="mt-8 overflow-hidden w-full border-t border-border/40 pt-6">
      <div className="flex items-center justify-between mb-4 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Activity History</span>
      </div>
      <div className="flex flex-row-reverse gap-1 overflow-x-auto pb-2 scrollbar-none w-full max-w-full">
        {Array.from({ length: 52 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1 min-w-[10px]">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              // Calculate the exact date for this cell (going backwards from today)
              const daysAgo = (weekIndex * 7) + dayIndex;
              const date = new Date();
              date.setDate(date.getDate() - daysAgo);
              const dateString = date.toISOString().split('T')[0];
              
              const hasActivity = activitySet.has(dateString);
              
              return (
                <div 
                  key={dayIndex} 
                  title={hasActivity ? `Projects Completed on ${dateString}` : dateString}
                  className={`w-[10px] h-[10px] rounded-[2px] transition-colors ${hasActivity ? "bg-primary shadow-[0_0_5px_rgba(var(--primary),0.3)]" : "bg-secondary/40"}`} 
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardHome = ({ profile, user, setActiveTab }: { profile: any, user: any, setActiveTab: (t: string) => void }) => {
  // 7-Day Lock Logic based on starting a sprint
  const lastSprintStart = profile?.lastSprintStartedAt?.toDate?.() || 0;
  const cooldownMs = 7 * 24 * 60 * 60 * 1000; // 7 Days
  const isLockedInSprint = lastSprintStart && (Date.now() - lastSprintStart.getTime() < cooldownMs);
  const lockDaysLeft = isLockedInSprint ? Math.ceil((cooldownMs - (Date.now() - lastSprintStart.getTime())) / 86400000) : 0;
  
  const getBadge = (count: number) => {
    if (count >= 10) return { label: "Expert", color: "text-primary bg-primary/10" };
    if (count >= 3) return { label: "Intermediate", color: "text-karma bg-karma/10" };
    return { label: "Beginner", color: "text-muted-foreground bg-secondary" };
  };
  const badge = getBadge(profile?.projectsCount || 0);

  return (
    <div className="space-y-6 max-w-full w-full overflow-hidden">
      
      {/* Action Banner */}
      <div className="bg-card border border-border/50 rounded-xl p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${isLockedInSprint ? "bg-destructive/10 text-destructive" : profile?.registeredForNextSprint ? "bg-success/10 text-success animate-pulse" : "bg-primary/10 text-primary"}`}>
            {isLockedInSprint ? <ShieldCheck className="w-6 h-6" /> : profile?.registeredForNextSprint ? <Zap className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {isLockedInSprint 
                ? "You're Locked in a Sprint" 
                : profile?.registeredForNextSprint 
                  ? "You're registered for the next Sprint." 
                  : "Registration is open."}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLockedInSprint 
                ? `Active deployment phase. Focus on your project. Lock lifts in ${lockDaysLeft} days.` 
                : "Join a cross-functional team and ship in 48 hours."}
            </p>
          </div>
        </div>
        
        {isLockedInSprint ? (
          <Button onClick={() => setActiveTab("sprint")} variant="outline" className="w-full md:w-auto rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10">Go to Active Sprint</Button>
        ) : !profile?.registeredForNextSprint ? (
          <Button onClick={() => setDoc(doc(db, "users", profile.uid || user.uid), { registeredForNextSprint: true }, { merge: true })} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm">
            Join Upcoming Sprint
          </Button>
        ) : (
          <Button onClick={async () => {
             const teamId = await triggerManualDraw(profile.uid || user.uid);
             if (teamId) setActiveTab("sprint");
          }} className="w-full md:w-auto bg-foreground hover:bg-foreground/90 text-background font-medium rounded-lg shadow-sm">
            Trigger Match Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Metrics Grid */}
        <div className="bg-card border border-border/50 rounded-xl p-6 lg:col-span-2 shadow-sm w-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-semibold tracking-tight text-foreground">Performance Overview</h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${badge.color}`}>{badge.label}</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Karma</p>
              <div className="flex items-center gap-2">
                <Ghost className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold tracking-tight text-foreground">{profile?.karma || 0}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Shipped</p>
              <span className="text-2xl font-bold tracking-tight text-foreground">{profile?.projectsCount || 0}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Streak</p>
              <span className="text-2xl font-bold tracking-tight text-foreground">{profile?.streak || 0}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rating</p>
              <span className="text-2xl font-bold tracking-tight text-foreground">{profile?.rating || "N/A"}</span>
            </div>
          </div>
          
          <SprintHeatmap profile={profile} />
        </div>
        
        {/* Account Details / Status */}
        <div className="bg-card border border-border/50 rounded-xl p-6 col-span-1 shadow-sm w-full flex flex-col">
          <h3 className="text-base font-semibold tracking-tight text-foreground mb-6">Account Features</h3>
          <div className="flex-1 space-y-1">
             {[
               { icon: ShieldCheck, label: "Identity Verification", status: profile?.isVerified ? "Verified" : "Unverified" },
               { icon: Users, label: "Elite Networking", status: (profile?.karma >= 50000 || profile?.isVerified) ? "Active" : "Locked" },
               { icon: Briefcase, label: "Bounty Board", status: profile?.isVerified ? "Premium" : "Standard" },
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                 <div className="flex items-center gap-3">
                   <item.icon className="w-4 h-4 text-muted-foreground" />
                   <span className="text-sm font-medium text-foreground">{item.label}</span>
                 </div>
                 <span className={`text-xs font-medium ${item.status === "Verified" || item.status === "Active" || item.status === "Premium" ? "text-primary" : "text-muted-foreground"}`}>
                   {item.status}
                 </span>
               </div>
             ))}
          </div>
          <Button variant="outline" onClick={() => window.open("/#pricing", "_self")} className="w-full mt-6 rounded-lg font-medium">
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading, loginWithGitHub, logout } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (authLoading || profileLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-mono text-sm tracking-widest text-muted-foreground uppercase">Loading Platform</div>;
  if (!user) return <div className="min-h-screen bg-background flex items-center justify-center p-6"><Button onClick={loginWithGitHub} size="lg" className="bg-foreground text-background font-medium gap-3 rounded-lg px-8"><Github className="w-5 h-5" /> Sign in with GitHub</Button></div>;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden w-full max-w-[100vw]">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="relative w-64 max-w-[80vw] h-full flex flex-col border-r border-border bg-card shadow-2xl">
            <div className="p-6 flex items-center justify-between border-b border-border/50">
              <div className="font-bold tracking-tight text-lg text-foreground">Sprint<span className="text-primary">Forge</span></div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Menu</div>
              {sidebarItems.map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
                  {item.icon && <item.icon className="w-4 h-4 shrink-0" />}<span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-6 border-t border-border/50"><button onClick={logout} className="w-full flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground font-medium"><LogOut className="w-4 h-4 shrink-0" /> Log Out</button></div>
          </motion.aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl shrink-0 h-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="p-6 border-b border-border/50 hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-3 relative z-10">
           <img src="/logo.png" alt="SprintForge Logo" className="w-7 h-7 rounded shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
           <span className="font-black tracking-tighter text-xl italic text-foreground">SPRINT<span className="text-primary underline decoration-primary/50">FORGE</span></span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto w-full relative z-10">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-3">Main Navigation</div>
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === item.id ? "bg-primary/10 text-primary font-bold shadow-[inset_4px_0_0_0_rgba(var(--primary-rgb),1)] bg-gradient-to-r from-primary/10 to-transparent" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground font-medium"}`}>
              {item.icon && <item.icon className={`w-4 h-4 shrink-0 ${activeTab === item.id ? "animate-pulse" : ""}`} />}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-border/50 relative z-10 flex flex-col gap-2">
           <button onClick={async () => {
             try {
                // Remove the 7-day lock
                await setDoc(doc(db, "users", profile?.uid), { lastSprintStartedAt: null, registeredForNextSprint: false }, { merge: true });
                
                // Need to import getDocs, query, collection, where, deleteDoc dynamically here to avoid cluttering top imports
                const { getDocs, query, collection, where, deleteDoc } = await import("firebase/firestore");
                const q = query(collection(db, "teams"), where("members", "array-contains", profile?.uid));
                const snap = await getDocs(q);
                for (const d of snap.docs) {
                   await deleteDoc(doc(db, "teams", d.id));
                }
                toast.success("Successfully HARD RESET profile and teams for fresh testing!");
                window.location.reload();
             } catch(e) { toast.error("Failed to reset test account.") }
           }} className="w-full flex items-center justify-center p-2 rounded bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-widest hover:bg-destructive/20 transition-colors">
              Reset Testing Lock
           </button>
           <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground font-bold transition-colors"><LogOut className="w-4 h-4 shrink-0" /> Terminate Link</button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background relative flex flex-col w-full">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur px-6 py-4 flex justify-between items-center shrink-0 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"><Menu className="w-5 h-5" /></button>
            <h1 className="text-lg font-semibold text-foreground tracking-tight truncate">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
             <div className="hidden sm:flex text-sm text-muted-foreground font-medium items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <Ghost className="w-3.5 h-3.5 text-primary" /> {profile?.karma || 0} Karma
             </div>
             <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {profile?.githubUsername?.charAt(0)?.toUpperCase() || "U"}
             </div>
          </div>
        </header>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === "home" && <DashboardHome profile={profile} user={user} setActiveTab={setActiveTab} />}
              {activeTab === "sprint" && <SprintTab profile={profile} user={user} />}
              {activeTab === "shipments" && <ShipmentsTab profile={profile} />}
              {activeTab === "community" && <CommunityTab profile={profile} user={user} />}
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
