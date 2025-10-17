"use server";

import { cookies } from "next/headers";

export type ThemeChoice = "light" | "dark" | "system";

export async function setTheme(next: ThemeChoice) {
  const c = await cookies();
  if (next === "system") {
    c.delete("theme"); // pas de cookie => suit le système
  } else {
    c.set("theme", next, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
}
