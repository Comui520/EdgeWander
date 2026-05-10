import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crt: {
          bg: "#1a1d14",
          dim: "#0d0f08",
          amber: "#c9a227",
          green: "#6b8e5a",
          teal: "#3a5a5a",
          rust: "#8b4a2b",
          bone: "#d9c9a3",
          blood: "#7a2828",
          ink: "#171a12",
        },
      },
      fontFamily: {
        pixel: ["var(--font-press-start)", "monospace"],
        terminal: ["var(--font-vt323)", "monospace"],
      },
      boxShadow: {
        bevel:
          "inset 2px 2px 0 #d9c9a3, inset -2px -2px 0 #3a3528, inset 4px 4px 0 #8c7a4e, inset -4px -4px 0 #1a1710",
        "bevel-pressed":
          "inset -2px -2px 0 #d9c9a3, inset 2px 2px 0 #3a3528, inset -4px -4px 0 #8c7a4e, inset 4px 4px 0 #1a1710",
        crt: "inset 0 0 120px 40px rgba(0,0,0,0.85)",
      },
      animation: {
        flicker: "flicker 3.4s infinite steps(1)",
        scanshift: "scanshift 8s linear infinite",
        glitch: "glitch 2.6s infinite steps(1)",
        rolldigit: "rolldigit 0.45s steps(10) 1",
      },
      keyframes: {
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.55" },
        },
        scanshift: {
          "0%": { backgroundPositionY: "0" },
          "100%": { backgroundPositionY: "100vh" },
        },
        glitch: {
          "0%, 92%, 100%": { transform: "translate(0,0) skew(0)" },
          "93%": { transform: "translate(-2px,1px) skew(-0.8deg)" },
          "94%": { transform: "translate(2px,-1px) skew(0.6deg)" },
          "95%": { transform: "translate(-1px,0) skew(0)" },
        },
        rolldigit: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
