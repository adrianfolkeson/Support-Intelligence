import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-lg" },
    md: { icon: "w-8 h-8", text: "text-xl" },
    lg: { icon: "w-10 h-10", text: "text-2xl" },
  };

  const { icon, text } = sizeClasses[size];

  return (
    <Link href="/" className="flex items-center gap-2">
      {/* Logo Icon */}
      <svg
        className={`${icon} flex-shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#2563eb" }} />
            <stop offset="100%" style={{ stopColor: "#1d4ed8" }} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#logoGrad)" />
        <path
          d="M25 35 Q25 25 35 25 L65 25 Q75 25 75 35 L75 55 Q75 65 65 65 L45 65 L35 75 L35 65 L35 65 Q25 65 25 55 Z"
          fill="white"
        />
        <circle cx="50" cy="45" r="12" fill="url(#logoGrad)" />
        <path
          d="M50 38 L50 52 M43 45 L57 45"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="65" cy="55" r="5" fill="#fbbf24" />
      </svg>

      {/* Logo Text */}
      {showText && (
        <span className={`${text} font-bold text-gray-900`}>
          Support Intelligence
        </span>
      )}
    </Link>
  );
}

export default Logo;
