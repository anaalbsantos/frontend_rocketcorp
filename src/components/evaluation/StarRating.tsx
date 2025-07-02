import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  disableHover?: boolean;
  lowOpacity?: boolean;
}

export function StarRating({
  value,
  onChange,
  disableHover = false,
  lowOpacity = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [valueState, setValueState] = useState(value);

  const stars = 5;

  const handleMouseMove = (e: React.MouseEvent, starIndex: number) => {
    if (disableHover) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const percent = x / width;
    const part = percent < 0.5 ? 0.5 : 1;
    const hoverVal = Math.min(stars, starIndex + part);
    setHoverValue(hoverVal);
  };

  const handleClick = (e: React.MouseEvent, starIndex: number) => {
    if (disableHover) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const percent = x / width;
    const part = percent < 0.5 ? 0.5 : 1;
    const selectedValue = Math.min(stars, starIndex + part);
    setValueState(selectedValue);
    onChange?.(selectedValue);
  };
  return (
    <div className="flex gap-4">
      {Array.from({ length: stars }).map((_, i) => {
        const current = hoverValue ?? valueState;
        const fill = current ? Math.max(0, Math.min(1, current - i)) * 100 : 0;

        return (
          <div
            key={i}
            className="relative w-7 h-7 text-primary cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, i)}
            onMouseLeave={() => !disableHover && setHoverValue(null)}
            onClick={(e) => handleClick(e, i)}
          >
            <Star
              className={`w-7 h-7 ${
                lowOpacity ? "text-brand/40" : "text-brand"
              }`}
            />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <Star
                className={`w-7 h-7 fill-current ${
                  lowOpacity ? "text-brand/40" : "text-brand"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
