import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Store, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [storeSettings, setStoreSettings] = useState({
    storeName: "Shrihit",
    tagline: "Sacred Craftsmanship for Divine Moments",
    email: "contact@shrihit.in",
    phone: "+91 98765 43210",
    address: "Moradabad, Uttar Pradesh, India",
    whatsappNumber: "+919876543210",
  });

  const [orderSettings, setOrderSettings] = useState({
    freeShippingThreshold: "999",
    shippingCost: "99",
    codEnabled: true,
    onlinePaymentEnabled: true,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate save - in production, save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your store configuration</p>
        </div>

        <div className="max-w-2xl space-y-8">
          {/* Store Information */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Store Information</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={storeSettings.tagline}
                  onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail size={14} className="inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone size={14} className="inline mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin size={14} className="inline mr-1" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={storeSettings.whatsappNumber}
                  onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                  placeholder="+919876543210"
                />
              </div>
            </div>
          </div>

          {/* Order Settings */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SettingsIcon size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Order Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freeShipping">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeShipping"
                    type="number"
                    value={orderSettings.freeShippingThreshold}
                    onChange={(e) => setOrderSettings({ ...orderSettings, freeShippingThreshold: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost (₹)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    value={orderSettings.shippingCost}
                    onChange={(e) => setOrderSettings({ ...orderSettings, shippingCost: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cash on Delivery</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to pay on delivery</p>
                  </div>
                  <Switch
                    checked={orderSettings.codEnabled}
                    onCheckedChange={(checked) => setOrderSettings({ ...orderSettings, codEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Online Payment</Label>
                    <p className="text-sm text-muted-foreground">Accept online payments (Razorpay)</p>
                  </div>
                  <Switch
                    checked={orderSettings.onlinePaymentEnabled}
                    onCheckedChange={(checked) => setOrderSettings({ ...orderSettings, onlinePaymentEnabled: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSaveSettings} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <Save className="mr-2" size={18} />
            )}
            Save Settings
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
