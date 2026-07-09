import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, Heart, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import shrihitLogo from "@/assets/shrihit-logo.jpg";
import SearchDialog from "@/components/SearchDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsGuest(session?.user?.is_anonymous ?? false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsGuest(session?.user?.is_anonymous ?? false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been signed out successfully.",
    });
    navigate("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "/collections" },
    { name: "Diyas & Lamps", href: "/collections?category=diyas-lamps" },
    { name: "Diwali Special", href: "/collections?category=festival-specials" },
    { name: "Gift Sets", href: "/collections?category=gift-sets" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src={shrihitLogo} 
                alt="Shrihit" 
                className="h-12 md:h-14 w-12 md:w-14 rounded-full object-cover ring-2 ring-primary/80 animate-logo-glow"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="font-body text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-3 md:gap-5">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-foreground hover:text-primary transition-colors"
                aria-label="Search products"
              >
                <Search size={20} />
              </button>
              
              <Link 
                to="/wishlist" 
                className="hidden md:block relative p-2 text-foreground hover:text-primary transition-colors"
                aria-label="View wishlist"
              >
                <Heart size={20} />
                <AnimatePresence>
                  {wishlistItems > 0 && (
                    <motion.span
                      key={wishlistItems}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center"
                    >
                      {wishlistItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              
              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-2 p-2 text-foreground hover:text-primary transition-colors">
                      <User size={20} />
                      {isGuest && <span className="text-xs text-muted-foreground">Guest</span>}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card">
                    <DropdownMenuItem asChild>
                      <Link to={isGuest ? "/auth" : "/account"} className="cursor-pointer">
                        <User size={16} className="mr-2" />
                        {isGuest ? "Create Account" : "My Account"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" className="hidden md:block p-2 text-foreground hover:text-primary transition-colors">
                  <User size={20} />
                </Link>
              )}
              
              <button 
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-foreground hover:text-primary transition-colors"
                aria-label="View cart"
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t border-border"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="font-body text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile Wishlist Link */}
                <Link
                  to="/wishlist"
                  className="font-body text-base font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart size={18} />
                  Wishlist
                  {wishlistItems > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                      {wishlistItems}
                    </span>
                  )}
                </Link>
                
                <div className="border-t border-border pt-4">
                  {user ? (
                    <>
                      <Link
                        to={isGuest ? "/auth" : "/account"}
                        className="font-body text-base font-medium text-foreground hover:text-primary transition-colors block mb-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {isGuest ? "Create Account" : "My Account"}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="font-body text-base font-medium text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="font-body text-base font-medium text-primary hover:text-primary/80 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login / Sign Up
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
