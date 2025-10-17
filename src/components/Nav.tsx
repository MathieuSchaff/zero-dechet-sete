import * as NavigationMenu from "@radix-ui/react-navigation-menu";

export default function Nav() {
  return (
    <NavigationMenu.Root className="nav">
      <NavigationMenu.List className="nav__list">
        <NavigationMenu.Item>
          <NavigationMenu.Link className="nav__link" href="/">
            Accueil
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link className="nav__link" href="/articles">
            Articles
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link className="nav__link" href="/places">
            Adresses
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        {/* TODO: Ajoute Dropdown / sous-menus si besoin */}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
