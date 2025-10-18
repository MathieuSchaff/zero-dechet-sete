import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { Inter, Sora } from "next/font/google";
import Header from "@/components/Header/Header";

// 🎨 Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Zéro déchet Sète",
    template: "%s | Zéro déchet Sète", // ← SEO boost !
  },
  description: "L'écologie pour tous - Solutions zéro déchet à Sète",
  keywords: ["zéro déchet", "Sète", "écologie", "recyclage"], // ← SEO
  authors: [{ name: "Zéro Déchet Sète" }],
  creator: "Zéro Déchet Sète",
  openGraph: {
    title: "Zéro déchet Sète",
    description: "L'écologie pour tous",
    type: "website",
    locale: "fr_FR",
    siteName: "Zéro Déchet Sète",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "system";

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable}`}
      data-theme={theme}
    >
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
