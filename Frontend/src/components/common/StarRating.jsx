import React from "react";
import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  max = 5,
  reviewsCount,
  interactive = false,
  onChange,
  size = "md"
}) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);

          return (
            <button
              type="button"
              key={index}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
            >
              <Star
                className={`${currentSize} ${
                  isFilled
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300 fill-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {rating > 0 && !interactive && (
        <span className="text-xs font-bold text-amber-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {reviewsCount !== undefined && (
        <span className="text-xs text-slate-500 ml-1">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
}
