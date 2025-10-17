import Nav from "./Nav";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="brand">
          {/* TODO: Remplace par ton logo */}
          {/* <a href="/" className="brand__logo">
            ZeroDechet
          </a> */}
        </div>

        {/* <Nav /> */}

        <div className="header-actions">
          <ThemeToggle />
          {/* TODO: Ajoute ici un bouton login / profil si besoin */}
        </div>
      </div>
    </header>
  );
}
