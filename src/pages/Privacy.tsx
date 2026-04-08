import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <div className="prose prose-invert border-l-4 border-primary pl-6">
          <p className="text-muted-foreground leading-relaxed mb-6">
            Last updated: 2026-04-09
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            SprintForge respects your privacy. We collect minimal data necessary to facilitate team matchmaking and maintain our platform's integrity. We do not sell your personal data to third parties.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Information collected includes your linked GitHub profile, email address, and participation metadata (Karma, streaks, shipped projects). This information is used strictly to provide the SprintForge service and improve matching algorithms.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By using SprintForge, you consent to this collection. For data deletion requests, please reach out via our contact page.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
