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

export function computeCssColor(color: string): string {
  if (THEME_COLORS.has(color)) {
    return `var(--${color}-color)`;
  }
  return color;
}
