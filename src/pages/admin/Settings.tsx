import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Loader2, Mail, MapPin, Phone, Save, Settings as SettingsIcon, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks/useStoreSettings";
import {
  DEFAULT_STORE_SETTINGS,
  getDefaultPhonePeScriptUrl,
  PhonePeMode,
  PhonePePaymentMode,
  PHONEPE_MODE_OPTIONS,
  PHONEPE_PAYMENT_MODE_OPTIONS,
  StoreSettings,
} from "@/lib/store-settings";

const PAYMENT_MODE_LABELS: Record<PhonePePaymentMode, string> = {
  UPI_INTENT: "UPI Intent",
  UPI_COLLECT: "UPI Collect",
  UPI_QR: "UPI QR",
  CARD: "Cards",
  NET_BANKING: "Net Banking",
};

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

  const handlePhonePeModeChange = (value: string) => {
    const nextMode = value as PhonePeMode;
    const defaultScriptUrl = getDefaultPhonePeScriptUrl(nextMode);

    setFormData((prev) => {
      const currentScriptUrl = prev.phonepe_checkout_script_url.trim();
      const previousDefaultScriptUrl = getDefaultPhonePeScriptUrl(prev.phonepe_mode);
      const shouldUseDefaultScript = !currentScriptUrl || currentScriptUrl === previousDefaultScriptUrl;

      return {
        ...prev,
        phonepe_mode: nextMode,
        phonepe_checkout_script_url: shouldUseDefaultScript ? defaultScriptUrl : currentScriptUrl,
      };
    });
  };

  const togglePaymentMode = (mode: PhonePePaymentMode, checked: boolean) => {
    setFormData((prev) => {
      const currentModes = new Set(prev.phonepe_enabled_payment_modes);

      if (checked) {
        currentModes.add(mode);
      } else {
        currentModes.delete(mode);
      }

      return {
        ...prev,
        phonepe_enabled_payment_modes: Array.from(currentModes) as PhonePePaymentMode[],
      };
    });
  };

  const handleSaveSettings = async () => {
    const normalizedScriptUrl =
      formData.phonepe_checkout_script_url.trim() || getDefaultPhonePeScriptUrl(formData.phonepe_mode);

    if (!formData.cod_enabled && !formData.phonepe_enabled) {
      toast({
        title: "Invalid Configuration",
        description: "At least one payment method (COD or PhonePe) must remain enabled.",
        variant: "destructive",
      });
      return;
    }

    if (formData.phonepe_enabled && formData.phonepe_enabled_payment_modes.length === 0) {
      toast({
        title: "Invalid PhonePe Setup",
        description: "Select at least one PhonePe payment mode.",
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
      await updateSettings.mutateAsync({
        ...formData,
        phonepe_checkout_script_url: normalizedScriptUrl,
      });

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
              <h2 className="text-xl font-semibold">PhonePe Master Control</h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable PhonePe</Label>
                  <p className="text-sm text-muted-foreground">Master switch for all online payments via PhonePe</p>
                </div>
                <Switch
                  checked={formData.phonepe_enabled}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, phonepe_enabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PhonePe Environment</Label>
                  <Select value={formData.phonepe_mode} onValueChange={handlePhonePeModeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHONEPE_MODE_OPTIONS.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode === "production" ? "Production (Live)" : "Sandbox (Test)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Checkout Flow</Label>
                  <Select
                    value={formData.phonepe_checkout_flow}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        phonepe_checkout_flow: value as StoreSettings["phonepe_checkout_flow"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select flow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IFRAME">IFrame (Recommended)</SelectItem>
                      <SelectItem value="REDIRECT">Redirect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phonepeScriptUrl">Checkout Script URL</Label>
                <Input
                  id="phonepeScriptUrl"
                  value={formData.phonepe_checkout_script_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phonepe_checkout_script_url: e.target.value }))
                  }
                  placeholder={getDefaultPhonePeScriptUrl(formData.phonepe_mode)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-use default script for selected mode.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Enabled Payment Modes</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PHONEPE_PAYMENT_MODE_OPTIONS.map((mode) => (
                    <label
                      key={mode}
                      className="flex items-center gap-3 rounded-md border border-border px-3 py-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.phonepe_enabled_payment_modes.includes(mode)}
                        onCheckedChange={(checked) => togglePaymentMode(mode, checked === true)}
                      />
                      <span className="text-sm text-foreground">{PAYMENT_MODE_LABELS[mode]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Disable Payment Retry</Label>
                  <p className="text-sm text-muted-foreground">If enabled, users cannot retry payment on same session</p>
                </div>
                <Switch
                  checked={formData.phonepe_disable_payment_retry}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, phonepe_disable_payment_retry: checked }))
                  }
                />
              </div>

              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                Security note: PhonePe `client_id` / `client_secret` Admin panel me intentionally show nahi kiye gaye hain.
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
