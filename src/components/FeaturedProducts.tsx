import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useFeaturedProducts, Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback images for products without images
import productThali from "@/assets/product-thali.jpg";
import productDiya from "@/assets/product-diya.jpg";
import productIncense from "@/assets/product-incense.jpg";
import productBell from "@/assets/product-bell.jpg";

const fallbackImages = [productThali, productDiya, productIncense, productBell];

const FeaturedProducts = () => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { data: products, isLoading } = useFeaturedProducts(4);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: product.images[0] || fallbackImages[0],
    });
  };

  const getProductImage = (product: Product, index: number) => {
    return product.images[0] || fallbackImages[index % fallbackImages.length];
  };

  return (
    <section id="shop" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.3em] text-primary font-medium mb-3">
            CURATED COLLECTION
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
            Sacred Essentials
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Handpicked brass pooja items crafted with devotion. Every piece tells a story of tradition.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {isLoading ? (
            // Loading skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden shadow-sacred">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/product/${product.id}`} className="block relative bg-card rounded-lg overflow-hidden shadow-sacred">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getProductImage(product, index)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            originalPrice: product.original_price,
                            image: getProductImage(product, index),
                            slug: product.slug,
                          });
                        }}
                        className={`w-9 h-9 bg-background/90 backdrop-blur rounded-full flex items-center justify-center transition-colors ${
                          isInWishlist(product.id) 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Add to Cart Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className="w-full bg-background text-foreground font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display text-lg font-medium text-foreground mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground italic mb-3 line-clamp-1">
                      "{product.short_description || 'Sacred item for your daily pooja'}"
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-lg font-semibold text-foreground">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.original_price && (
                        <span className="font-body text-sm text-muted-foreground line-through">
                          ₹{product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products available yet. Add products from admin panel.</p>
              <Link to="/admin/products" className="text-primary hover:underline mt-2 inline-block">
                Go to Admin Panel →
              </Link>
            </div>
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="/collections"
            className="inline-flex items-center gap-2 font-body font-medium text-primary hover:text-primary/80 transition-colors border-b-2 border-primary pb-1"
          >
            View All Products
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
