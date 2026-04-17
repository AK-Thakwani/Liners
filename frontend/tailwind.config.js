// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        card: 'var(--color-card)',
        glass: 'var(--color-glass)',
        border: 'var(--color-border)',
        cyan: 'var(--color-cyan)',
        fuchsia: 'var(--color-fuchsia)',
        purple: 'var(--color-purple)',
        blue: 'var(--color-blue)',
        headline: 'var(--color-headline)',
        body: 'var(--color-body)',
      },
      fontFamily: {
        display: ['Poppins', 'Montserrat', 'Inter', 'sans-serif'],
        mono: ['Fira Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 4px 24px 0 rgba(162,89,255,0.5)',
        'neon-blue': '0 4px 24px 0 rgba(0,191,255,0.5)',
      },
      borderColor: {
        glass: 'var(--color-border)',
      },
    },
  },
  plugins: [],
}
