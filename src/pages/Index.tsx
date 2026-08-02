import Seo from "@/components/Seo";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import CollectionBanner from "@/components/CollectionBanner";
import WhyChooseUs from "@/components/WhyChooseUs";
import BrandStory from "@/components/BrandStory";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Shrihit - Premium Pooja Essentials | Authentic Brass Pooja Items"
        description="Shop authentic brass pooja items, diyas, aarti thalis & spiritual essentials. Premium quality, pan-India delivery."
      />
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <CollectionBanner />
        <WhyChooseUs />
        <BrandStory />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
