import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import styles from "./nav.module.css";
export default function Nav() {
  return (
    <NavigationMenu.Root className={styles.nav}>
      <NavigationMenu.List className={styles.nav__list}>
        <NavigationMenu.Item>
          <NavigationMenu.Link className={styles.nav__link} href="/">
            Accueil
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link className={styles.nav__link} href="/articles">
            Articles
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link className={styles.nav__link} href="/places">
            Adresses
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
