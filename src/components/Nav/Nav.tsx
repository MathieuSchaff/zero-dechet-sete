// src/components/Nav/Nav.tsx
"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./nav.module.css";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/articles", label: "Articles" },
  { href: "/places", label: "Adresses" },
  { href: "/guide-tri", label: "Guide tri" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale">
      <NavigationMenu.Root className={styles.nav}>
        <NavigationMenu.List className={styles.nav__list}>
          {links.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <NavigationMenu.Item key={href}>
                <NavigationMenu.Link asChild>
                  <Link
                    href={href}
                    className={styles.nav__link}
                    data-active={isActive ? "true" : "false"}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </nav>
  );
}
