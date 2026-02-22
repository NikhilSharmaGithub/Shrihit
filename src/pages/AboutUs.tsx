import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, Award, Users, Leaf } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Devotion",
    description: "Every product is crafted with deep reverence for spiritual traditions and sacred rituals."
  },
  {
    icon: Award,
    title: "Quality",
    description: "We source only the finest materials - pure brass, natural incense, and authentic ritual items."
  },
  {
    icon: Users,
    title: "Community",
    description: "Supporting local artisans and preserving traditional craftsmanship across India."
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Eco-friendly packaging and sustainable sourcing practices for a greener future."
  }
];

const AboutUs = () => {
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
                ABOUT SHRIHIT
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
                Bringing Divinity Home
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                At Shrihit, we believe that every home deserves the sacred touch of authentic pooja essentials. 
                Our mission is to make traditional worship accessible while preserving the artistry of generations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  Founded with a vision to bridge tradition and modernity, Shrihit curates the finest pooja 
                  essentials from skilled artisans across India. We understand that spiritual practices are 
                  deeply personal, and the items used in worship should reflect that sanctity.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed">
                  From handcrafted brass diyas to premium incense, every product in our collection is 
                  carefully selected to enhance your spiritual journey. We partner directly with artisan 
                  communities, ensuring fair wages and preserving traditional craftsmanship.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-muted/30 rounded-2xl p-8"
              >
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="font-display text-4xl font-bold text-primary">500+</p>
                    <p className="font-body text-sm text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="font-display text-4xl font-bold text-primary">50+</p>
                    <p className="font-body text-sm text-muted-foreground">Artisans</p>
                  </div>
                  <div>
                    <p className="font-display text-4xl font-bold text-primary">10K+</p>
                    <p className="font-body text-sm text-muted-foreground">Happy Customers</p>
                  </div>
                  <div>
                    <p className="font-display text-4xl font-bold text-primary">15+</p>
                    <p className="font-body text-sm text-muted-foreground">States Served</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Our Values
              </h2>
              <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do at Shrihit
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card p-6 rounded-xl text-center shadow-sacred"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;