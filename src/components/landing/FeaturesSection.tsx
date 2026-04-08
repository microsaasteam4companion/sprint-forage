import { motion } from "framer-motion";
import { Ghost, MessageSquareOff, Star, ShoppingBag, Radio, Shield } from "lucide-react";

const features = [
  {
    icon: Ghost,
    title: "Anonymous Identity",
    description: "Everyone starts anonymous. Your code speaks first. Real identity unlocks at high Karma | earned, not given.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: MessageSquareOff,
    title: "No DMs. Earn Access.",
    description: "DMs are locked by default. Hit Karma thresholds to unlock direct messaging with founders and top engineers.",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Star,
    title: "Karma Economy",
    description: "Ship projects, help peers, get upvotes. Karma unlocks identity reveals, DM access, and recruiter visibility.",
    gradient: "from-karma/20 to-karma/5",
  },
  {
    icon: ShoppingBag,
    title: "Project Marketplace",
    description: "Founders drop real ideas. Community builds them. Best implementations get bought. 10-20% platform commission.",
    gradient: "from-success/20 to-success/5",
  },
  {
    icon: Radio,
    title: "Sunday Live Reveal",
    description: "Every Sunday, the best projects go live on a leaderboard stream. Community votes. Winners get bonus Karma.",
    gradient: "from-destructive/20 to-destructive/5",
  },
  {
    icon: Shield,
    title: "Recruitment as a Service",
    description: "Recruiters browse verified profiles with shipped projects and Karma scores. Hire engineers who've proven they can collaborate.",
    gradient: "from-primary/20 to-accent/5",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="font-mono text-xs text-accent tracking-widest uppercase">Platform</span>
          <h2 className="text-4xl md:text-5xl font-black mt-3 text-foreground">
            Built Different
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Not another coding bootcamp. A pressure cooker for real engineering collaboration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-6 group hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                <feature.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
