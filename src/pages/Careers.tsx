import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const openPositions = [
  {
    title: "Content Writer",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Create engaging content about Hindu traditions, festivals, and our artisan stories."
  },
  {
    title: "Artisan Relations Manager",
    department: "Operations",
    location: "Jaipur, Rajasthan",
    type: "Full-time",
    description: "Build and maintain relationships with our artisan network across India."
  },
  {
    title: "Customer Experience Associate",
    department: "Support",
    location: "Mumbai, Maharashtra",
    type: "Full-time",
    description: "Help customers with inquiries, orders, and ensure a delightful shopping experience."
  },
  {
    title: "Social Media Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Manage our social media presence and build our community of devotees."
  }
];

const benefits = [
  "Flexible work arrangements",
  "Health insurance for you and family",
  "Festival bonuses and gifts",
  "Learning and development budget",
  "Employee discount on all products",
  "Paid time off for religious observances"
];

const Careers = () => {
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
                JOIN OUR TEAM
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
                Build Something Sacred
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Join us in our mission to preserve traditional craftsmanship and make 
                authentic worship accessible to every home.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why Join Us */}
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
                  Why Work With Us?
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  At Shrihit, you will not just have a job - you will be part of a movement. 
                  We are building bridges between ancient traditions and modern homes, between 
                  rural artisans and urban families.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Every day, you will contribute to preserving cultural heritage, supporting 
                  artisan livelihoods, and helping families maintain their spiritual practices. 
                  If meaningful work matters to you, this is the place.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-card p-8 rounded-xl shadow-sacred"
              >
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Benefits & Perks
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-body text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
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
                Open Positions
              </h2>
              <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                Find a role that matches your skills and passion
              </p>
            </motion.div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={position.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card p-6 rounded-xl shadow-sacred"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {position.type}
                        </span>
                      </div>
                      <p className="font-body text-muted-foreground text-sm">
                        {position.description}
                      </p>
                    </div>
                    <Button variant="sacred" className="flex-shrink-0">
                      Apply Now
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                Do Not See the Right Role?
              </h2>
              <p className="font-body text-muted-foreground mb-6">
                We are always looking for talented people who share our vision. 
                Send us your resume at careers@shrihit.com and tell us how you would like to contribute.
              </p>
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;