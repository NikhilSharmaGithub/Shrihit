import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Smartphone, Wallet, Truck, ShieldCheck, Check, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { usePhonePe } from "@/hooks/usePhonePe";
import { useCreateOrder } from "@/hooks/useOrders";
import { getPhonePePendingOrderStorageKey } from "@/lib/phonepe";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { PhonePeMode, PhonePePaymentMode } from "@/lib/store-settings";
import { supabase } from "@/integrations/supabase/client";

const PHONEPE_PAYMENT_MODE_LABELS: Record<PhonePePaymentMode, string> = {
  UPI_INTENT: "Google Pay, PhonePe, Paytm & more",
  UPI_COLLECT: "UPI ID",
  UPI_QR: "UPI QR",
  CARD: "Cards",
  NET_BANKING: "Net Banking",
};

const describePhonePePaymentModes = (modes?: PhonePePaymentMode[] | null) => {
  if (!modes || modes.length === 0) {
    return "UPI, Cards, Net Banking";
  }

  return modes.map((mode) => PHONEPE_PAYMENT_MODE_LABELS[mode] ?? mode).join(", ");
};

interface PendingPhonePeOrderPayload {
  orderData: {
    order_number: string;
    payment_method: string;
    payment_status: string;
    subtotal: number;
    shipping_cost: number;
    total: number;
    shipping_address: {
      full_name: string;
      phone: string;
      address_line1: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: {
      product_id: string;
      product_name: string;
      product_image: string;
      quantity: number;
      price: number;
    }[];
  };
  phonepeMode: PhonePeMode;
}

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { initiatePayment, isLoading: isPhonePeLoading } = usePhonePe();
  const createOrder = useCreateOrder();
  const { data: storeSettings } = useStoreSettings();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingThreshold = storeSettings?.free_shipping_threshold ?? 999;
  const shippingCost = storeSettings?.shipping_cost ?? 99;
  const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;
  const codEnabled = storeSettings?.cod_enabled ?? true;
  const phonePeEnabled = storeSettings?.phonepe_enabled ?? true;
  const noPaymentMethodEnabled = !codEnabled && !phonePeEnabled;

  useEffect(() => {
    if (paymentMethod === "cod" && !codEnabled && phonePeEnabled) {
      setPaymentMethod("phonepe");
      return;
    }

    if (paymentMethod === "phonepe" && !phonePeEnabled && codEnabled) {
      setPaymentMethod("cod");
    }
  }, [codEnabled, phonePeEnabled, paymentMethod]);

  const addMoreForFreeShipping = useMemo(() => {
    if (shipping === 0) {
      return 0;
    }

    return Math.max(0, shippingThreshold - subtotal);
  }, [shipping, shippingThreshold, subtotal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "pincode"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (noPaymentMethodEnabled) {
      toast({
        title: "Payment Unavailable",
        description: "No payment method is currently enabled. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "cod" && !codEnabled) {
      toast({
        title: "COD Disabled",
        description: "Cash on Delivery is currently disabled by admin.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "phonepe" && !phonePeEnabled) {
      toast({
        title: "Online Payment Disabled",
        description: "Online payment is currently disabled by admin.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      const { error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError) {
        setIsProcessing(false);
        toast({
          title: "Order Error",
          description: "Could not start a checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const orderData = {
      order_number: orderNumber,
      payment_method: paymentMethod === "phonepe" ? "phonepe" : "cod",
      payment_status: "pending",
      subtotal,
      shipping_cost: shipping,
      total,
      shipping_address: {
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        address_line1: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      items: items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      if (paymentMethod === "phonepe") {
        const pendingOrderKey = getPhonePePendingOrderStorageKey(orderNumber);
        const phonepeMode = storeSettings?.phonepe_mode ?? "sandbox";
        const pendingPayload: PendingPhonePeOrderPayload = {
          orderData,
          phonepeMode,
        };
        localStorage.setItem(pendingOrderKey, JSON.stringify(pendingPayload));

        await initiatePayment({
          merchantOrderId: orderNumber,
          amount: Math.round(total * 100),
          redirectUrl: `${window.location.origin}/phonepe-return?merchantOrderId=${encodeURIComponent(orderNumber)}`,
          phonepeMode,
          checkoutFlowType: storeSettings?.phonepe_checkout_flow ?? "IFRAME",
          checkoutScriptUrl: storeSettings?.phonepe_checkout_script_url,
          onSuccess: async () => {
            try {
              await createOrder.mutateAsync({
                ...orderData,
                payment_status: "paid",
              });
              localStorage.removeItem(pendingOrderKey);
              clearCart();
              navigate("/order-success");
            } catch (error) {
              console.error("Error creating order:", error);
              toast({
                title: "Order Error",
                description: `Payment successful but failed to save order. Please contact support with order ID: ${orderNumber}.`,
                variant: "destructive",
              });
            }
            setIsProcessing(false);
          },
          onFailure: (error) => {
            localStorage.removeItem(pendingOrderKey);
            setIsProcessing(false);
            toast({
              title: "Payment Failed",
              description: error.message || "PhonePe payment failed. Please try again.",
              variant: "destructive",
            });
          },
        });
        if ((storeSettings?.phonepe_checkout_flow ?? "IFRAME") === "REDIRECT") {
          setIsProcessing(false);
        }
        return;
      } else {
        // Cash on Delivery - create order directly
        await createOrder.mutateAsync(orderData);
        
        clearCart();
        setIsProcessing(false);
        
        toast({
          title: "🎉 Order Placed Successfully!",
          description: "Thank you for your order. You'll receive a confirmation shortly.",
        });
        
        navigate("/order-success");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setIsProcessing(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
          <Link to="/collections">
            <Button variant="sacred">Continue Shopping</Button>
          </Link>
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
          {/* Back Link */}
          <Link 
            to="/collections" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="font-body text-sm">Continue Shopping</span>
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left - Form */}
            <div className="lg:col-span-2">
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-6 shadow-sacred"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-sacred"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="House no, Street, Landmark"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="400001"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-xl p-6 shadow-sacred"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    Payment Method
                  </h2>
                  {noPaymentMethodEnabled && (
                    <p className="text-sm text-destructive mb-4">
                      Admin ne abhi sab payment methods disable kiye hue hain.
                    </p>
                  )}
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {codEnabled && (
                      <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Wallet className="text-primary" size={24} />
                            <div>
                              <p className="font-medium text-foreground">Cash on Delivery</p>
                              <p className="text-sm text-muted-foreground">Pay when you receive</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}
                    {phonePeEnabled && (
                      <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === "phonepe" ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value="phonepe" id="phonepe" />
                        <Label htmlFor="phonepe" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Smartphone className="text-primary" size={24} />
                            <div>
                              <p className="font-medium text-foreground">Pay Online (PhonePe)</p>
                              <p className="text-sm text-muted-foreground">
                                {describePhonePePaymentModes(storeSettings?.phonepe_enabled_payment_modes)}
                              </p>
                            </div>
                            <span className="ml-auto text-xs font-semibold text-primary">
                              {storeSettings?.phonepe_mode === "production" ? "PHONEPE LIVE" : "PHONEPE TEST"}
                            </span>
                          </div>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </motion.div>

                {/* Place Order Button - Mobile */}
                <div className="lg:hidden">
                  <Button 
                    type="submit" 
                    variant="sacred" 
                    size="lg" 
                    className="w-full"
                    disabled={isProcessing || isPhonePeLoading || noPaymentMethodEnabled}
                  >
                    {isProcessing || isPhonePeLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : paymentMethod === "phonepe" ? (
                      `Pay ₹${total.toLocaleString()}`
                    ) : (
                      `Place Order • ₹${total.toLocaleString()}`
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl p-6 shadow-sacred sticky top-28"
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-body text-sm font-semibold text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-foreground"}`}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add ₹{addMoreForFreeShipping.toLocaleString()} more for free shipping
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between mb-6">
                  <span className="font-display text-lg font-semibold text-foreground">Total</span>
                  <span className="font-display text-xl font-semibold text-foreground">
                    ₹{total.toLocaleString()}
                  </span>
                </div>

                {/* Place Order Button - Desktop */}
                <Button 
                  type="submit"
                  form="checkout-form"
                  variant="sacred" 
                  size="lg" 
                  className="w-full hidden lg:flex"
                  disabled={isProcessing || isPhonePeLoading || noPaymentMethodEnabled}
                >
                  {isProcessing || isPhonePeLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : paymentMethod === "phonepe" ? (
                    `Pay ₹${total.toLocaleString()}`
                  ) : (
                    "Place Order"
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck size={18} className="text-primary" />
                    <span>100% Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Truck size={18} className="text-primary" />
                    <span>Fast & Safe Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check size={18} className="text-primary" />
                    <span>Easy Returns & Refunds</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
