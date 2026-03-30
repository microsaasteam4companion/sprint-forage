import { motion } from "framer-motion";
import { ArrowRight, Users, Shuffle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Suspense, lazy } from "react";

const ForgeGlobe = lazy(() => import("./ForgeGlobe"));

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0 gradient-mesh" />
      
      <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-6 pt-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-mono text-primary">SEASON 4 LIVE — 2,847 ENGINEERS FORGING</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-6"
            >
              <span className="text-foreground">You Don't</span>
              <br />
              <span className="text-foreground">Choose Your </span>
              <br />
              <span className="text-primary text-glow-primary">Team.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              Forced collaboration with strangers. Weekly projects. Real deadlines.
              Build your portfolio the way the real world works — with people you didn't pick.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-12"
            >
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-bold text-base px-8 py-6 group">
                  Enter the Forge
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 px-8 py-6">
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 max-w-md gap-8"
            >
              {[
                { icon: Users, value: "12K+", label: "Engineers" },
                { icon: Shuffle, value: "3.2K", label: "Teams Forged" },
                { icon: Trophy, value: "890", label: "Projects Shipped" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center sm:text-left">
                  <Icon className="w-4 h-4 text-primary mx-auto sm:mx-0 mb-2" />
                  <div className="text-2xl font-bold text-foreground font-mono">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="hidden lg:block h-[550px] relative"
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-primary/20 animate-pulse-glow" />
              </div>
            }>
              <ForgeGlobe />
            </Suspense>
            
            {/* Floating labels around globe */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-16 right-8 glass rounded-lg px-3 py-2 border-primary/20"
            >
              <span className="text-xs font-mono text-primary">🇮🇳 Mumbai</span>
              <p className="text-[10px] text-muted-foreground">Backend Dev joined</p>
            </motion.div>
            
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-0 glass rounded-lg px-3 py-2 border-accent/20"
            >
              <span className="text-xs font-mono text-accent">🇺🇸 San Francisco</span>
              <p className="text-[10px] text-muted-foreground">Frontend Dev matched</p>
            </motion.div>
            
            <motion.div
              animate={{ y: [-3, 7, -3] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-24 right-4 glass rounded-lg px-3 py-2 border-karma/20"
            >
              <span className="text-xs font-mono text-karma">🇩🇪 Berlin</span>
              <p className="text-[10px] text-muted-foreground">DevOps assigned</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
