import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Search, Filter, Package, Clock, CheckCircle, XCircle, Truck, Download, Printer, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  processing: <Package size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          toast({
            title: "🎉 New Order Received!",
            description: `Order #${(payload.new as { order_number: string }).order_number} just came in.`,
          });
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const typedData = (data || []).map(order => ({
        ...order,
        shipping_address: order.shipping_address as unknown as ShippingAddress,
      }));
      setOrders(typedData);
    }
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "updated",
        entity_type: "order",
        entity_id: orderId,
        entity_name: orders.find(o => o.id === orderId)?.order_number,
        new_data: { status: newStatus },
      });
    }

    toast({ title: "Success", description: "Order status updated" });
    fetchOrders();
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const exportToCsv = () => {
    const headers = ["Order Number", "Customer", "City", "Status", "Payment Status", "Payment Method", "Total", "Date"];
    const rows = filteredOrders.map((order) => [
      order.order_number,
      order.shipping_address.full_name,
      order.shipping_address.city,
      order.status,
      order.payment_status,
      order.payment_method,
      order.total,
      format(new Date(order.created_at), "dd MMM yyyy HH:mm"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printInvoice = () => {
    if (!selectedOrder) return;

    const itemsHtml = (selectedOrder.order_items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 0;">${item.product_name}</td>
          <td style="padding:8px 0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;">₹${item.price}</td>
          <td style="padding:8px 0;text-align:right;">₹${item.price * item.quantity}</td>
        </tr>`
      )
      .join("");

    const invoiceWindow = window.open("", "_blank", "width=800,height=900");
    if (!invoiceWindow) return;

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${selectedOrder.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a1a; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; border-bottom: 2px solid #333; padding-bottom: 8px; }
            th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
            th:nth-child(2) { text-align: center; }
            .total-row td { border-top: 2px solid #333; font-weight: bold; padding-top: 8px; }
            .meta { color: #555; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <h1>Shrihit</h1>
          <p class="meta">Invoice for Order #${selectedOrder.order_number}</p>
          <p class="meta">Date: ${format(new Date(selectedOrder.created_at), "dd MMM yyyy, HH:mm")}</p>
          <p class="meta">Payment: ${selectedOrder.payment_method.toUpperCase()} (${selectedOrder.payment_status})</p>
          <hr />
          <p><strong>${selectedOrder.shipping_address.full_name}</strong></p>
          <p>${selectedOrder.shipping_address.address_line1}${selectedOrder.shipping_address.address_line2 ? ", " + selectedOrder.shipping_address.address_line2 : ""}</p>
          <p>${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.state} - ${selectedOrder.shipping_address.pincode}</p>
          <p>Phone: ${selectedOrder.shipping_address.phone}</p>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr><td colspan="3" style="padding-top:12px;">Subtotal</td><td style="text-align:right;padding-top:12px;">₹${selectedOrder.subtotal}</td></tr>
              <tr><td colspan="3">Shipping</td><td style="text-align:right;">₹${selectedOrder.shipping_cost}</td></tr>
              <tr class="total-row"><td colspan="3">Total</td><td style="text-align:right;">₹${selectedOrder.total}</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Orders</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Manage customer orders
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <Bell size={12} /> Live updates on
              </span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCsv} disabled={filteredOrders.length === 0}>
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "bg-muted" },
            { label: "Pending", value: stats.pending, color: "bg-yellow-100" },
            { label: "Processing", value: stats.processing, color: "bg-blue-100" },
            { label: "Shipped", value: stats.shipped, color: "bg-purple-100" },
            { label: "Delivered", value: stats.delivered, color: "bg-green-100" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number or customer..."
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.order_number}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <p className="font-medium">{order.shipping_address.full_name}</p>
                        <p className="text-sm text-muted-foreground">{order.shipping_address.city}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className={`w-32 h-8 text-xs ${statusColors[order.status]}`}>
                          <div className="flex items-center gap-1">
                            {statusIcons[order.status]}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">₹{order.total}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {format(new Date(order.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)}>
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4 pr-8">
                <DialogTitle className="font-display">
                  Order #{selectedOrder?.order_number}
                </DialogTitle>
                <Button variant="outline" size="sm" onClick={printInvoice}>
                  <Printer size={16} className="mr-2" />
                  Print Invoice
                </Button>
              </div>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedOrder.status]}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <Badge variant={selectedOrder.payment_status === "paid" ? "default" : "secondary"}>
                      {selectedOrder.payment_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(new Date(selectedOrder.created_at), "dd MMM yyyy, HH:mm")}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <p>{selectedOrder.shipping_address.full_name}</p>
                  <p className="text-muted-foreground">
                    {selectedOrder.shipping_address.address_line1}
                    {selectedOrder.shipping_address.address_line2 && `, ${selectedOrder.shipping_address.address_line2}`}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                  </p>
                  <p className="text-muted-foreground">Phone: {selectedOrder.shipping_address.phone}</p>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-medium mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-muted/30 rounded-lg p-3">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{selectedOrder.shipping_cost}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                    <span>Total</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Orders;
