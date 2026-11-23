import React from 'react';

interface VtcLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  darkText?: boolean;
  className?: string;
}

export const VtcLogo: React.FC<VtcLogoProps> = ({
  size = 'md',
  showWordmark = true,
  darkText = false,
  className = '',
}) => {
  const iconSize =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'xl'
        ? 'w-24 h-24'
        : size === 'lg'
          ? 'w-14 h-14'
          : 'w-10 h-10';

  const textClass =
    size === 'sm'
      ? 'text-sm sm:text-base'
      : size === 'lg' || size === 'xl'
        ? 'text-xl sm:text-2xl'
        : 'text-base sm:text-xl';

  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${iconSize} shrink-0 block`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Logo VTC SHOP"
      >
        <rect x="0" y="0" width="100" height="100" rx="22" fill="#FF6A00" />
        <path
          d="M25 19 H39.5 L50 50 L60.5 19 H75 L57 68 H43 Z"
          fill="#FFFFFF"
        />
        <text
          x="50"
          y="85"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="11.5"
          fontWeight="800"
          fontFamily="Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
          letterSpacing="0.9"
        >
          VTC SHOP
        </text>
      </svg>
      {showWordmark && (
        <span
          className={`${textClass} font-extrabold tracking-tight whitespace-nowrap ${
            darkText ? 'text-zinc-900 dark:text-zinc-100' : 'text-white'
          }`}
        >
          VTC SHOP <span className="text-[#FF6A00]">INDONESIA</span>
        </span>
      )}
    </span>
  );
};
