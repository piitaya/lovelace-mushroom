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

export const weatherIcon = (state?: string, nightTime?: boolean): string =>
    !state
        ? undefined
        : nightTime && state === "partlycloudy"
        ? "mdiWeatherNightPartlyCloudy"
        : weatherIcons[state];
