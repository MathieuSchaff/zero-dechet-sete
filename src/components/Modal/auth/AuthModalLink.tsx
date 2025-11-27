// src/components/Modal/auth/AuthModalLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthModalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  const handleClick = () => {
    // Sauvegarde l'URL actuelle AVANT la navigation
    if (typeof window !== "undefined") {
      sessionStorage.setItem("modal-return-url", pathname);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
