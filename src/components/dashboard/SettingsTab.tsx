import { motion } from "framer-motion";
import { User, Shield, Bell, Check, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

const SettingsTab = ({ profile }: { profile: any }) => {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || "",
    skills: profile?.skills?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
       toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl px-2">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your professional Forge identity</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-6 border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Forge Profile</h3>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-primary hover:glow-primary shadow-glow h-9 px-4 rounded-xl text-xs font-bold"
          >
            {saving ? "Saving..." : <><Save className="w-3 h-3 mr-2" /> Save Changes</>}
          </Button>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Display Name</label>
            <input 
              value={formData.displayName}
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm outline-none focus:ring-1 ring-primary transition-all"
              placeholder="e.g. Satoshi"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Skills (Comma separated)</label>
            <input 
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm outline-none focus:ring-1 ring-primary transition-all font-mono"
              placeholder="React, TypeScript, Go..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border/10">
            <div>
              <span className="text-xs font-bold text-foreground block">Identity Privacy</span>
              <p className="text-[10px] text-muted-foreground">Currently: <span className="text-destructive font-bold">ANONYMOUS</span></p>
            </div>
            <div className="text-[10px] text-muted-foreground italic">Unlock reveal at 10,000 Karma</div>
          </div>
        </div>
      </motion.div>

      {/* Trust & Verification */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 border-primary/10">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground text-sm">Account Trust</h3>
        </div>
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold">GitHub Integration</span>
                <p className="text-xs text-muted-foreground">Used for sprint submissions and commits verification</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-lg border border-success/20 text-xs font-bold">
                <Check className="w-3 h-3" /> CONNECTED
              </div>
           </div>
           <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold">Verified Badge</span>
                <p className="text-xs text-muted-foreground">{profile?.isVerified ? "Your identity is forge-verified." : "Skip the Karma grind and unlock DMs immediately"}</p>
              </div>
              {profile?.isVerified ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-lg border border-success/20 text-xs font-bold">
                  <Check className="w-3 h-3" /> VERIFIED
                </div>
              ) : (
                <Button 
                  onClick={async () => {
                    const userRef = doc(db, "users", profile.uid);
                    await updateDoc(userRef, { isVerified: true, isAdmin: true });
                    toast.success("DEBUG: Account verified & Admin status granted!");
                  }} 
                  className="rounded-lg h-9 px-4 text-[10px] uppercase font-black bg-karma/10 text-karma border border-karma/20 hover:bg-karma/20"
                >
                  VERIFY ME (DEBUG)
                </Button>
              )}
           </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground text-sm">Preferences</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-secondary/20 rounded-xl text-xs text-muted-foreground italic border border-dashed border-border/40">
           Dark Mode is enforced for the Forge aesthetic. Notifications are handled via browser push.
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsTab;
