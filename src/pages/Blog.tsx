import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string;
  published_at: string | null;
  created_at: string;
}

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, author_name, published_at, created_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <p className="font-body text-sm tracking-[0.3em] text-primary font-medium mb-3">
                SHRIHIT BLOG
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
                Wisdom & Traditions
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Explore articles on Hindu traditions, festival guides, pooja rituals, 
                and stories from our artisan communities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sacred">
                    <Skeleton className="aspect-video" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group bg-card rounded-xl overflow-hidden shadow-sacred hover:shadow-lg transition-shadow"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="aspect-video bg-muted overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="font-display text-4xl text-primary/30">श्री</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {format(new Date(post.published_at || post.created_at), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {post.author_name}
                          </span>
                        </div>
                        <h2 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="font-body text-muted-foreground line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                          Read More <ArrowRight size={16} />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-display text-2xl text-muted-foreground mb-4">
                  No blog posts yet
                </p>
                <p className="font-body text-muted-foreground">
                  Check back soon for articles on traditions, festivals, and more!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;