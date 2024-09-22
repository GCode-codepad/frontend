/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        blue: {
          10: "#58B2DC",
          200: "#ACC8E5",
          300: "#81C7D4",
          800: "#112A46",
        },
        red: {
          10: "#B481BB",
        },
        purple: {
          10: "#9B90C2",
          20: "#B28FCE",
        },
        green: {
          20: "#B5CAA0",
        },
        yellow: {
          10: "#FBE251",
          40: "#B68E55",
        },
      },
      clear: {
        right: "both",
      },
    },
  },
  plugins: [],
};