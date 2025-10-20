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
        <Link href="/" aria-label="Accueil" className={styles.brandLogo}>
          ZDS LOGO
          <span aria-hidden="true" />
        </Link>

        <Nav />

        <ThemeToggle />
        {/* TODO: Ajoute un bouton Login/Profil ici si besoin */}

        <Link href="/login" aria-label="login" className={""}>
          login
        </Link>

        <Link href="/sign-up" aria-label="sign up" className={""}>
          Sign up
        </Link>
      </div>
    </header>
  );
}
