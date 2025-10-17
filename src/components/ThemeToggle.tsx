"use client";

import { useState, useEffect, useTransition } from "react";
import { setTheme, type ThemeChoice } from "@/app/actions/theme";

const order: ThemeChoice[] = ["light", "dark", "system"];

export function ThemeToggle() {
  console.log("1");
  // const [current, setCurrent] = useState<ThemeChoice>(() => {
  //   if (typeof document === "undefined") return "system";
  //   const attr = document.documentElement.getAttribute("data-theme");
  //   return (attr as "light" | "dark") ?? "system";
  // });
  const [current, setCurrent] = useState<ThemeChoice>("system");
  console.log("current", current);
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
  console.log("label", label);
  return (
    <>
      {" "}
      <button
        className="btn btn-outline"
        onClick={onClick}
        disabled={isPending}
        aria-label="Toggle theme"
      >
        {label}
      </button>
    </>
  );
}
