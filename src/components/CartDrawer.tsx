import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const navigate = useNavigate();
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="font-display text-2xl flex items-center gap-3">
            <ShoppingBag className="text-primary" size={24} />
            Your Cart
            {totalItems > 0 && (
              <span className="text-sm font-body font-normal text-muted-foreground">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Your cart is empty</h3>
            <p className="font-body text-muted-foreground mb-6">
              Add some sacred items to begin your spiritual journey.
            </p>
            <Button variant="sacred" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4"
                  >
                    <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm font-medium text-foreground line-clamp-2 mb-1">
                          {item.name}
                        </h4>
                        {item.size && (
                          <p className="font-body text-xs text-muted-foreground mb-2">
                            Size: {item.size}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm font-semibold text-foreground">
                            ₹{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="font-body text-xs text-muted-foreground line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-center gap-1 bg-background rounded-lg border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-muted transition-colors rounded-l-lg"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-body text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-muted transition-colors rounded-r-lg"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="font-body text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl font-semibold text-foreground">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              {/* Shipping Note */}
              <p className="font-body text-xs text-muted-foreground text-center">
                Shipping & taxes calculated at checkout
              </p>

              {/* Checkout Button */}
              <Button 
                variant="sacred" 
                className="w-full" 
                size="lg"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/checkout");
                }}
              >
                Proceed to Checkout
                <ArrowRight size={18} className="ml-2" />
              </Button>

              {/* Continue Shopping */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
