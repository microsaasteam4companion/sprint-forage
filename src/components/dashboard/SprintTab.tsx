import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle2, Circle, AlertTriangle, GitBranch,
  MessageSquare, Send, Paperclip, ExternalLink, Zap,
  Code2, Palette, Database as DbIcon, MoreHorizontal
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

  const submitProject = async () => {
    if (!team || submitting) return;
    
    // 1. Proof of Work Check
    setSubmitting(true);
    try {
      // Extract repo name from URL (e.g. from https://github.com/org/sprint-abc)
      const repoName = team.repoUrl.split("/").pop();
      toast.info("Step 1/3: Verifying Proof of Work on GitHub...");
      const commitsCount = await checkRepoCommits(repoName);
      
      console.log("Verified Commits:", commitsCount);
      if (commitsCount < 5) {
        toast.error(`Submission Rejected: Only ${commitsCount} commits found. Need at least 5!`, {
          description: "Keep forging! Pushing zero/empty code is bad for your Karma."
        });
        setSubmitting(false);
        return;
      }

      if (!confirm(`Success! Verified ${commitsCount} commits. Finish sprint and claim +500 Karma?`)) {
        setSubmitting(false);
        return;
      }

      // 2. Update Team Status
      await updateDoc(doc(db, "teams", team.id), { 
        status: "completed",
        submittedAt: serverTimestamp()
      });
      
      // 3. Reward teammates (+500 Karma each) and set cooldown
      for (const memberUid of team.members) {
        const userRef = doc(db, "users", memberUid);
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) return;
          const currentKarma = userDoc.data().karma || 0;
          const currentProjects = userDoc.data().projectsCount || 0;
          transaction.update(userRef, { 
            karma: currentKarma + 500,
            projectsCount: currentProjects + 1,
            lastSprintSubmittedAt: serverTimestamp() // Mandatory Cooldown Trigger
          });
        });
      }
      
      toast.success("Golden Sprint! +500 Karma added to all teammates.");
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
                <span className="font-mono text-xs text-primary uppercase tracking-widest">Active Team Sprint</span>
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
                onClick={submitProject} 
                disabled={submitting || team.status === "completed"} 
                className="bg-primary text-primary-foreground hover:glow-primary font-bold shadow-glow"
              >
                {submitting ? "Submitting..." : team.status === "completed" ? "Submitted" : "Submit Project"} 
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Task Board */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm">Task Board</h3>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowTaskModal(true)} variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold px-2">
                Add Task
              </Button>
              <GitBranch className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">main · synced</span>
            </div>
          </div>

          {["in-progress", "todo", "done"].map(status => {
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
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl relative border-primary/20 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Forge New Task</h3>
            <div className="space-y-4">
              <input 
                placeholder="Task description..." 
                className="w-full bg-secondary/30 border border-border/50 rounded-lg p-3 text-sm outline-none focus:ring-1 ring-primary transition-all"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
              />
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Priority</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTask({...newTask, priority: p})}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold border transition-all ${
                        newTask.priority === p 
                          ? "bg-primary/20 border-primary text-primary shadow-glow" 
                          : "bg-secondary/40 border-border/50 text-muted-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowTaskModal(false)} variant="ghost" className="flex-1">Cancel</Button>
                <Button onClick={addTask} className="flex-1 bg-primary font-bold shadow-glow">Add Objective</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SprintTab;
