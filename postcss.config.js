// postcss.config.js
// console.log("PostCSS config loaded!!!!");
console.log("PostCSS config grok!!!!");

module.exports = {
  plugins: {
    "@csstools/postcss-global-data": {
      files: ["src/styles/media-queries.css"],
    },
    "postcss-custom-media": {},
    "postcss-preset-env": {
      stage: 1,
      features: {
        "nesting-rules": true,
        "custom-media-queries": false,
      },
      autoprefixer: {
        grid: true,
      },
    },
  },
};
