export const textStateConfig = {
  letterSpacing: {
    tight: {
      label: "Tight",
      css: {
        "letter-spacing": "0.5px",
      },
    },
    normal: {
      label: "Normal",
      css: {
        "letter-spacing": "1px",
      },
    },
    wide: {
      label: "Wide",
      css: {
        "letter-spacing": "1.5px",
      },
    },
    wider: {
      label: "Wider",
      css: {
        "letter-spacing": "2px",
      },
    },
    widest: {
      label: "Widest",
      css: {
        "letter-spacing": "2.5px",
      },
    },
  },
} as const;
