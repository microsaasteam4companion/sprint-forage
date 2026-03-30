const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="font-mono font-bold text-primary text-xs">FT</span>
            </div>
            <span className="font-bold text-sm text-foreground">
              Forge<span className="text-primary">Team</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            {["About", "Blog", "Careers", "Privacy", "Terms"].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-mono">© 2026 ForgeTeam. Ship or sink.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
