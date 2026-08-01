import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  images: string[];
  badge: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  origin: string | null;
  features: string[];
  sizes: string[];
  in_stock: boolean;
  is_active: boolean;
  free_shipping: boolean;
  popularity: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("popularity", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Product not found");
      return data as Product;
    },
    enabled: !!id,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["product", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Product not found");
      return data as Product;
    },
    enabled: !!slug,
  });
};

export const useFeaturedProducts = (limit = 4) => {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("popularity", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useRelatedProducts = (productId: string, categoryId: string | null, limit = 4) => {
  return useQuery({
    queryKey: ["products", "related", productId, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("category_id", categoryId)
        .neq("id", productId)
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!categoryId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as Category[];
    },
  });
};
