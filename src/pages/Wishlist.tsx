import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const Wishlist = () => {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    });
    removeItem(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center"
            >
              <Heart size={40} className="text-muted-foreground" />
            </motion.div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-3">
              Your Wishlist is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Save your favorite products here and come back anytime to find them.
            </p>
            <Link to="/collections">
              <Button variant="sacred" size="lg">
                Explore Products
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="text-primary" size={28} />
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
              My Wishlist
            </h1>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl overflow-hidden shadow-sacred group"
              >
                <Link to={`/product/${item.slug}`} className="block relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-semibold text-foreground">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      variant="sacred"
                      size="sm"
                      className="flex-1"
                    >
                      <ShoppingBag size={16} className="mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
