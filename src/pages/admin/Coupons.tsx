import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_until: string | null;
  is_active: boolean;
}

const emptyForm = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: "",
  min_order_amount: "0",
  max_discount_amount: "",
  usage_limit: "",
  valid_until: "",
  is_active: true,
};

const Coupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Could not load coupons", description: error.message, variant: "destructive" });
    } else {
      setCoupons((data || []) as Coupon[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const value = Number(formData.discount_value);
    if (!formData.code.trim() || !Number.isFinite(value) || value <= 0) {
      toast({
        title: "Check the details",
        description: "A code and a discount greater than zero are required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.discount_type === "percent" && value > 100) {
      toast({
        title: "Invalid percentage",
        description: "A percentage discount cannot be more than 100.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || null,
      discount_type: formData.discount_type,
      discount_value: value,
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount
        ? Number(formData.max_discount_amount)
        : null,
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      is_active: formData.is_active,
    });
    setIsSaving(false);

    if (error) {
      toast({
        title: "Could not save coupon",
        description: error.message.includes("duplicate")
          ? "That code already exists."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Coupon created", description: `${formData.code.toUpperCase()} is ready to use.` });
    setFormData(emptyForm);
    setIsDialogOpen(false);
    fetchCoupons();
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    fetchCoupons();
  };

  const deleteCoupon = async (coupon: Coupon) => {
    const { error } = await supabase.from("coupons").delete().eq("id", coupon.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Coupon deleted" });
    fetchCoupons();
  };

  const describe = (c: Coupon) =>
    c.discount_type === "percent"
      ? `${c.discount_value}% off${c.max_discount_amount ? ` (max ₹${c.max_discount_amount})` : ""}`
      : `₹${c.discount_value} off`;

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Coupons</h1>
            <p className="text-muted-foreground">Discount codes customers can apply at checkout</p>
          </div>
          <Button variant="sacred" onClick={() => setIsDialogOpen(true)}>
            <Plus size={18} className="mr-2" />
            New Coupon
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex items-center gap-2 text-muted-foreground">
              <Loader2 size={18} className="animate-spin" />
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                No coupons yet. Create one to start offering discounts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min order</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <span className="font-mono font-medium">{coupon.code}</span>
                        {coupon.description && (
                          <p className="text-xs text-muted-foreground">{coupon.description}</p>
                        )}
                      </TableCell>
                      <TableCell>{describe(coupon)}</TableCell>
                      <TableCell>
                        {coupon.min_order_amount > 0 ? `₹${coupon.min_order_amount}` : "—"}
                      </TableCell>
                      <TableCell>
                        {coupon.used_count}
                        {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                      </TableCell>
                      <TableCell>
                        {coupon.valid_until
                          ? format(new Date(coupon.valid_until), "dd MMM yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={coupon.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleActive(coupon)}
                        >
                          {coupon.is_active ? "Active" : "Off"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCoupon(coupon)}
                          aria-label={`Delete ${coupon.code}`}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">New Coupon</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="DIWALI20"
                className="uppercase font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Diwali festive offer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v) => setFormData({ ...formData, discount_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Flat amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  {formData.discount_type === "percent" ? "Percent off *" : "Amount off (₹) *"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min={1}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_order_amount">Min order (₹)</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  min={0}
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                />
              </div>

              {formData.discount_type === "percent" && (
                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">Max discount (₹)</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    min={0}
                    value={formData.max_discount_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, max_discount_amount: e.target.value })
                    }
                    placeholder="No cap"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Usage limit</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min={1}
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Expires on</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="sacred" className="flex-1" disabled={isSaving}>
                {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                Create coupon
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;
