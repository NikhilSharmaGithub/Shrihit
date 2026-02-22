import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const milestones = [
  {
    year: "2018",
    title: "The Beginning",
    description: "Shrihit was born from a simple observation - finding authentic pooja items was becoming increasingly difficult. Our founder started sourcing directly from artisan villages."
  },
  {
    year: "2019",
    title: "First Collection",
    description: "We launched our first curated collection of brass diyas and bells, handcrafted by skilled artisans from Moradabad, the brass capital of India."
  },
  {
    year: "2020",
    title: "Going Digital",
    description: "Despite the pandemic, we pivoted to e-commerce, bringing sacred essentials to doorsteps across India when temples were closed."
  },
  {
    year: "2021",
    title: "Artisan Network",
    description: "Expanded our network to include 50+ artisan families across 8 states, from Kashmir to Karnataka, each bringing unique regional traditions."
  },
  {
    year: "2022",
    title: "Festival Collections",
    description: "Launched specialty festival kits for Diwali, Navratri, and other celebrations, making it easier for families to observe traditions."
  },
  {
    year: "2023",
    title: "10,000 Families",
    description: "Crossed the milestone of serving 10,000 families, while maintaining our commitment to authenticity and artisan welfare."
  }
];

const OurStory = () => {
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
                OUR JOURNEY
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
                The Shrihit Story
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                From a small idea to a movement preserving sacred traditions - 
                this is how Shrihit came to be and where we are headed.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="prose prose-lg max-w-none"
              >
                <h2 className="font-display text-3xl font-semibold text-foreground mb-6">
                  How It All Started
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  It was during a visit to my grandmother&apos;s home in a small village that the idea for 
                  Shrihit was born. I watched as she polished her collection of brass diyas - each one 
                  handed down through generations, each with its own story and significance.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  When I returned to the city, I tried to find similar quality items for my own home. 
                  What I found instead was mass-produced imitations that lacked the soul and craftsmanship 
                  of traditional pieces. The artisans who had made my grandmother&apos;s treasures were 
                  struggling to find buyers, while city dwellers like me struggled to find authentic products.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Shrihit was created to bridge this gap - connecting urban families who value authentic 
                  worship with rural artisans who preserve ancient craft traditions. Every purchase supports 
                  a family and keeps a tradition alive.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline */}
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
                Our Milestones
              </h2>
            </motion.div>
            
            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-6 mb-8 last:mb-0"
                >
                  <div className="flex-shrink-0 w-20">
                    <span className="font-display text-2xl font-bold text-primary">
                      {milestone.year}
                    </span>
                  </div>
                  <div className="relative pl-6 border-l-2 border-primary/30 pb-8 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {milestone.title}
                    </h3>
                    <p className="font-body text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
                Our Vision for Tomorrow
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                We envision a future where every Indian household has access to authentic, ethically-sourced 
                pooja essentials. Where artisan communities thrive, traditions are preserved, and the sacred 
                connection between devotee and divine remains unbroken. This is the India we are building, 
                one diya at a time.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OurStory;