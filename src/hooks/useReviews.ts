import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  verified_purchase: boolean;
  created_at: string;
}

export interface RatingSummary {
  average: number;
  count: number;
  /** Count of reviews per star, index 0 = 1 star. */
  breakdown: number[];
}

export const useReviews = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Review[];
    },
    enabled: !!productId,
  });
};

export const summariseReviews = (reviews: Review[] | undefined): RatingSummary => {
  if (!reviews || reviews.length === 0) {
    return { average: 0, count: 0, breakdown: [0, 0, 0, 0, 0] };
  }

  const breakdown = [0, 0, 0, 0, 0];
  let total = 0;
  for (const review of reviews) {
    total += review.rating;
    breakdown[review.rating - 1] += 1;
  }

  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
    breakdown,
  };
};

interface SubmitReviewData {
  productId: string;
  rating: number;
  comment: string;
  authorName: string;
}

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, rating, comment, authorName }: SubmitReviewData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.is_anonymous) {
        throw new Error("Please sign in to write a review.");
      }

      // upsert so a customer editing their review replaces it rather than
      // tripping the one-review-per-product constraint
      const { error } = await supabase.from("reviews").upsert(
        {
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
          author_name: authorName.trim() || "Customer",
        },
        { onConflict: "user_id,product_id" }
      );

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
    },
  });
};
