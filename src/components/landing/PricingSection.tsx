import { motion } from "framer-motion";
import { Check, ShieldCheck, Zap, MessageSquare, Briefcase, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingSection = () => {
  const perks = [
    { icon: <ShieldCheck className="w-4 h-4 text-primary" />, text: "Verified Gold Badge" },
    { icon: <MessageSquare className="w-4 h-4 text-primary" />, text: "Direct Elite DMs Unlocked" },
    { icon: <Briefcase className="w-4 h-4 text-primary" />, text: "Post Unlimited Bounties" },
    { icon: <Zap className="w-4 h-4 text-primary" />, text: "Skip Submission Cooldown" },
    { icon: <Trophy className="w-4 h-4 text-primary" />, text: "Priority Team Matching" },
    { icon: <Sparkles className="w-4 h-4 text-primary" />, text: "Expert Support Access" },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-50 transition-transform hover:scale-75 duration-1000" />
      
      <div className="container px-4 mx-auto text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">The Gold Standard</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
          Forge ahead of the curve. Unlock elite-tier collaboration and direct marketplace access.
        </p>
      </div>

      <div className="container px-4 mx-auto flex justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass max-w-md w-full rounded-3xl p-8 border-primary/30 shadow-glow relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4">
             <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/40 animate-pulse">
               Most Popular
             </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Verified Gold</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-foreground">$99</span>
              <span className="text-muted-foreground font-mono">/one-time</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Lifetime access to the elite Forge ecosystem.</p>
          </div>

          <div className="space-y-4 mb-10">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-foreground/80 group-hover:translate-x-1 transition-transform">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {perk.text}
              </div>
            ))}
          </div>

          <Button 
            className="w-full bg-primary hover:glow-primary text-primary-foreground font-black text-lg h-14 rounded-2xl shadow-glow transition-all"
            onClick={() => window.open("https://checkout.stripe.com/p/your-link", "_blank")}
          >
            GET VERIFIED GOLD
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground mt-4 font-mono uppercase tracking-widest">
            Secure checkout via Stripe · Immediate Activation
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
