import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Package, Tags, ShoppingCart, User, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_data: unknown;
  new_data: unknown;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const entityIcons: Record<string, React.ReactNode> = {
  product: <Package size={16} />,
  category: <Tags size={16} />,
  order: <ShoppingCart size={16} />,
  user: <User size={16} />,
};

const actionColors: Record<string, string> = {
  created: "bg-green-100 text-green-800",
  updated: "bg-blue-100 text-blue-800",
  deleted: "bg-red-100 text-red-800",
};

const ActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setLogs((data || []) as ActivityLog[]);
    }
    setIsLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesEntity && matchesAction;
  });

  const formatChanges = (log: ActivityLog) => {
    if (!log.new_data || typeof log.new_data !== 'object') return null;

    const newData = log.new_data as Record<string, unknown>;
    const oldData = (log.old_data && typeof log.old_data === 'object') 
      ? log.old_data as Record<string, unknown> 
      : null;

    const changes = Object.entries(newData).map(([key, value]) => {
      const oldValue = oldData?.[key];
      if (oldValue !== undefined && oldValue !== value) {
        return `${key}: ${String(oldValue)} → ${String(value)}`;
      }
      return `${key}: ${String(value)}`;
    });

    return changes.slice(0, 3).join(", ") + (changes.length > 3 ? "..." : "");
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Activity Log</h1>
          <p className="text-muted-foreground">Track all admin actions and changes</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Products</SelectItem>
              <SelectItem value="category">Categories</SelectItem>
              <SelectItem value="order">Orders</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
            <History size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity logs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-xl p-4 shadow-sm border border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    {entityIcons[log.entity_type] || <History size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={actionColors[log.action] || "bg-gray-100"}>
                        {log.action}
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {log.entity_type}
                      </span>
                      {log.entity_name && (
                        <span className="font-medium truncate">{log.entity_name}</span>
                      )}
                    </div>
                    {log.new_data && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {formatChanges(log)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{log.profile?.full_name || log.profile?.email || "Admin"}</span>
                      <span>•</span>
                      <span title={format(new Date(log.created_at), "dd MMM yyyy, HH:mm:ss")}>
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActivityLog;
