import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl font-black mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Have questions about the Forge? Need help with an ongoing sprint, or want to inquire about Enterprise options? Reach out to the SprintForge team.
            </p>
            <div className="flex items-center gap-4 text-foreground">
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm">support@sprintforge.dev</span>
            </div>
            <div className="flex items-center gap-4 text-foreground">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm">discord.gg/ZZx3cBrx2</span>
            </div>
          </div>
          <div className="glass p-8 rounded-2xl border-primary/10">
            <h3 className="text-xl font-bold mb-4">Send a Message</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Feature coming soon!"); }}>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">Subject</label>
                <Input placeholder="How can we help?" className="bg-background border-border/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">Message</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
