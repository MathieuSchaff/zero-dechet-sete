import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./guidetri.module.css";

// SEO Metadata
export const metadata: Metadata = {
  title: "Guide du tri à Sète et Sète Agglopôle Méditerranée",
  description:
    "Découvrez les règles de tri des déchets à Sète : où déposer vos déchets, les consignes locales, le SAM’Pass, et les points de collecte pour verre, compost, et plus.",
  openGraph: {
    title: "Guide du tri à Sète et Sète Agglopôle Méditerranée",
    description:
      "Tout savoir sur le tri des déchets à Sète : consignes, points de collecte, et astuces pour réduire ses déchets.",
    url: "/guide-tri",
    type: "article",
  },
  keywords: [
    "tri déchets Sète",
    "recyclage Sète",
    "zéro déchet Sète",
    "SAM’Pass",
    "points collecte Sète",
  ],
};

// Données statiques pour le guide (à remplacer par une requête API si dynamique)
const sortingRules = [
  {
    category: "Déchets recyclables (bac jaune)",
    items: [
      "Bouteilles et flacons en plastique",
      "Emballages carton",
      "Boîtes métalliques",
      "Papiers et journaux",
    ],
    instructions:
      "À déposer dans le bac jaune, sans sac plastique. Rincez les emballages si possible.",
  },
  {
    category: "Verre",
    items: ["Bouteilles en verre", "Pots en verre", "Bocaux"],
    instructions:
      "À déposer dans les points de collecte verre. Ne pas inclure vaisselle ou verre cassé.",
  },
  {
    category: "Compost",
    items: [
      "Épluchures",
      "Restes alimentaires",
      "Marc de café",
      "Coquilles d’œufs",
    ],
    instructions:
      "Utilisez les composteurs partagés ou votre composteur individuel. Pas de viande ni poisson.",
  },
  {
    category: "Déchetterie",
    items: [
      "Encombrants",
      "Électroménagers",
      "DEEE (déchets électroniques)",
      "Gravats",
    ],
    instructions:
      "Apportez à la déchetterie avec votre SAM’Pass. Vérifiez les quotas (ex : 1m³/jour).",
  },
  {
    category: "Ordures ménagères (bac gris)",
    items: [
      "Déchets non recyclables",
      "Sacs plastiques",
      "Emballages souillés",
    ],
    instructions: "À déposer dans le bac gris, en sac fermé.",
  },
];

export default function GuideTri() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>Guide du tri à Sète</h1>
          <p className={styles.heroText}>
            Apprenez à trier vos déchets efficacement à Sète et dans l’Agglopôle
            Méditerranée. Découvrez les consignes locales, les points de
            collecte, et comment utiliser votre SAM’Pass.
          </p>
        </div>
      </section>

      {/* Sorting Rules Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Consignes de tri</h2>
          <div className={styles.grid}>
            {sortingRules.map((rule, index) => (
              <article
                key={index}
                className={styles.card}
                role="region"
                aria-labelledby={`rule-title-${index}`}
              >
                <h3 id={`rule-title-${index}`} className={styles.cardTitle}>
                  {rule.category}
                </h3>
                <ul className={styles.list}>
                  {rule.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className={styles.cardText}>{rule.instructions}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SAM’Pass Section */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Le SAM’Pass : votre accès aux déchetteries
          </h2>
          <p className={styles.sectionText}>
            Le SAM’Pass est une carte gratuite fournie par Sète Agglopôle
            Méditerranée pour accéder aux déchetteries. Elle est obligatoire
            pour déposer certains déchets (encombrants, DEEE, etc.).
          </p>
          <ul className={styles.list}>
            <li>
              Disponible sur demande à la mairie ou en ligne sur le site de
              l’Agglopôle.
            </li>
            <li>
              Quota : 1m³/jour pour les particuliers, vérifier les conditions
              pour les professionnels.
            </li>
            <li>Valable dans toutes les déchetteries de l’Agglopôle.</li>
          </ul>
          <Link
            href="https://www.agglopole.fr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            En savoir plus sur le SAM’Pass
            <ArrowRight className={styles.icon} />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Trouvez un point de collecte près de chez vous
          </h2>
          <p className={styles.sectionText}>
            Consultez notre carte interactive pour localiser les déchetteries,
            points verre, composteurs partagés, et plus encore.
          </p>
          <Link href="/carte" className={styles.button}>
            Voir la carte
          </Link>
        </div>
      </section>
    </main>
  );
}
