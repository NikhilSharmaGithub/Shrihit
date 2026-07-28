import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Tags, Users, TrendingUp, Plus, ShoppingCart, IndianRupee, Clock, ArrowUpRight, ArrowDownRight, AlertTriangle, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 5;

interface LowStockProduct {
  id: string;
  name: string;
  stock_qty: number;
  images: string[];
}

interface TopProduct {
  product_name: string;
  quantity: number;
  revenue: number;
}

interface OrderStats {
  date: string;
  orders: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: {
    full_name: string;
  };
}

const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    fetchOrderStats();
    fetchInventoryAlerts();
    fetchTopProducts();
  }, []);

  const fetchInventoryAlerts = async () => {
    const [{ data: lowStock }, { count: outOfStock }] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, stock_qty, images")
        .eq("is_active", true)
        .gt("stock_qty", 0)
        .lte("stock_qty", LOW_STOCK_THRESHOLD)
        .order("stock_qty", { ascending: true })
        .limit(5),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("in_stock", false),
    ]);

    setLowStockProducts(lowStock || []);
    setOutOfStockCount(outOfStock || 0);
  };

  const fetchTopProducts = async () => {
    const { data } = await supabase
      .from("order_items")
      .select("product_name, quantity, price");

    if (!data) return;

    const totals = new Map<string, TopProduct>();
    for (const item of data) {
      const existing = totals.get(item.product_name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.quantity * item.price;
      } else {
        totals.set(item.product_name, {
          product_name: item.product_name,
          quantity: item.quantity,
          revenue: item.quantity * item.price,
        });
      }
    }

    setTopProducts(
      Array.from(totals.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
    );
  };

  const fetchStats = async () => {
    const [
      { count: productsCount },
      { count: activeCount },
      { count: categoriesCount },
      { count: usersCount },
      { count: ordersCount, data: ordersData },
      { count: pendingCount },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total", { count: "exact" }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setTotalProducts(productsCount || 0);
    setActiveProducts(activeCount || 0);
    setTotalCategories(categoriesCount || 0);
    setTotalUsers(usersCount || 0);
    setTotalOrders(ordersCount || 0);
    setPendingOrders(pendingCount || 0);

    // Calculate total revenue
    const { data: allOrders } = await supabase.from("orders").select("total");
    const revenue = allOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    setTotalRevenue(revenue);

    setIsLoading(false);
  };

  const fetchRecentOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total, status, created_at, shipping_address")
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      const typedOrders = data.map(order => ({
        ...order,
        shipping_address: order.shipping_address as unknown as { full_name: string },
      }));
      setRecentOrders(typedOrders);
    }
  };

  const fetchOrderStats = async () => {
    // Get orders from last 7 days
    const stats: OrderStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date).toISOString();
      const end = endOfDay(date).toISOString();

      const { data } = await supabase
        .from("orders")
        .select("total")
        .gte("created_at", start)
        .lte("created_at", end);

      stats.push({
        date: format(date, "EEE"),
        orders: data?.length || 0,
        revenue: data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0,
      });
    }
    setOrderStats(stats);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-green-100 text-green-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
      trend: pendingOrders > 0 ? "Action needed" : "All clear",
      trendUp: false,
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Products",
      value: activeProducts,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Categories",
      value: totalCategories,
      icon: Tags,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your store admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              {stat.trend && (
                <span className={`text-xs flex items-center gap-0.5 ${stat.trendUp ? "text-green-600" : "text-muted-foreground"}`}>
                  {stat.trendUp ? <ArrowUpRight size={12} /> : null}
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="font-semibold mb-4">Revenue (Last 7 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderStats}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="font-semibold mb-4">Orders (Last 7 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Inventory Alerts & Top Products */}
      {(lowStockProducts.length > 0 || outOfStockCount > 0 || topProducts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {(lowStockProducts.length > 0 || outOfStockCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-amber-600" />
                <h2 className="font-semibold">Inventory Alerts</h2>
              </div>
              <div className="space-y-2">
                {outOfStockCount > 0 && (
                  <Link
                    to="/admin/products"
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-red-700">Out of stock</span>
                    <Badge className="bg-red-600 hover:bg-red-600">{outOfStockCount}</Badge>
                  </Link>
                )}
                {lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    to="/admin/products"
                    className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name} className="w-9 h-9 rounded object-cover" />
                    )}
                    <p className="flex-1 text-sm font-medium truncate">{product.name}</p>
                    <Badge variant="outline" className="border-amber-600 text-amber-700">
                      {product.stock_qty} left
                    </Badge>
                  </Link>
                ))}
                {lowStockProducts.length === 0 && outOfStockCount === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">All products well stocked</p>
                )}
              </div>
            </motion.div>
          )}

          {topProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Flame size={18} className="text-orange-500" />
                <h2 className="font-semibold">Top Selling Products</h2>
              </div>
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div key={product.product_name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-sm font-medium truncate">{product.product_name}</p>
                    <p className="text-sm text-muted-foreground shrink-0">{product.quantity} sold</p>
                    <p className="text-sm font-semibold shrink-0">₹{product.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.shipping_address?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Plus size={18} />
              </div>
              <div>
                <p className="font-medium">Add Product</p>
                <p className="text-xs text-muted-foreground">Create new product</p>
              </div>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <ShoppingCart size={18} />
              </div>
              <div>
                <p className="font-medium">Manage Orders</p>
                <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
              </div>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Tags size={18} />
              </div>
              <div>
                <p className="font-medium">Categories</p>
                <p className="text-xs text-muted-foreground">{totalCategories} total</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
