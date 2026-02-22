import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import shrihitLogo from "@/assets/shrihit-logo.jpg";

const Footer = () => {
  const footerLinks = {
    shop: [
      { name: "All Products", href: "#" },
      { name: "Brass Items", href: "#" },
      { name: "Diyas & Lamps", href: "#" },
      { name: "Incense & Dhoop", href: "#" },
      { name: "Pooja Thalis", href: "#" },
      { name: "Gift Sets", href: "#" },
    ],
    help: [
      { name: "Track Order", href: "#" },
      { name: "Shipping Policy", href: "#" },
      { name: "Returns & Exchange", href: "#" },
      { name: "FAQs", href: "#" },
      { name: "Contact Us", href: "#" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/our-story" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Admin", href: "/admin/login", icon: true },
    ],
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-block mb-6">
              <img 
                src={shrihitLogo} 
                alt="Shrihit" 
                className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/80 animate-logo-glow"
              />
            </a>
            <p className="font-body text-background/70 mb-6 max-w-sm leading-relaxed">
              Premium pooja essentials for the modern devotee. 
              Authentic products, blessed service, doorstep delivery.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">
              Help
            </h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="font-body text-sm text-background/70 hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      {'icon' in link && link.icon && <Shield size={14} />}
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="font-body text-sm text-background/70 hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-background/70">
                  123 Spiritual Lane, Jaipur, Rajasthan 302001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="font-body text-sm text-background/70 hover:text-primary transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <a
                  href="mailto:namaste@shrihit.in"
                  className="font-body text-sm text-background/70 hover:text-primary transition-colors"
                >
                  namaste@shrihit.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-sm text-background/50">
            © 2024 Shrihit. All rights reserved. Made with 🙏 in India.
          </p>
          <div className="flex items-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png"
              alt="Stripe"
              className="h-6 opacity-50"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/512px-PayPal.svg.png"
              alt="PayPal"
              className="h-5 opacity-50"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
