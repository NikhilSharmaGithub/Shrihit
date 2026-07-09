import { useEffect, useState } from "react";
import type { Json } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  badge: string | null;
  is_active: boolean;
  in_stock: boolean;
  stock_qty: number;
  images: string[];
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    short_description: "",
    description: "",
    price: "",
    original_price: "",
    stock_qty: "0",
    category_id: "",
    badge: "",
    material: "",
    dimensions: "",
    weight: "",
    origin: "",
    features: "",
    sizes: "",
    tags: "",
    is_active: true,
    in_stock: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*").order("updated_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);

    if (productsRes.error) {
      toast({ title: "Error", description: productsRes.error.message, variant: "destructive" });
    } else {
      setProducts((productsRes.data || []) as Product[]);
    }

    setCategories(categoriesRes.data || []);
    setIsLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const getUniqueSlug = async (rawSlug: string, currentProductId?: string) => {
    const baseSlug = generateSlug(rawSlug) || "product";
    let candidate = baseSlug;
    let suffix = 2;

    while (true) {
      let query = supabase
        .from("products")
        .select("id")
        .eq("slug", candidate)
        .limit(1);

      if (currentProductId) {
        query = query.neq("id", currentProductId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) return candidate;

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  };

  const getProductErrorMessage = (message: string) => {
    if (message.includes("products_slug_key")) {
      return "A product with this slug already exists. Please use a different product name or slug.";
    }

    return message;
  };

  const generateSku = (name: string) => {
    const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix || "PRD"}-${random}`;
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingProduct ? formData.slug : generateSlug(name),
      sku: editingProduct ? formData.sku : (formData.sku || generateSku(name)),
    });
  };

  const openDialog = async (product?: Product) => {
    if (product) {
      // Fetch full product data
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", product.id)
        .maybeSingle();

      if (data) {
        setEditingProduct(data as Product);
        setUploadedImages(data.images || []);
        setFormData({
          name: data.name,
          slug: data.slug,
          sku: data.sku || "",
          short_description: data.short_description || "",
          description: data.description || "",
          price: data.price.toString(),
          original_price: data.original_price?.toString() || "",
          stock_qty: (data.stock_qty || 0).toString(),
          category_id: data.category_id || "",
          badge: data.badge || "",
          material: data.material || "",
          dimensions: data.dimensions || "",
          weight: data.weight || "",
          origin: data.origin || "",
          features: (data.features || []).join(", "),
          sizes: (data.sizes || []).join(", "),
          tags: (data.tags || []).join(", "),
          is_active: data.is_active,
          in_stock: data.in_stock,
        });
      }
    } else {
      setEditingProduct(null);
      setUploadedImages([]);
      setFormData({
        name: "",
        slug: "",
        sku: "",
        short_description: "",
        description: "",
        price: "",
        original_price: "",
        stock_qty: "0",
        category_id: "",
        badge: "",
        material: "",
        dimensions: "",
        weight: "",
        origin: "",
        features: "",
        sizes: "",
        tags: "",
        is_active: true,
        in_stock: true,
      });
    }
    setIsDialogOpen(true);
  };

  const logActivity = async (action: string, entityId: string, entityName: string, oldData?: Record<string, unknown>, newData?: Record<string, unknown>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("activity_logs").insert([{
        user_id: user.id,
        action,
        entity_type: "product",
        entity_id: entityId,
        entity_name: entityName,
        old_data: (oldData as Json) || null,
        new_data: (newData as Json) || null,
      }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uniqueSlug = "";

    try {
      uniqueSlug = await getUniqueSlug(
        formData.slug || formData.name,
        editingProduct?.id
      );
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to check product slug",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      slug: uniqueSlug,
      sku: formData.sku || null,
      short_description: formData.short_description || null,
      description: formData.description || null,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock_qty: parseInt(formData.stock_qty) || 0,
      category_id: formData.category_id || null,
      badge: formData.badge || null,
      material: formData.material || null,
      dimensions: formData.dimensions || null,
      weight: formData.weight || null,
      origin: formData.origin || null,
      features: formData.features ? formData.features.split(",").map(f => f.trim()).filter(Boolean) : [],
      sizes: formData.sizes ? formData.sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      images: uploadedImages,
      is_active: formData.is_active,
      in_stock: formData.in_stock,
    };

    if (editingProduct) {
      const { error, data } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id)
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: getProductErrorMessage(error.message), variant: "destructive" });
        return;
      }
      
      await logActivity("updated", editingProduct.id, productData.name, 
        { price: editingProduct.price, is_active: editingProduct.is_active },
        { price: productData.price, is_active: productData.is_active }
      );
      
      toast({ title: "Success", description: "Product updated successfully" });
    } else {
      const { error, data } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: getProductErrorMessage(error.message), variant: "destructive" });
        return;
      }

      if (data) {
        await logActivity("created", data.id, productData.name, undefined, { price: productData.price });
      }
      
      toast({ title: "Success", description: "Product created successfully" });
    }

    setIsDialogOpen(false);
    fetchData();
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", productToDelete.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await logActivity("deleted", productToDelete.id, productToDelete.name);
    toast({ title: "Success", description: "Product deleted successfully" });
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    fetchData();
  };

  const toggleProductStatus = async (product: Product, field: 'is_active' | 'in_stock') => {
    const newValue = !product[field];
    const { error } = await supabase
      .from("products")
      .update({ [field]: newValue })
      .eq("id", product.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await logActivity("updated", product.id, product.name, 
      { [field]: product[field] },
      { [field]: newValue }
    );
    fetchData();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && p.is_active) ||
      (statusFilter === "draft" && !p.is_active) ||
      (statusFilter === "in_stock" && p.in_stock) ||
      (statusFilter === "out_of_stock" && !p.in_stock);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "—";
    return categories.find(c => c.id === categoryId)?.name || "—";
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
              Products
            </h1>
            <p className="text-muted-foreground">
              {products.length} total products
            </p>
          </div>
          <Button variant="sacred" onClick={() => openDialog()}>
            <Plus size={18} className="mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or SKU..."
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-sm border border-border">
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all" 
                ? "No products found matching your filters" 
                : "No products yet"}
            </p>
            {!searchQuery && categoryFilter === "all" && statusFilter === "all" && (
              <Button variant="sacred" onClick={() => openDialog()}>
                <Plus size={18} className="mr-2" />
                Create First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Updated</TableHead>
                  <TableHead className="text-right w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          No img
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{getCategoryName(product.category_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {product.sku || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">₹{product.price}</span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ₹{product.original_price}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge 
                        variant={product.in_stock ? "default" : "secondary"}
                        className={product.in_stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {product.in_stock ? `${product.stock_qty || "∞"}` : "Out"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.is_active ? "default" : "secondary"}
                        className={product.is_active ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}
                      >
                        {product.is_active ? "Active" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {format(new Date(product.updated_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(product)}>
                            <Pencil size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleProductStatus(product, 'is_active')}>
                            {product.is_active ? "Set as Draft" : "Set as Active"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleProductStatus(product, 'in_stock')}>
                            {product.in_stock ? "Mark Out of Stock" : "Mark In Stock"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(product)}
                            className="text-destructive"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Images Section */}
              <div className="space-y-2">
                <Label>Product Images</Label>
                <ImageUploader 
                  images={uploadedImages} 
                  onImagesChange={setUploadedImages}
                  maxImages={5}
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="PRD-1234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="product-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2499"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Compare at Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="2999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_qty">Stock Quantity</Label>
                  <Input
                    id="stock_qty"
                    type="number"
                    min="0"
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief product tagline..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product description..."
                  rows={4}
                />
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="Brass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="12 inches"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="500g"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="Moradabad"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Bestseller, New, Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="pooja, brass, diya"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Handcrafted, Premium quality, Traditional design"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizes">Available Sizes (comma-separated)</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="Small, Medium, Large"
                />
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-8 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active (visible on store)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="sacred" className="flex-1">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Products;
