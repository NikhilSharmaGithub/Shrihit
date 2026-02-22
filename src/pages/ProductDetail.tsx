import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Truck, Shield, RefreshCw, Star, Minus, Plus, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useProduct, useRelatedProducts, useCategories } from "@/hooks/useProducts";

// Fallback images
import productThali from "@/assets/product-thali.jpg";
import productDiya from "@/assets/product-diya.jpg";
import productIncense from "@/assets/product-incense.jpg";
import productBell from "@/assets/product-bell.jpg";

const fallbackImages = [productThali, productDiya, productIncense, productBell];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || "");
  const { data: categories } = useCategories();
  const { data: relatedProducts } = useRelatedProducts(id || "", product?.category_id || null);
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const getProductImage = (images: string[], index: number) => {
    return images[index] || fallbackImages[index % fallbackImages.length];
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !categories) return "Pooja Items";
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || "Pooja Items";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Product Not Found</h1>
          <Link to="/collections" className="text-primary hover:underline">
            ← Back to Collections
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: product.images[0] || fallbackImages[0],
      size: selectedSize || undefined,
    }, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  const productImages = product.images.length > 0 ? product.images : fallbackImages.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 md:pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm font-body">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <Link to="/collections" className="text-muted-foreground hover:text-foreground transition-colors">
                  Collections
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-foreground font-medium truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
                <img
                  src={getProductImage(productImages, selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-sm font-semibold px-3 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                      selectedImage === index
                        ? "ring-2 ring-primary ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getProductImage(productImages, index)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              {/* Category */}
              <p className="font-body text-sm tracking-widest text-primary font-medium uppercase mb-2">
                {getCategoryName(product.category_id)}
              </p>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
                {product.name}
              </h1>

              {/* Short Description */}
              {product.short_description && (
                <p className="font-body text-muted-foreground italic mb-4">
                  "{product.short_description}"
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < 4 ? "fill-primary text-primary" : "text-muted-foreground"}
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  4.8 (127 reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-3xl font-semibold text-foreground">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.original_price && (
                  <>
                    <span className="font-body text-xl text-muted-foreground line-through">
                      ₹{product.original_price.toLocaleString()}
                    </span>
                    <span className="font-body text-sm text-green-600 font-medium">
                      Save ₹{(product.original_price - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="font-body text-sm font-medium text-foreground mb-3 block">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="font-body text-sm font-medium text-foreground mb-3 block">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-muted transition-colors rounded-l-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-body text-base font-medium w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-muted transition-colors rounded-r-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="font-body text-sm text-muted-foreground">
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="sacred"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                >
                  {isAdded ? (
                    <>
                      <Check size={20} className="mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" className="px-4">
                  <Heart size={20} />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-border mb-8">
                <div className="flex flex-col items-center text-center">
                  <Truck size={24} className="text-primary mb-2" />
                  <span className="font-body text-xs text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Shield size={24} className="text-primary mb-2" />
                  <span className="font-body text-xs text-muted-foreground">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RefreshCw size={24} className="text-primary mb-2" />
                  <span className="font-body text-xs text-muted-foreground">Easy Returns</span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                    Description
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="font-body text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {(product.material || product.dimensions || product.weight || product.origin) && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                    Specifications
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {product.material && (
                      <div className="flex justify-between">
                        <span className="font-body text-sm text-muted-foreground">Material</span>
                        <span className="font-body text-sm font-medium text-foreground">{product.material}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <span className="font-body text-sm text-muted-foreground">Dimensions</span>
                        <span className="font-body text-sm font-medium text-foreground">{product.dimensions}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="font-body text-sm text-muted-foreground">Weight</span>
                        <span className="font-body text-sm font-medium text-foreground">{product.weight}</span>
                      </div>
                    )}
                    {product.origin && (
                      <div className="flex justify-between">
                        <span className="font-body text-sm text-muted-foreground">Origin</span>
                        <span className="font-body text-sm font-medium text-foreground">{product.origin}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((item, index) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="group">
                    <div className="relative bg-card rounded-lg overflow-hidden shadow-sacred">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.images[0] || fallbackImages[index % fallbackImages.length]}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-display text-sm font-medium text-foreground line-clamp-1 mb-1">
                          {item.name}
                        </h3>
                        <span className="font-body text-sm font-semibold text-foreground">
                          ₹{item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
