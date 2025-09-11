import * as Color from "color";

export const THEME_COLORS = new Set([
  "primary",
  "accent",
  "disabled",
  "primary-text",
  "secondary-text",
  "disabled-text",
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "light-grey",
  "grey",
  "dark-grey",
  "blue-grey",
  "black",
  "white",
]);

function isRgbString(color: string): boolean {
  return /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$/.test(color);
}

export function computeCssColor(color: string): string {
  if (THEME_COLORS.has(color)) {
    return `var(--${color}-color)`;
  }
  if (isRgbString(color)) {
    const rgb = color.split(",").map((c) => c.trim());
    return `rgb(${rgb.join(", ")})`;
  }
  return color;
}
