import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "./ui/sidebar";

const RATING_VALUES = [0, 1, 2, 3, 4, 5];

interface RatingFilterProps {
  title: string;
  values: number[];
  onToggle: (rating: number) => void;
}

export function RatingFilter({ title, values, onToggle }: RatingFilterProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="ml-4 flex flex-wrap gap-1">
          {RATING_VALUES.map((rating) => {
            const isSelected = values.includes(rating);

            return (
              <button
                key={rating}
                type="button"
                onClick={() => onToggle(rating)}
                aria-pressed={isSelected}
                aria-label={`Filter on rating ${rating}`}
                title={`Rating ${rating}`}
                className="rounded p-1 transition-colors hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors",
                    rating === 0
                      ? isSelected
                        ? "fill-none text-yellow-400"
                        : "fill-none text-gray-300"
                      : isSelected
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-none text-gray-300",
                  )}
                  style={
                    rating === 0
                      ? {
                          strokeDasharray: "2",
                          strokeWidth: 2.5,
                          strokeLinecap: "butt",
                        }
                      : undefined
                  }
                />
              </button>
            );
          })}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
