import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl font-black mb-8">Terms and Conditions</h1>
        <div className="prose prose-invert border-l-4 border-primary pl-6">
          <p className="text-muted-foreground leading-relaxed mb-6">
            Last updated: 2026-04-09
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Welcome to SprintForge. By accessing our platform, you agree to abide by these terms. SprintForge provides a platform for software engineers to collaborate on timed projects.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            1. <strong>Code of Conduct:</strong> You agree to treat your randomly assigned teammates with professional respect. Toxicity, harassment, or ghosting your team will result in permanent bans and forfeiture of Karma.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            2. <strong>Intellectual Property:</strong> Code produced during a sprint belongs jointly to the participants of that sprint, unless an alternative license is agreed upon by the team prior to commencement. SprintForge claims no ownership over your shipped projects.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            3. <strong>Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate our community standards or attempt to game the matching/Karma system.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Terms;
