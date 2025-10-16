import { getMethodIconType, PAYMENT_ICON_PATHS } from "@/lib/utils/paymentUtils";
import React from "react";

interface PaymentMethodIconProps {
  method: string;
  className?: string;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({
  method,
  className = "w-5 h-5",
}) => {
  const iconType = getMethodIconType(method);
  const pathData = PAYMENT_ICON_PATHS[iconType];

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={pathData}
      />
    </svg>
  );
};
