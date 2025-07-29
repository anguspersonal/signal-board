// postcss.config.js

// ⚠️ Must remain CommonJS: Next.js + Webpack + Vercel expect this format.
// Do not convert to ESM — causes build failure.

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
  