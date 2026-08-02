import { ReactNode } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

interface PolicyPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Shared shell for the policy pages. Payment gateways require a live merchant
 * to publish shipping, refund, terms and contact information, so these are
 * real routes rather than placeholder links in the footer.
 */
const PolicyPage = ({ title, description, children }: PolicyPageProps) => (
  <div className="min-h-screen bg-background">
    <Seo title={`${title} | Shrihit`} description={description} />
    <Header />
    <main className="pt-24 md:pt-32 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-3">{title}</h1>
          <p className="font-body text-muted-foreground mb-10">{description}</p>
          <div className="prose prose-neutral max-w-none font-body space-y-6 text-foreground/90">
            {children}
          </div>
        </motion.div>
      </div>
    </main>
    <Footer />
  </div>
);

export default PolicyPage;
