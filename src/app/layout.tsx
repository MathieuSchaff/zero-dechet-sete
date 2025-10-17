import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
import "./globals.css"; // ✅
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zéro déchet Sète",
  description: "L'écologie pour tous",
};
import Header from "@/components/Header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "system";
  // const attr = theme === "system" ? undefined : { "data-theme": theme };
  console.log(theme);
  return (
    <html
      lang="fr"
      {...(theme ? { "data-theme": theme } : {})}
      suppressHydrationWarning
    >
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
