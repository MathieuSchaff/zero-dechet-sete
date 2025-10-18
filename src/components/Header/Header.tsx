// src/components/Header/Header.tsx
import Link from "next/link";
import Nav from "../Nav/Nav";
import { ThemeToggle } from "../ToggleTheme/ThemeToggle";
import styles from "./header.module.css"; // ← importer comme Module

export default function Header() {
  return (
    <header className={styles.siteHeader} role="banner">
      {/* Skip link pour a11y */}
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>

      <div className={styles.siteHeaderInner}>
        <div className={styles.brand}>
          <Link href="/" aria-label="Accueil" className={styles.brandLogo}>
            {/* Élément décoratif pour afficher le “logo” via CSS */}
            <span aria-hidden="true" />
          </Link>
        </div>

        <Nav />

        <div className={styles.headerActions}>
          <ThemeToggle />
          {/* TODO: Ajoute un bouton Login/Profil ici si besoin */}
        </div>
      </div>
    </header>
  );
}
