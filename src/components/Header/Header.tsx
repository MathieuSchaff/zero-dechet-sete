import Nav from "../Nav/Nav";
import { ThemeToggle } from "../ToggleTheme/ThemeToggle";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="brand">
          <a href="/" className="brand__logo"></a>
        </div>

        <Nav />

        <div className="header-actions">
          <ThemeToggle />
          {/* TODO: Ajoute ici un bouton login / profil si besoin */}
        </div>
      </div>
    </header>
  );
}
