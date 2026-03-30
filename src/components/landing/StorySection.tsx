import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Shuffle, Users, Code2, Trophy, Rocket } from "lucide-react";

const storySteps = [
  {
    icon: "📝",
    title: "Monday 9:00 AM",
    subtitle: "Registration Closes",
    description: "You signed up with your skills: React, Node.js. The algorithm is running...",
    visual: "MATCHING ENGINE ACTIVE",
    color: "primary",
  },
  {
    icon: "🎰",
    title: "Monday 9:01 AM",
    subtitle: "The Lucky Draw",
    description: "The forge fires. You're matched with a frontend dev from Lagos and a DB engineer from Seoul. Zero context. Total strangers.",
    visual: "TEAM #4,291 FORGED",
    color: "accent",
  },
  {
    icon: "⚡",
    title: "Monday — Friday",
    subtitle: "The Build Sprint",
    description: "5 days. 3 strangers. 1 project: Build a real-time chat app. You handle the API, she handles the UI, he handles the database. Sink or swim together.",
    visual: "SPRINT IN PROGRESS",
    color: "karma",
  },
  {
    icon: "🚀",
    title: "Saturday",
    subtitle: "Ship Day",
    description: "You deploy at 11:59 PM. It works. The chat app sends messages in real-time. Your team of strangers just became collaborators.",
    visual: "PROJECT SHIPPED ✓",
    color: "success",
  },
  {
    icon: "🏆",
    title: "Sunday",
    subtitle: "The Live Reveal",
    description: "Your project hits the leaderboard. Community votes. You earn 450 Karma. Two more projects and you unlock your real identity.",
    visual: "+450 KARMA EARNED",
    color: "karma",
  },
];

const StorySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="font-mono text-xs text-karma tracking-widest uppercase">One Week. One Team. One Mission.</span>
          <h2 className="text-4xl md:text-5xl font-black mt-3 text-foreground">
            A Week in the Forge
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            This is what happens when you stop waiting for the perfect team and start building with whoever shows up.
          </p>
        </motion.div>

        <div ref={containerRef} className="max-w-4xl mx-auto relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-karma/50" />

          {storySteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`relative flex items-start gap-6 mb-16 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10">
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-glow" />
              </div>

              {/* Content */}
              <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                <div className={`glass rounded-xl p-6 hover:border-primary/30 transition-all duration-500 group`}>
                  <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{step.title}</h3>
                      <p className="text-xs text-primary font-mono">{step.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-${step.color}/10 border border-${step.color}/20`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-${step.color} animate-pulse`} />
                    <span className={`text-[10px] font-mono text-${step.color}`}>{step.visual}</span>
                  </div>
                </div>
              </div>

              {/* Empty space for other side */}
              <div className="hidden md:block md:w-[calc(50%-2rem)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorySection;
