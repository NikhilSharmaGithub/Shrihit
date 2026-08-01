import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Filter, X, Grid3X3, LayoutList } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProducts, useCategories, Product } from "@/hooks/useProducts";

// Fallback images
import productThali from "@/assets/product-thali.jpg";
import productDiya from "@/assets/product-diya.jpg";
import productIncense from "@/assets/product-incense.jpg";
import productBell from "@/assets/product-bell.jpg";

const fallbackImages = [productThali, productDiya, productIncense, productBell];

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

const Collections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Handle URL category parameter
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (categorySlug && categories) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setActiveCategory(category.id);
      }
    } else if (!categorySlug) {
      setActiveCategory("all");
    }
  }, [searchParams, categories]);

  // Update URL when category changes
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      searchParams.delete("category");
    } else {
      const category = categories?.find(c => c.id === categoryId);
      if (category) {
        searchParams.set("category", category.slug);
      }
    }
    setSearchParams(searchParams);
  };

  const categoryList = useMemo(() => {
    const list = [{ id: "all", name: "All Products", count: products?.length || 0 }];
    if (categories) {
      categories.forEach(cat => {
        const count = products?.filter(p => p.category_id === cat.id).length || 0;
        list.push({ id: cat.id, name: cat.name, count });
      });
    }
    return list;
  }, [categories, products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(p => p.category_id === activeCategory);
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "popularity":
      default:
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
    }

    return filtered;
  }, [products, activeCategory, sortBy]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: product.images[0] || fallbackImages[0],
      freeShipping: product.free_shipping,
    });
  };

  const getProductImage = (product: Product, index: number) => {
    return product.images[0] || fallbackImages[index % fallbackImages.length];
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !categories) return "Uncategorized";
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || "Uncategorized";
  };

  const CategoryFilter = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "" : "hidden lg:block"}>
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Categories</h3>
      <div className="space-y-2">
        {categoriesLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
        ) : (
          categoryList.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                handleCategoryChange(category.id);
                if (isMobile) setMobileFilterOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              <span className="font-body text-sm font-medium">{category.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === category.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted-foreground/20 text-muted-foreground"
              }`}>
                {category.count}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="pt-24 md:pt-32 pb-12 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="font-body text-sm tracking-[0.3em] text-primary font-medium mb-3">
              BROWSE OUR COLLECTION
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
              Pooja Essentials
            </h1>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our handpicked collection of authentic brass pooja items, traditional diyas, premium incense, and curated gift sets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-28">
                <CategoryFilter />
              </div>
            </aside>

            {/* Products Section */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden flex items-center gap-2">
                      <Filter size={16} />
                      Filters
                      {activeCategory !== "all" && (
                        <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          1
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="font-display">Filter Products</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <CategoryFilter isMobile />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Active Filter Tags */}
                <div className="hidden lg:flex items-center gap-2">
                  <span className="font-body text-sm text-muted-foreground">
                    {filteredAndSortedProducts.length} products
                  </span>
                  {activeCategory !== "all" && (
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full hover:bg-primary/20 transition-colors"
                    >
                      {categoryList.find(c => c.id === activeCategory)?.name}
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-4 ml-auto">
                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="hidden md:flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors ${
                        viewMode === "grid"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCategory}-${sortBy}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {productsLoading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="bg-card rounded-lg overflow-hidden shadow-sacred">
                        <Skeleton className="aspect-square" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-5 w-1/3" />
                        </div>
                      </div>
                    ))
                  ) : filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className={`group ${viewMode === "list" ? "flex gap-4 bg-card rounded-lg p-4 shadow-sacred" : ""}`}
                      >
                        {viewMode === "grid" ? (
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
                                    e.stopPropagation();
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
                                  onClick={(e) => handleAddToCart(product, e)}
                                  disabled={!product.in_stock}
                                  className="w-full bg-background text-foreground font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-foreground"
                                >
                                  <ShoppingBag size={16} />
                                  {product.in_stock ? "Add to Cart" : "Out of Stock"}
                                </button>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <p className="font-body text-xs text-primary font-medium uppercase tracking-wider mb-1">
                                {getCategoryName(product.category_id)}
                              </p>
                              <h3 className="font-display text-lg font-medium text-foreground mb-3 line-clamp-1">
                                {product.name}
                              </h3>
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
                        ) : (
                          // List View
                          <Link to={`/product/${product.id}`} className="flex gap-4 w-full">
                            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                              <img
                                src={getProductImage(product, index)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                              {product.badge && (
                                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <p className="font-body text-xs text-primary font-medium uppercase tracking-wider mb-1">
                                {getCategoryName(product.category_id)}
                              </p>
                              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-3">
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
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    originalPrice: product.original_price,
                                    image: getProductImage(product, index),
                                    slug: product.slug,
                                  });
                                }}
                                className={`w-10 h-10 border border-border rounded-lg flex items-center justify-center transition-colors ${
                                  isInWishlist(product.id)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "hover:bg-muted"
                                }`}
                              >
                                <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} className={isInWishlist(product.id) ? "" : "text-muted-foreground"} />
                              </button>
                              <Button
                                variant="sacred"
                                size="sm"
                                disabled={!product.in_stock}
                                onClick={(e) => handleAddToCart(product, e)}
                              >
                                <ShoppingBag size={16} className="mr-2" />
                                {product.in_stock ? "Add to Cart" : "Out of Stock"}
                              </Button>
                            </div>
                          </Link>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <p className="font-display text-xl text-muted-foreground">No products found.</p>
                      {activeCategory !== "all" && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setActiveCategory("all")}
                        >
                          View All Products
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collections;
