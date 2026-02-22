import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import diwaliKit from "@/assets/product-diwali-kit.jpg";

const CollectionBanner = () => {
  return (
    <section id="diwali" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={diwaliKit}
              alt="Diwali Pooja Kit"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/50" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 md:px-16 py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <p className="font-body text-sm tracking-[0.3em] text-primary font-medium mb-3">
                LIMITED EDITION
              </p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-secondary-foreground leading-tight mb-4">
                Diwali Pooja
                <br />
                Complete Kit
              </h2>
              <p className="font-body text-secondary-foreground/80 text-lg mb-8">
                Everything you need for a blessed Diwali celebration. 
                Premium brass items, sacred ingredients & divine accessories — 
                all in one beautifully curated gift box.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="sacredLight" size="lg" className="group">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="ghostLight" size="lg">
                  ₹4,999 only
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionBanner;
