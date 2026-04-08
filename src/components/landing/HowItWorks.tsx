import { motion } from "framer-motion";
import { UserPlus, Shuffle, Code2, Trophy, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register & Set Skills",
    description: "Sign up and tag your expertise: frontend, backend, DevOps, design. The system knows what you bring.",
    color: "text-primary",
  },
  {
    icon: Shuffle,
    title: "Lucky Draw Matchmaking",
    description: "Every Monday, the forge fires. You're randomly matched with strangers who complement your skills. No choosing.",
    color: "text-accent",
  },
  {
    icon: Code2,
    title: "Build Under Pressure",
    description: "You have 7 days to ship. Communicate, divide, conquer. Just like a real sprint with colleagues you just met.",
    color: "text-karma",
  },
  {
    icon: Trophy,
    title: "Ship & Earn Karma",
    description: "Submit by Sunday. Get peer-reviewed. Earn Karma Points that unlock DMs, identity reveals, and recruiter visibility.",
    color: "text-success",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="font-mono text-xs text-primary tracking-widest uppercase">The Process</span>
          <h2 className="text-4xl md:text-5xl font-black mt-3 text-foreground">
            How the Forge Works
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-2">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="glass rounded-xl p-6 flex items-start gap-5 group hover:border-primary/30 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-border/50">
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    <h3 className="font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-border" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
