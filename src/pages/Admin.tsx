import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  LogOut, 
  Menu, 
  X,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  Settings,
  History,
  ChevronLeft,
  User,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin/login");
      return;
    }

    // Check if user has admin role using the secure has_role function
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: session.user.id,
      _role: "admin"
    });

    if (!isAdmin) {
      await supabase.auth.signOut();
      navigate("/admin/login");
      return;
    }

    // Get profile for display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", session.user.id)
      .maybeSingle();

    setAdminName(profile?.full_name || profile?.email || session.user.email || "Admin");
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been signed out successfully.",
    });
    navigate("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Blog Posts", href: "/admin/blog", icon: FileText },
    { name: "Activity Log", href: "/admin/activity", icon: History },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-16 flex items-center px-4 lg:px-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 lg:hidden"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop collapse toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="hidden lg:flex p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className={`transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold text-foreground">श्रीहित</span>
            <span className="font-display text-sm text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">ADMIN</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag size={18} />
            <span>View Store</span>
          </Link>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{adminName}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <User size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-background border-r border-border transform transition-all duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'lg:w-16' : 'w-64'}`}>
        <nav className="p-3 space-y-1 h-full flex flex-col">
          <div className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== "/admin" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <item.icon size={20} />
                  {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="pt-4 border-t border-border space-y-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors lg:hidden"
            >
              <ShoppingBag size={20} />
              {!isSidebarCollapsed && <span className="font-medium">View Store</span>}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
              title={isSidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut size={20} />
              {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
