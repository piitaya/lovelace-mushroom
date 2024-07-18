import { getWeatherStateSVG } from "../weather";

export const weatherSVGs = new Set<string>([
  "clear-night",
  "cloudy",
  "fog",
  "lightning",
  "lightning-rainy",
  "partlycloudy",
  "pouring",
  "rainy",
  "hail",
  "snowy",
  "snowy-rainy",
  "sunny",
  "windy",
  "windy-variant",
]);

export const getWeatherSvgIcon = (icon?: string) => {
  if (!icon || !icon.startsWith("weather-")) {
    return undefined;
  }
  const name = icon.replace("weather-", "");
  if (!weatherSVGs.has(name)) {
    return undefined;
  }
  return getWeatherStateSVG(name, true);
};
