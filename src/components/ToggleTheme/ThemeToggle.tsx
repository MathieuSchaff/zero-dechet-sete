"use client";

import { useState, useEffect, useTransition } from "react";
import { setTheme, type ThemeChoice } from "@/app/actions/theme";
import styles from "./themetoggle.module.css";
const order: ThemeChoice[] = ["light", "dark", "system"];

export function ThemeToggle() {
  const [current, setCurrent] = useState<ThemeChoice>("system");
  const [isPending, startTransition] = useTransition();

  // Lis le thème courant depuis l'attribut SSR (pas de flash)
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme") as
      | "light"
      | "dark"
      | null;
    setCurrent(attr ?? "system");
  }, []);

  const onClick = () => {
    const next = order[(order.indexOf(current) + 1) % order.length];
    setCurrent(next);
    startTransition(() => setTheme(next));
    // Le re-render SSR remettra data-theme; pas besoin de setAttribute ici
  };

  const label =
    current === "light"
      ? "☀️ Light"
      : current === "dark"
      ? "🌙 Dark"
      : "🖥️ System";
  return (
    <>
      {" "}
      <button
        className={styles.toggle}
        onClick={onClick}
        disabled={isPending}
        aria-label="Toggle theme"
      >
        {label}
      </button>
    </>
  );
}
