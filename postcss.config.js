// postcss.config.js
module.exports = {
  plugins: {
    'postcss-preset-env': {
      // Stage par défaut ≈ Stage 2 (bon équilibre stabilité/modernité)
      // -> active @layer, nesting, etc. selon ta Browserslist.
      // (Tu peux forcer certaines features ci-dessous.)
      features: {
        'nesting-rules': true,            // CSS Nesting natif
        'custom-media-queries': true,     // @custom-media
        // 'logical-properties-and-values': false, // ex: tu peux désactiver si tu veux
      },
      autoprefixer: { grid: true },       // si besoin de préfixes grid
    },
  },
};

