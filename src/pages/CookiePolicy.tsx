import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl font-black mb-8">Cookie Policy</h1>
        <div className="prose prose-invert border-l-4 border-primary pl-6">
          <p className="text-muted-foreground leading-relaxed mb-6">
            Last updated: 2026-04-09
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            SprintForge uses cookies and similar tracking technologies to track the activity on our Platform and retain certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We use essential cookies to authenticate users and prevent fraudulent use of user accounts. We also use functional cookies to remember choices you make when you use our website, such as remembering your login details or language preference.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicy;
