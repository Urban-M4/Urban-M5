import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number | undefined | null;
  onChange: (value: number) => void;
  className?: string;
}

export function Rating({ value, onChange, className }: RatingProps) {
  return (
    <div className="flex flex-row gap-2">
      <h3>Rating</h3>
      <div className={cn("flex gap-1", className)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= (value ?? 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-gray-300",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
