/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'game-lane': '#1e293b',
                'game-bg': '#0f172a',
                'game-border': '#334155',
                'game-note': '#11d7fc',
            },
            animation: {
                'bounce-short': 'bounce 0.5s infinite',
            }
        },
    },
    plugins: [],
}
