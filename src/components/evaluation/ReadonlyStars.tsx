import { Star } from "lucide-react";

interface ReadonlyStarsProps {
  value: number;
  lowOpacity?: boolean;
}

const ReadonlyStars = ({ value, lowOpacity = false }: ReadonlyStarsProps) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = value >= i + 1;
        const colorClass = lowOpacity ? "text-brand/40" : "text-brand";

        return (
          <Star
            key={i}
            className={`w-5 h-5 ${colorClass}`}
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
};

export default ReadonlyStars;
