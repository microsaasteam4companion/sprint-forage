import { motion } from "framer-motion";
import { useParams, Link, Navigate } from "react-router-dom";
import { BLOG_POSTS } from "@/lib/blog-data";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowLeft, Calendar, Clock, User, Share2, ChevronRight } from "lucide-react";
import { useEffect } from "react";

const BlogPost = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <Navigate to="/blog" />;

  // JSON-LD for AEO/GEO/SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.image,
    "author": {
      "@type": "Organization",
      "name": "SprintForge"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SprintForge",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sprintforge.entrext.com/logo.png"
      }
    },
    "datePublished": "2026-04-08", // Dynamic mapping can be added
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://sprintforge.entrext.com/blog/${post.slug}`
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      
      <Navbar />

      <main className="pt-32 pb-20">
        <article className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{post.title}</span>
          </nav>

          <Link to="/blog" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dispatches
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 text-xs font-bold text-primary uppercase tracking-widest mb-6">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">{post.category}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-8 leading-[1.1]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-12 py-6 border-y border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-foreground">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <button className="ml-auto p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl relative">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>

            <div 
              className="prose prose-invert prose-primary max-w-none 
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-lg
              prose-strong:text-foreground prose-a:text-primary hover:prose-a:underline
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-20 p-10 glass rounded-3xl border-primary/10 text-center relative overflow-hidden">
              <div className="absolute inset-0 gradient-mesh opacity-10" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Forge Your Legacy?</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join the next elite sprint and build high-quality products with a global team.</p>
                <Link to="/">
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-4 rounded-2xl shadow-glow transition-all">
                    Start Your Sprint Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
