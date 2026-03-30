import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Send, MoreHorizontal, Settings, Info, 
  User, Check, Clock, MessageSquare, ShieldCheck, 
  Inbox, UserPlus, Lock, Sparkles, X, Filter,
  Github, Trophy, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { 
  collection, query, where, onSnapshot, orderBy, 
  getDoc, getDocs, doc, addDoc, serverTimestamp, updateDoc, limit 
} from "firebase/firestore";
import { toast } from "sonner";

const ProfilePreview = ({ uid, onClose }: { uid: string, onClose: () => void }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) setUserData(docSnap.data());
      setLoading(false);
    };
    fetchUser();
  }, [uid]);

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-sm p-6 rounded-xl border-primary/20 bg-background/80 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-3xl font-black italic text-primary mb-4 shadow-inner">
             {(userData?.displayName || "Anon")[0]}
          </div>
          <h3 className="text-xl font-black flex items-center gap-2">
            {userData?.displayName || "Anonymous"}
            {userData?.isVerified && <ShieldCheck className="w-4 h-4 text-primary" />}
          </h3>
          <p className="text-xs text-muted-foreground mb-6">@{userData?.githubUsername || "forge_dev"}</p>
          
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <div className="bg-secondary/20 p-3 rounded-lg border border-border/10 text-center">
              <span className="block text-lg font-black text-karma">{userData?.karma || 0}</span>
              <span className="text-[8px] uppercase font-black text-muted-foreground/50 tracking-widest">Karma</span>
            </div>
            <div className="bg-secondary/20 p-3 rounded-lg border border-border/10 text-center">
              <span className="block text-lg font-black text-foreground">{userData?.projectsCount || 0}</span>
              <span className="text-[8px] uppercase font-black text-muted-foreground/50 tracking-widest">Shipped</span>
            </div>
            <div className="bg-secondary/20 p-3 rounded-lg border border-border/10 text-center">
              <span className="block text-lg font-black text-primary">{userData?.streak || 0}</span>
              <span className="text-[8px] uppercase font-black text-muted-foreground/50 tracking-widest">Streak</span>
            </div>
          </div>
          
          <div className="space-y-2 w-full">
            <Button variant="outline" className="w-full rounded-lg h-10 text-[10px] font-black uppercase gap-2 border-border/20 hover:bg-secondary/40"><Github className="w-3.5 h-3.5" /> View Github Profile</Button>
            <Button className="w-full bg-primary font-black uppercase text-[10px] rounded-lg h-10 shadow-glow shadow-primary/20">Forge Together</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MessagesTab = ({ profile }: { profile: any }) => {
  const [activeTab, setActiveTab] = useState<"inbox" | "requests">("inbox");
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [viewingProfileUid, setViewingProfileUid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const isUnlocked = (profile?.karma || 0) >= 50000 || profile?.isVerified;

  // Real-time conversations listener
  useEffect(() => {
    if (!profile?.uid || !isUnlocked) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", profile.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid, isUnlocked]);

  // Real-time messages listener for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "conversations", selectedChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const msg = newMessage;
    setNewMessage("");

    try {
      await addDoc(collection(db, "conversations", selectedChat.id, "messages"), {
        text: msg,
        senderUid: profile.uid,
        senderName: profile.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "conversations", selectedChat.id), {
        lastMessage: msg,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      toast.error("Failed to transmit");
    }
  };

  const handleAcceptRequest = async (convoId: string) => {
     try {
        await updateDoc(doc(db, "conversations", convoId), { status: "active" });
        toast.success("Request Accepted!");
        setSelectedChat(prev => ({ ...prev, status: "active" }));
     } catch (e) {
        toast.error("Failed to accept request.");
     }
  };

  const filterChats = (chats: any[]) => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(c => {
      const otherName = c.participantsNames?.find((n: string) => n !== profile.displayName) || "";
      return (
        otherName.toLowerCase().includes(q) ||
        (c.lastMessage || "").toLowerCase().includes(q)
      );
    });
  };

  const inboxChats = filterChats(conversations.filter(c => c.status !== "request"));
  const requestChats = filterChats(conversations.filter(c => c.status === "request"));

  const displayedChats = activeTab === "inbox" ? inboxChats : requestChats;

  if (!isUnlocked) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 bg-grid-pattern relative overflow-hidden glass rounded-xl border-primary/10">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-50" />
        <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center mb-6 relative border border-border/50">
          <Lock className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-3 uppercase tracking-tighter">Comms Locked</h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-8 leading-relaxed">
          Unlock high-signal direct messaging at <span className="text-primary font-bold">50,000 Karma</span> or with <span className="text-primary font-bold">Verified Gold</span>.
        </p>
        <Button onClick={() => window.open("/#pricing", "_self")} className="bg-primary text-primary-foreground font-bold shadow-glow hover:scale-105 transition-all px-8 rounded-lg h-11 text-xs uppercase tracking-widest">
          Verify Now
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] min-h-[600px] glass rounded-xl border-border/10 overflow-hidden flex shadow-2xl relative bg-card/5 backdrop-blur-3xl">
      <div className="absolute inset-0 bg-primary/5 opacity-10 pointer-events-none" />
      
      {/* Sidebar - Conversation List */}
      <aside className="w-80 md:w-96 border-r border-border/20 flex flex-col bg-background/20 relative z-10 shrink-0">
        <div className="p-5 pb-4 border-b border-border/10">
          <h2 className="text-lg font-black italic tracking-tighter uppercase mb-5">Conversations</h2>
          
          <div className="relative mb-5">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full bg-secondary/30 border border-border/10 rounded-lg py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-1 ring-primary/40 transition-all font-medium" 
            />
          </div>

          <div className="flex bg-secondary/20 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab("inbox")}
              className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "inbox" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-secondary/40"}`}
            >
              Inbox
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "requests" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-secondary/40"}`}
            >
              Requests {requestChats.length > 0 && <span className="ml-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[8px]">{requestChats.length}</span>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none space-y-px">
          {displayedChats.length > 0 ? displayedChats.map((chat: any) => {
            const otherParticipantName = chat.participantsNames?.find((n: string) => n !== profile.displayName) || "Anonymous";
            const otherParticipantUid = chat.participants?.find((p: string) => p !== profile.uid);

            return (
              <button 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-center gap-4 p-4 transition-all relative ${selectedChat?.id === chat.id ? "bg-primary/5 shadow-inner" : "hover:bg-secondary/10"}`}
              >
                {selectedChat?.id === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                <div 
                  className="relative shrink-0" 
                  onClick={(e) => { e.stopPropagation(); setViewingProfileUid(otherParticipantUid); }}
                >
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center border text-xs font-black italic transition-all ${selectedChat?.id === chat.id ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary/40 border-border/10 text-muted-foreground"}`}>
                    {otherParticipantName[0]}
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background shadow-sm" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-black truncate text-foreground">{otherParticipantName}</span>
                    <span className="text-[9px] font-mono text-muted-foreground/60">{chat.updatedAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "now"}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                    {chat.lastMessage || "Awaiting node synchronization..."}
                  </p>
                </div>
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-[9px] font-black uppercase tracking-widest italic">Silent Zone</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Chat Area */}
      <main className="flex-1 flex flex-col bg-card/5 relative z-10">
        {selectedChat ? (
          <>
            <header className="p-4 md:px-8 border-b border-border/10 flex items-center justify-between bg-background/10 backdrop-blur-3xl shrink-0">
              <div className="flex items-center gap-4">
                <div 
                   className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-black italic shrink-0 cursor-pointer hover:bg-primary/20 transition-all shadow-inner"
                   onClick={() => setViewingProfileUid(selectedChat.participants?.find((p: string) => p !== profile.uid))}
                >
                   {(selectedChat.participantsNames?.find((n: string) => n !== profile.displayName) || "A")[0]}
                </div>
                <div className="min-w-0">
                  <h3 
                     className="text-sm font-black truncate cursor-pointer hover:text-primary transition-colors"
                     onClick={() => setViewingProfileUid(selectedChat.participants?.find((p: string) => p !== profile.uid))}
                  >
                    {selectedChat.participantsNames?.find((n: string) => n !== profile.displayName) || "Anonymous Forge"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedChat.online ? "bg-success" : "bg-muted-foreground/30"}`} />
                    <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.1em]">
                      {selectedChat.online ? "Sync Active" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-lg w-9 h-9 border border-border/10 hover:bg-secondary/40"><Info className="w-4 h-4" /></Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 scrollbar-none flex flex-col">
              <div className="flex-1" />
              
              {messages.map((msg, i) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.senderUid === profile.uid ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] md:max-w-[60%] text-[13px] px-4 py-3 rounded-lg shadow-sm leading-relaxed ${
                    msg.senderUid === profile.uid 
                      ? "bg-primary text-white font-medium rounded-br-none shadow-glow-primary/40" 
                      : "bg-secondary border border-border/10 rounded-bl-none text-foreground/90 shadow-sm"
                  }`}>
                    {msg.text}
                    {msg.createdAt && (
                       <div className={`text-[8px] mt-2 opacity-30 font-mono tracking-tighter uppercase ${msg.senderUid === profile.uid ? "text-right" : "text-left"}`}>
                         {msg.createdAt.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "syncing"}
                       </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {selectedChat.status === "request" && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center max-w-sm mx-auto my-8 relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/5 shadow-inner -z-10" />
                   <UserPlus className="w-8 h-8 text-primary mx-auto mb-4" />
                   <h5 className="font-black text-[10px] uppercase mb-2 tracking-widest text-foreground">Message Request</h5>
                   <p className="text-[10px] text-muted-foreground/70 mb-8 leading-relaxed italic">
                     Accept this request to start a technical conversation. You can ignore it if you don't wish to connect.
                   </p>
                   <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg h-10 text-[10px] font-black uppercase border-border/20 hover:bg-secondary/40">Ignore</Button>
                      <Button onClick={() => handleAcceptRequest(selectedChat.id)} size="sm" className="flex-1 h-10 bg-primary font-black uppercase text-[10px] rounded-lg shadow-glow shadow-primary/20">Accept Request</Button>
                   </div>
                </div>
              )}
            </div>

            <footer className="p-6 md:px-8 md:pb-8 bg-background/20 backdrop-blur-3xl shrink-0">
              <div className="flex items-center gap-3 bg-secondary/30 rounded-lg p-1.5 border border-border/20 active:border-primary/40 focus-within:border-primary/40 focus-within:ring-1 ring-primary/20 transition-all shadow-inner">
                <input 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder={selectedChat.status === "request" ? "Accept request to start chatting..." : "Type a professional transmission..."}
                  disabled={selectedChat.status === "request"}
                  className="flex-1 bg-transparent border-none outline-none text-xs px-4 py-2 font-medium placeholder:text-muted-foreground/30 disabled:cursor-not-allowed" 
                />
                <Button 
                  onClick={handleSendMessage}
                  size="icon" 
                  disabled={!newMessage.trim() || selectedChat.status === "request"}
                  className="bg-primary hover:glow-primary shadow-glow shrink-0 rounded-lg w-10 h-10 transition-all font-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden bg-grid-pattern opacity-40">
            <div className="absolute inset-0 bg-background/90" />
            <div className="relative z-10 w-full max-w-md">
              <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-8 border border-border/10">
                <MessageSquare className="w-6 h-6 text-primary opacity-30 shadow-glow" />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter text-foreground mb-2 uppercase">Comms Node</h3>
              <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-[0.2em]">Select active participant to transmit</p>
            </div>
          </div>
        )}
      </main>

      {/* Profile Detail Overlay */}
      <AnimatePresence>
        {viewingProfileUid && (
          <ProfilePreview uid={viewingProfileUid} onClose={() => setViewingProfileUid(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesTab;
