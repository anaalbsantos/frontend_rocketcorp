import { Star } from "lucide-react";

interface ReadonlyStarsProps {
  value: number;
  lowOpacity?: boolean;
}

const ReadonlyStars = ({ value, lowOpacity = false }: ReadonlyStarsProps) => {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i)) * 100;
        const colorClass = lowOpacity ? "text-brand/40" : "text-brand";

        return (
          <div key={i} className="relative w-7 h-7 text-primary">
            <Star className={`w-7 h-7 ${colorClass}`} />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <Star className={`w-7 h-7 fill-current ${colorClass}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReadonlyStars;
