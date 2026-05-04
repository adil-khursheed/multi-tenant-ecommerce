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
  fontSize: {
    "x-small": {
      label: "X-Small",
      css: {
        "font-size": "12px",
      },
    },
    small: {
      label: "Small",
      css: {
        "font-size": "14px",
      },
    },
    large: {
      label: "Large",
      css: {
        "font-size": "16px",
      },
    },
    xlarge: {
      label: "X-Large",
      css: {
        "font-size": "18px",
      },
    },
    xxlarge: {
      label: "XX-Large",
      css: {
        "font-size": "20px",
      },
    },
    heroHeading: {
      label: "Hero Heading",
      css: {
        "font-size": "72px",
        "line-height": "72px",
      },
    },
    subHeading: {
      label: "Sub Heading",
      css: {
        "font-size": "48px",
        "line-height": "48px",
      },
    },
  },
  fontFamily: {
    sans: {
      label: "Sans",
      css: {
        "font-family": "DM Sans",
      },
    },
    serif: {
      label: "Serif",
      css: {
        "font-family": "Cormorant Garamond",
      },
    },
    mono: {
      label: "Mono",
      css: {
        "font-family": "Geist Mono",
      },
    },
  },
  color: {
    primary: {
      label: "Primary",
      css: {
        color:
          "light-dark(oklch(0.4341 0.0392 41.9938), oklch(0.9247 0.0524 66.1732))",
      },
    },
    secondary: {
      label: "Secondary",
      css: {
        color:
          "light-dark(oklch(0.92 0.0651 74.3695), oklch(0.3163 0.019 63.6992))",
      },
    },
    foreground: {
      label: "Foreground",
      css: {
        color: "light-dark(oklch(0.2435 0 0), oklch(0.9491 0 0))",
      },
    },
  },
} as const;
