import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 md:p-16 border-primary/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
              Stop Waiting for the
              <br />
              <span className="text-primary text-glow-primary">Perfect Team.</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              In the real world, you ship with whoever shows up. Start building that muscle now. 
              Next forge drops Monday.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-bold text-base px-10 py-6 group">
                Join SprintForge
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4 font-mono">Free forever. No credit card. Just code.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
