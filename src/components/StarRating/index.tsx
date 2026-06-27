import React from "react";

import { StarHalfIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { clsx } from "clsx";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
  iconClassName?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  className,
  iconClassName,
}) => {
  const fullStars = Math.max(0, Math.floor(rating));
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={clsx("flex items-center gap-0.5", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <HugeiconsIcon
          key={`full-${i}`}
          icon={StarIcon}
          className={clsx("text-primary fill-current size-4", iconClassName)}
        />
      ))}
      {hasHalfStar && (
        <HugeiconsIcon
          key="half"
          icon={StarHalfIcon}
          className={clsx("text-primary fill-current size-4", iconClassName)}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <HugeiconsIcon
          key={`empty-${i}`}
          icon={StarIcon}
          className={clsx("text-primary size-4", iconClassName)}
        />
      ))}
    </div>
  );
};
