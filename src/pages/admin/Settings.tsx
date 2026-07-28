import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Loader2, Mail, MapPin, Phone, Save, Settings as SettingsIcon, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks/useStoreSettings";
import { DEFAULT_STORE_SETTINGS, StoreSettings } from "@/lib/store-settings";

const Settings = () => {
  const { toast } = useToast();
  const { data: persistedSettings, isLoading: isSettingsLoading } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();
  const [formData, setFormData] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    if (persistedSettings) {
      setFormData(persistedSettings);
    }
  }, [persistedSettings]);

  const isSaving = updateSettings.isPending;

  const handleSaveSettings = async () => {
    if (!formData.cod_enabled && !formData.razorpay_enabled) {
      toast({
        title: "Invalid Configuration",
        description: "At least one payment method (COD or Razorpay) must remain enabled.",
        variant: "destructive",
      });
      return;
    }

    if (formData.free_shipping_threshold < 0 || formData.shipping_cost < 0) {
      toast({
        title: "Invalid Shipping Values",
        description: "Shipping values cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSettings.mutateAsync(formData);

      toast({
        title: "Settings Saved",
        description: "Master payment settings updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save settings.",
        variant: "destructive",
      });
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center gap-3 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Master control for store and payment integration</p>
        </div>

        <div className="max-w-3xl space-y-8">
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
                  value={formData.store_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, store_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
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
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone size={14} className="inline mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
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
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="+919876543210"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SettingsIcon size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Order Fulfillment</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freeShipping">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeShipping"
                    type="number"
                    min={0}
                    value={formData.free_shipping_threshold}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, free_shipping_threshold: Number(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost (₹)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    min={0}
                    value={formData.shipping_cost}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, shipping_cost: Number(e.target.value) || 0 }))
                    }
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
                    checked={formData.cod_enabled}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, cod_enabled: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard size={20} className="text-purple-700" />
              </div>
              <h2 className="text-xl font-semibold">Razorpay Master Control</h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Razorpay</Label>
                  <p className="text-sm text-muted-foreground">Master switch for online payments via Razorpay (UPI, Cards, Net Banking, Wallets)</p>
                </div>
                <Switch
                  checked={formData.razorpay_enabled}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, razorpay_enabled: checked }))}
                />
              </div>

              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                Security note: Razorpay `key_id` / `key_secret` Admin panel me intentionally show nahi kiye gaye hain.
                Ye secrets server-side Supabase Edge Function secrets me secure rehte hain.
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <Save className="mr-2" size={18} />
            )}
            Save Master Settings
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
