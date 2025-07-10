import React from "react";

interface NotificationDotProps {
  show: boolean;
  className?: string;
}

const NotificationDot: React.FC<NotificationDotProps> = ({ show, className = "" }) => {
  if (!show) return null;

  return (
    <span
      className={`inline-block w-2 h-2 bg-red-600 rounded-full ${className}`}
      aria-label="Nova notificação"
    />
  );
};

export default NotificationDot;
