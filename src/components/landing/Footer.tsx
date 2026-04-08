import { Instagram, Linkedin, Twitter, Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer = () => {
  const socialLinks = [
    { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/accounts/login/?next=%2Fentrext.labs%2F&source=omni_redirect" },
    { icon: <Linkedin className="w-5 h-5" />, href: "https://www.linkedin.com/company/entrext/" },
    { icon: <Twitter className="w-5 h-5" />, href: "https://entrextlabs.substack.com/subscribe" }, // Using substack as Twitter placeholder/link as per user request
    { icon: <Mail className="w-5 h-5" />, href: "https://entrextlabs.substack.com/subscribe" },
    { icon: <MessageSquare className="w-5 h-5" />, href: "https://discord.com/invite/ZZx3cBrx2" },
  ];

  return (
    <footer className="bg-background border-t border-border/30 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SprintForge Logo" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-xl tracking-tight text-foreground">
                Sprint<span className="text-primary">Forge</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Where engineers become legends. Weekly projects, random teams, real-world deadlines. Forge your legacy today.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-3">
              {["How It Works", "Features", "Leaderboard", "Pricing"].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms and Condition", href: "/terms" },
                { label: "Cookie Policy", href: "/cookie-policy" }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Get the latest weekly challenges and elite matches in your inbox.
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="bg-muted/30 border-border/50 focus:border-primary/50 text-sm h-11 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                Subscribe to Newsletter
                <Send className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
          <p>© 2026 SprintForge. All rights reserved. Ship or sink.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
