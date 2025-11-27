// src/components/Modal/auth/AuthModal.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import styles from "./AuthModal.module.css";

export default function AuthModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = useCallback(() => {
    const returnUrl = sessionStorage.getItem("modal-return-url") || "/";
    sessionStorage.removeItem("modal-return-url");

    // Ferme d'abord le dialog visuellement
    if (dialogRef.current) {
      dialogRef.current.close();
    }

    // Ensuite navigue
    router.push(returnUrl);
    router.refresh(); // Force le refresh
  }, [router]);

  useEffect(() => {
    const loginOrSignUpPathName = "";
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault(); // Empêche le comportement par défaut
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (rect) {
      const isInDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isInDialog) {
        handleClose();
      }
    }
  };

  const isLogin = pathname === "/login";
  const isSignup = pathname === "/signup";

  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    router.replace(href);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClickOutside}
      className={styles.dialog}
    >
      <div className={styles.modalContent}>
        <button onClick={handleClose} className={styles.closeBtn} type="button">
          ✕
        </button>

        <div className={styles.tabs}>
          <a
            href="/login"
            onClick={(e) => handleTabClick(e, "/login")}
            className={`${styles.tab} ${isLogin ? styles.tabActive : ""}`}
          >
            Login
          </a>
          <a
            href="/signup"
            onClick={(e) => handleTabClick(e, "/signup")}
            className={`${styles.tab} ${isSignup ? styles.tabActive : ""}`}
          >
            Sign Up
          </a>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </dialog>
  );
}
