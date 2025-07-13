import React from "react";

interface NotificationDotProps {
  show: boolean;
  className?: string;
}

const NotificationDot: React.FC<NotificationDotProps> = ({ show, className = "" }) => {
  if (!show) return null;

  return (
    <span
      className={`ml-2 inline-block w-1.5 h-1.5 bg-red-600 rounded-full ${className}`}
      aria-label="Nova notificação"
      role="status"
    />
  );
};

export default NotificationDot;