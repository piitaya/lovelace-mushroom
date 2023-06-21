import { getWeatherStateSVG } from "../weather";

const weatherIcons = {
    "clear-night": "mdi:weather-night",
    cloudy: "mdi:weather-cloudy",
    exceptional: "mdi:alert-circle-outline",
    fog: "mdi:weather-fog",
    hail: "mdi:weather-hail",
    lightning: "mdi:weather-lightning",
    "lightning-rainy": "mdi:weather-lightning-rainy",
    partlycloudy: "mdi:weather-partly-cloudy",
    pouring: "mdi:weather-pouring",
    rainy: "mdi:weather-rainy",
    snowy: "mdi:weather-snowy",
    "snowy-rainy": "mdi:weather-snowy-rainy",
    sunny: "mdi:weather-sunny",
    windy: "mdi:weather-windy",
    "windy-variant": "mdi:weather-windy-variant",
};

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

export const weatherIcon = (state?: string, nightTime?: boolean): string =>
    !state
        ? undefined
        : nightTime && state === "partlycloudy"
        ? "mdi:weather-night-partly-cloudy"
        : weatherIcons[state];

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
