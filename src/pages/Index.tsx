import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import MatchmakingVisual from "@/components/landing/MatchmakingVisual";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StorySection from "@/components/landing/StorySection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import CTASection from "@/components/landing/CTASection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";
import UpvoteWidget from "@/components/landing/UpvoteWidget";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MatchmakingVisual />
      <HowItWorks />
      <StorySection />
      <FeaturesSection />
      <SocialProofSection />
      <LeaderboardPreview />
      <PricingSection />
      <CTASection />
      <Footer />
      <UpvoteWidget userId={user?.uid} email={user?.email || undefined} />
    </div>
  );
};

export default Index;
