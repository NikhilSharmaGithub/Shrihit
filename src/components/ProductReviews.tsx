import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useReviews, useSubmitReview, summariseReviews } from "@/hooks/useReviews";

interface Props {
  productId: string;
}

const StarRow = ({ value, size = 16 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40"}
      />
    ))}
  </div>
);

const ProductReviews = ({ productId }: Props) => {
  const { toast } = useToast();
  const { data: reviews, isLoading } = useReviews(productId);
  const submitReview = useSubmitReview();
  const summary = summariseReviews(reviews);

  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCanReview(!!user && !user.is_anonymous);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast({
        title: "Choose a rating",
        description: "Tap a star to rate this product.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitReview.mutateAsync({ productId, rating, comment, authorName });
      toast({ title: "Thanks for the review!", description: "Your feedback is now live." });
      setRating(0);
      setComment("");
    } catch (error) {
      toast({
        title: "Could not save review",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="border-t border-border pt-12">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
        Ratings &amp; Reviews
      </h2>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={18} className="animate-spin" />
          Loading reviews...
        </div>
      ) : summary.count === 0 ? (
        <p className="text-muted-foreground mb-8">
          No reviews yet — be the first to review this product.
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-8 mb-10">
          <div className="text-center shrink-0">
            <p className="font-display text-5xl font-semibold text-foreground">
              {summary.average.toFixed(1)}
            </p>
            <div className="flex justify-center my-2">
              <StarRow value={summary.average} size={18} />
            </div>
            <p className="text-sm text-muted-foreground">
              {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.breakdown[star - 1];
              const pct = summary.count ? (count / summary.count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <Star size={12} className="fill-primary text-primary shrink-0" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing reviews */}
      {reviews && reviews.length > 0 && (
        <div className="space-y-6 mb-12">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StarRow value={review.rating} size={14} />
                <span className="font-medium text-foreground">{review.author_name}</span>
                {review.verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <BadgeCheck size={12} />
                    Verified purchase
                  </span>
                )}
              </div>
              {review.comment && (
                <p className="font-body text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write a review */}
      {canReview ? (
        <form onSubmit={handleSubmit} className="bg-muted/30 rounded-xl p-6 space-y-4 max-w-xl">
          <h3 className="font-display text-lg font-semibold text-foreground">Write a review</h3>

          <div className="space-y-2">
            <Label>Your rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={26}
                    className={
                      star <= (hovered || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-name">Your name</Label>
            <Input
              id="review-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="How should we show your name?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Your review</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about it?"
              rows={4}
            />
          </div>

          <Button type="submit" variant="sacred" disabled={submitReview.isPending}>
            {submitReview.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Posting...
              </>
            ) : (
              "Post review"
            )}
          </Button>
        </form>
      ) : (
        <div className="bg-muted/30 rounded-xl p-6 max-w-xl">
          <p className="text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
