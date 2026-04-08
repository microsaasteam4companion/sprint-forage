import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle2, Circle, AlertTriangle, GitBranch, Rocket,
  MessageSquare, Send, Paperclip, ExternalLink, Zap,
  Code2, Palette, Database as DbIcon, MoreHorizontal, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, updateDoc, doc, serverTimestamp, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { checkRepoCommits } from "@/lib/github";
import { toast } from "sonner";

const statusIcon = (status: string) => {
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === "in-progress") return <Clock className="w-4 h-4 text-karma" />;
  return <Circle className="w-4 h-4 text-muted-foreground" />;
};

const priorityColor = (p: string) => {
  if (p === "high") return "text-destructive";
  if (p === "medium") return "text-karma";
  return "text-muted-foreground";
};

const SprintTab = ({ profile, user }: { profile: any, user: any }) => {
  const [team, setTeam] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    deployUrl: "",
    approaches: "",
    challenges: ""
  });

  useEffect(() => {
    const uid = profile?.uid || user?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "teams"), where("members", "array-contains", uid));
    const unsubscribeTeam = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sortedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        const currentTeam = sortedDocs[0];
        setTeam(currentTeam);

        // Listen for Tasks
        const tasksQ = query(collection(db, "teams", currentTeam.id, "tasks"), orderBy("createdAt", "asc"));
        onSnapshot(tasksQ, (taskSnap) => {
          setTasks(taskSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Listen for Chat
        const chatQ = query(collection(db, "teams", currentTeam.id, "chat"), orderBy("createdAt", "asc"), limit(50));
        onSnapshot(chatQ, (chatSnap) => {
          setMessages(chatSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

      } else {
        setTeam(null);
      }
      setLoading(false);
    });

    return () => unsubscribeTeam();
  }, [profile?.uid, user?.uid]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !team) return;
    try {
      await addDoc(collection(db, "teams", team.id, "chat"), {
        text: newMessage,
        senderUid: profile?.uid,
        senderName: profile?.displayName || "Anon",
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (e) {
      toast.error("Message failed");
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !team) return;
    try {
      await addDoc(collection(db, "teams", team.id, "tasks"), {
        title: newTask.title,
        status: "todo",
        assignee: "Team",
        priority: newTask.priority,
        createdAt: serverTimestamp()
      });
      setShowTaskModal(false);
      setNewTask({ title: "", priority: "medium" });
      toast.success("Task Forged!");
    } catch (e) {
      toast.error("Failed to add task");
    }
  };

  const updateTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!team) return;
    const nextStatus = currentStatus === "todo" ? "in-progress" : currentStatus === "in-progress" ? "done" : "todo";
    await updateDoc(doc(db, "teams", team.id, "tasks", taskId), { status: nextStatus });
  };

  const startSubmission = () => {
    if (!team || submitting) return;
    setShowSubmitModal(true);
  };

  const handleFinalSubmission = async () => {
    if (!submissionData.deployUrl || !submissionData.deployUrl.includes("http")) {
       toast.error("Valid live URL is required!");
       return;
    }
    
    setSubmitting(true);
    try {
      const repoName = team.repoUrl.split("/").pop();
      toast.info("Step 1/3: Verifying Proof of Work on GitHub...");
      
      let commitsCount = 0;
      try {
        commitsCount = await checkRepoCommits(repoName);
      } catch (err) {
        console.warn("GitHub API Check Failed", err);
      }
      
      if (commitsCount < 10) {
         toast.error(`Submission Rejected: Only ${commitsCount} commits found. Need at least 10 valid commits!`);
         setSubmitting(false);
         return;
      }

      // 2. Update Team Status & Attach Deploy URL + Journey
      await updateDoc(doc(db, "teams", team.id), { 
        status: "completed",
        submittedAt: serverTimestamp(),
        deployUrl: submissionData.deployUrl,
        approaches: submissionData.approaches,
        challenges: submissionData.challenges
      });
      
      // 3. Reward teammates (+500 Karma each) and update Streak/Heatmap array
      const todayISO = new Date().toISOString();
      for (const memberUid of team.members) {
        const userRef = doc(db, "users", memberUid);
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) return;
          const currentKarma = userDoc.data().karma || 0;
          const currentProjects = userDoc.data().projectsCount || 0;
          const currentStreak = userDoc.data().streak || 0;
          const completedDates = userDoc.data().completedProjectDates || [];
          
          transaction.update(userRef, { 
            karma: currentKarma + 500,
            projectsCount: currentProjects + 1,
            streak: currentStreak + 1,
            completedProjectDates: [...completedDates, todayISO],
          });
        });
      }
      
      toast.success("Golden Sprint! +10 Valid Commits tracked. +500 Karma added to all teammates.");
    } catch (e) {
      console.error(e);
      toast.error("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Searching for Team...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-12 text-center border-dashed border-2 border-border/50">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No Active Sprint Match</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm leading-relaxed">
          You haven't been matched for a team yet. Joining the Forge requires a manual draw or a weekly scheduled match.
        </p>
        <div className="flex flex-col items-center gap-4">
           <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-mono">
             Status: READY FOR MATCHING
           </div>
        </div>
      </motion.div>
    );
  }

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const progress = Math.round((doneTasks / tasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 relative overflow-hidden ring-1 ring-primary/20">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-primary uppercase tracking-widest">{team.forgeTeamName || "Active Squad"}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{team.projectName || "New Sprint Project"}</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">{team.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={team.repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary font-mono text-xs hover:bg-primary/30 transition-all shadow-glow hover:scale-105 active:scale-95"
              >
                <GitBranch className="w-4 h-4" /> REPOSITORY
              </a>
              <Button 
                onClick={startSubmission} 
                className="bg-primary text-primary-foreground hover:glow-primary font-bold shadow-glow"
              >
                Submit Project
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 bg-secondary flex-1" />
            <span className="font-mono text-sm text-primary font-bold">{progress}%</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-mono">
            <span>{doneTasks}/{tasks.length} tasks done</span>
            <span>·</span>
            <span>{team.members?.length || 0} contributors</span>
            <span>·</span>
            <span className="text-success font-bold">{team.status?.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>

      {/* Rich Brief & Teammate Roster */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Project Brief */}
        <div className="lg:col-span-3 bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" /> Project Brief & Architecture
          </h3>
          {team.problem ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">The Problem</h4>
                <p className="text-sm text-foreground leading-relaxed">{team.problem}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Expected Outcome</h4>
                  <p className="text-sm text-foreground leading-relaxed">{team.expectedOutcome}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Success Criteria</h4>
                  <p className="text-sm text-foreground leading-relaxed">{team.successCriteria}</p>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Required Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {team.techStack?.map((tech: string) => (
                    <span key={tech} className="px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-foreground border border-border/50 shadow-sm">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Legacy project format. Brief not generated.</p>
          )}
        </div>

        {/* Teammate Roster */}
        <div className="lg:col-span-1 bg-card border border-border/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Team Roster
          </h3>
          <div className="space-y-4">
            {(team.memberDetails || []).length > 0 ? (
              team.memberDetails.map((member: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shadow-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate w-[90px] md:w-[120px]">{member.name}</p>
                    <p className="text-[10px] font-mono font-medium text-muted-foreground tracking-tight">{member.role}</p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback for legacy formatted teams before memberDetails existed
              team.memberNames?.map((name: string, i: number) => {
                const roles = ["Frontend Architect", "Backend Systems", "Full-Stack Maker", "Design & Ops"];
                const role = roles[i % roles.length];
                return (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shadow-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate w-[90px] md:w-[120px]">{name}</p>
                      <p className="text-[10px] font-mono font-medium text-muted-foreground tracking-tight">{role}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Task Board */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground text-sm tracking-tight mb-1">Task Pipeline</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <GitBranch className="w-3.5 h-3.5" />
                <span>main · continuously integrated</span>
              </div>
            </div>
            
            <form 
              onSubmit={(e) => { e.preventDefault(); addTask(); }}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <input
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="Quick add task..."
                className="flex-1 md:w-48 bg-secondary/50 border border-border/50 text-sm px-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" className="bg-foreground text-background font-medium h-8 rounded-md px-3 shadow-sm">
                Add
              </Button>
            </form>
          </div>

          {["todo", "in-progress", "done"].map(status => {
            const statusTasks = tasks.filter(t => t.status === status);
            const label = status === "in-progress" ? "In Progress" : status === "todo" ? "To Do" : "Done";
            return (
              <motion.div key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusIcon(status)}
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground font-mono">({statusTasks.length})</span>
                  </div>
                </div>
                <div className="divide-y divide-border/20">
                  {statusTasks.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground italic">No tasks yet</div>
                  ) : statusTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => updateTaskStatus(task.id, task.status)}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-colors group cursor-pointer"
                    >
                      {statusIcon(task.status)}
                      <span className={`text-sm flex-1 ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {task.title}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{task.assignee}</span>
                      <MoreHorizontal className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Team Chat */}
        <div className="lg:col-span-2">
          <div className="glass rounded-xl flex flex-col h-[500px]">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Team Chat</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">{team.members?.length || 0} online</span>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                  Start the conversation...
                </div>
              ) : messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.senderUid === profile?.uid ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-lg flex-shrink-0">{msg.senderUid === profile?.uid ? "🟢" : "🔵"}</span>
                  <div className={`max-w-[80%] ${msg.senderUid === profile?.uid ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-0.5 justify-end">
                      <span className="text-xs font-mono text-muted-foreground">{msg.senderName}</span>
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-sm ${
                      msg.senderUid === profile?.uid
                        ? "bg-primary/15 text-foreground border border-primary/20"
                        : "bg-secondary/50 text-foreground"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-3 border-t border-border/30">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button type="submit" className="text-primary hover:text-primary/80">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-lg p-8 rounded-3xl border-primary/20 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Rocket className="w-32 h-32" />
            </div>
            
            <h3 className="text-2xl font-black text-foreground mb-1">Final Mission Report</h3>
            <p className="text-xs text-muted-foreground mb-8 uppercase font-bold tracking-widest">Submit your Forge product to the community</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Live Deployment URL (Vercel/Render)</label>
                <input 
                  value={submissionData.deployUrl}
                  onChange={e => setSubmissionData({...submissionData, deployUrl: e.target.value})}
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none transition-all"
                  placeholder="https://neuro-mesh.vercel.app"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">The Approach (How did you build it?)</label>
                <textarea 
                  value={submissionData.approaches}
                  onChange={e => setSubmissionData({...submissionData, approaches: e.target.value})}
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none transition-all min-h-[100px] resize-none"
                  placeholder="e.g. We implemented a decentralized node map using CRDTs to manage state..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">The Challenges (What blocked you?)</label>
                <textarea 
                  value={submissionData.challenges}
                  onChange={e => setSubmissionData({...submissionData, challenges: e.target.value})}
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none transition-all min-h-[100px] resize-none"
                  placeholder="e.g. Dealing with network jitter during multi-node synchronization was tricky..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold uppercase text-xs" onClick={() => setShowSubmitModal(false)}>Back to Forge</Button>
                <Button 
                  disabled={submitting}
                  onClick={handleFinalSubmission}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl h-12 font-black uppercase text-xs shadow-glow hover:glow-primary"
                >
                  {submitting ? "Verifying Commits..." : "Transmit Project"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SprintTab;
