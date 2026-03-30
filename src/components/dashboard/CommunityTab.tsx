import { motion, AnimatePresence } from "framer-motion";
import { 
  Ghost, ThumbsUp, MessageCircle, ArrowUpRight, TrendingUp, 
  Filter, PenSquare, AlertTriangle, Lightbulb, DollarSign, 
  Flame, BookOpen, Sparkles, Share2, Send, X, MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, where, limit, getDocs } from "firebase/firestore";
import { toast } from "sonner";

const CommunityTab = ({ profile, user }: { profile: any, user: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", tag: "💡 Tip" });
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeComments) return;
    const q = query(collection(db, "posts", activeComments, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeComments]);

  const handlePost = async () => {
    if (!newPost.content.trim()) return;
    try {
      await addDoc(collection(db, "posts"), {
        ...newPost,
        author: profile?.displayName || "Anonymous",
        authorUid: profile?.uid || user?.uid,
        karma: profile?.karma || 0,
        upvotes: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setShowNewPost(false);
      setNewPost({ content: "", tag: "💡 Tip" });
      toast.success("Post forged!");
    } catch (e) {
      toast.error("Failed to post");
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: commentText,
        author: profile?.displayName || "Anonymous",
        authorUid: profile?.uid || user?.uid,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
      toast.success("Reply added!");
    } catch (e) {
      toast.error("Failed to reply");
    }
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.info("Link copied to clipboard!", { description: "Paste it anywhere to share the thread." });
  };

  const handleMessageUser = async (post: any) => {
    if (!profile?.uid || !post.authorUid) return;
    if (profile.uid === post.authorUid) return;

    try {
      const participants = [profile.uid, post.authorUid].sort();
      const q = query(
        collection(db, "conversations"),
        where("participants", "==", participants),
        limit(1)
      );
      
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "conversations"), {
          participants,
          participantsNames: [profile.displayName || "Anonymous", post.author || "Forge Dev"],
          status: "request",
          lastMessage: `From Community: "${post.content.substring(0, 30)}..."`,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        toast.success("Message Request Sent!");
      } else {
        toast.info("Conversation already exists in your Messages.");
      }
    } catch (e) {
      toast.error("Failed to initiate message.");
    }
  };

  const toggleUpvote = async (postId: string, upvotes: string[]) => {
    const uid = profile?.uid || user?.uid;
    if (!uid) return;
    const isUpvoted = upvotes?.includes(uid);
    try {
      await updateDoc(doc(db, "posts", postId), {
        upvotes: isUpvoted ? arrayRemove(uid) : arrayUnion(uid)
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      {/* Community Guide */}
      {/* Community Guide */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-3 border-success/30 bg-success/5 relative overflow-hidden group">
        <div className="flex items-center gap-3 relative z-10">
          <Sparkles className="w-4 h-4 text-success shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-tight">
            <span className="text-success font-black uppercase mr-2">Guide:</span> 
            Ask technical questions, share tips, and find <span className="text-success font-bold">Paid Bounties</span>. Ranking depends on value provided!
          </p>
        </div>
      </motion.div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-foreground">Community Pulse</h2>
        <Button onClick={() => setShowNewPost(true)} size="sm" className="bg-primary hover:glow-primary font-black shadow-glow rounded-xl px-5 h-10">
          <PenSquare className="w-3.5 h-3.5 mr-2" /> FORGE
        </Button>
      </div>

      <div className="space-y-2">
        {posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-3 border-primary/5 hover:border-primary/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary/50 flex items-center justify-center border border-border/10 text-[8px] font-black italic shrink-0">
                 {post.author?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-foreground truncate max-w-[100px]">{post.author}</span>
                    <span className="text-[8px] text-muted-foreground font-mono bg-secondary/30 px-1.5 py-0.5 rounded-md">{post.karma} κ</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10 font-bold uppercase tracking-wider">{post.tag}</span>
                </div>
                
                <p className="text-xs text-foreground/80 leading-snug mb-2 line-clamp-2 md:line-clamp-none whitespace-pre-wrap">{post.content}</p>
                
                <div className="flex items-center gap-4 pt-2 border-t border-border/5">
                  <button onClick={() => toggleUpvote(post.id, post.upvotes)} className={`flex items-center gap-1 text-[9px] transition-colors ${post.upvotes?.includes(profile?.uid) ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}>
                    <ThumbsUp className={`w-2.5 h-2.5 ${post.upvotes?.includes(profile?.uid) ? "fill-current" : ""}`} />
                    {post.upvotes?.length || 0}
                  </button>
                  <button onClick={() => handleMessageUser(post)} className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="w-2.5 h-2.5" />
                    Message
                  </button>
                  <button onClick={() => setActiveComments(activeComments === post.id ? null : post.id)} className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground">
                    <MessageCircle className="w-2.5 h-2.5" />
                    Reply
                  </button>
                  <button onClick={() => handleShare(post.id)} className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground ml-auto">
                    <Share2 className="w-2.5 h-2.5" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Expansion */}
            <AnimatePresence>
              {activeComments === post.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-border/5 space-y-4">
                   <div className="space-y-3">
                     {comments.map((comment, i) => (
                       <div key={i} className="flex gap-3 text-xs">
                         <span className="font-black text-primary min-w-[60px]">{comment.author}:</span>
                         <span className="text-muted-foreground">{comment.text}</span>
                       </div>
                     ))}
                   </div>
                   <div className="flex gap-2">
                     <input 
                       value={commentText} 
                       onChange={e => setCommentText(e.target.value)} 
                       className="flex-1 bg-secondary/30 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 ring-primary transition-all" 
                       placeholder="Join the discussion..." 
                     />
                     <Button onClick={() => handleComment(post.id)} size="sm" className="bg-primary rounded-xl h-8 px-4 font-bold text-[10px]">SEND</Button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showNewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-lg p-8 rounded-3xl relative border-primary/20 shadow-2xl overflow-hidden">
               <h3 className="text-xl font-bold mb-6">Forge New Content</h3>
               <textarea 
                 rows={4} 
                 placeholder="Share your thoughts, tips, or stories with the Forge community..." 
                 className="w-full bg-secondary/30 border border-border/50 rounded-2xl p-4 text-sm outline-none focus:ring-1 ring-primary transition-all resize-none mb-4"
                 value={newPost.content}
                 onChange={e => setNewPost({...newPost, content: e.target.value})}
               />
               <div className="flex gap-4 mb-8">
                 {["💡 Tip", "💰 Bounty", "🔥 Story", "🚀 Product"].map(tag => (
                   <button key={tag} onClick={() => setNewPost({...newPost, tag})} className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-all ${newPost.tag === tag ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border/50"}`}>{tag}</button>
                 ))}
               </div>
               <div className="flex gap-3">
                 <Button onClick={() => setShowNewPost(false)} variant="ghost" className="flex-1 font-bold">Discard</Button>
                 <Button onClick={handlePost} className="flex-1 bg-primary font-black shadow-glow rounded-xl h-12">POST NOW</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityTab;
