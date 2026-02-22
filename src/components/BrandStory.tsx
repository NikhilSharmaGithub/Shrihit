import { motion } from "framer-motion";

const BrandStory = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm tracking-[0.3em] text-primary font-medium mb-3">
              OUR STORY
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-8">
              Where Tradition
              <br />
              Meets Devotion
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed mb-12"
          >
            At Shrihit, we believe that every pooja is a conversation with the divine. 
            Born from a deep respect for Indian traditions, we curate premium spiritual 
            products that honor our heritage. From daily aarti to grand festivals, 
            our handpicked brass items and sacred essentials bring authenticity to 
            your prayers. <span className="text-foreground font-medium">भरोसे का नाम — श्रीहित।</span>
          </motion.p>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center gap-4 items-center"
          >
            <div className="h-px w-16 bg-border" />
            <div className="w-2 h-2 rounded-full bg-primary animate-glow" />
            <div className="h-px w-16 bg-border" />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border"
          >
            {[
              { value: "10K+", label: "Happy Families" },
              { value: "500+", label: "Sacred Products" },
              { value: "50+", label: "Cities Delivered" },
              { value: "4.8★", label: "Customer Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl md:text-4xl font-semibold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
