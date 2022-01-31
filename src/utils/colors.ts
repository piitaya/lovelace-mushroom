import { css } from "lit";

export const COLORS = [
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
    "grey",
    "blue-grey",
    "black",
    "white",
];

export function computeRgbColor(color: string): string {
    if (COLORS.includes(color)) {
        return `var(--rgb-${color})`;
    } else {
        return color;
    }
}

export function computeColorName(color: string): string {
    return color
        .split("-")
        .map((s) => capitalizeFirstLetter(s))
        .join(" ");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const colorCss = css`
    /* Palette colors */
    --default-red: 244, 67, 54;
    --default-pink: 233, 30, 99;
    --default-purple: 156, 39, 176;
    --default-deep-purple: 103, 58, 183;
    --default-indigo: 63, 81, 181;
    --default-blue: 33, 150, 243;
    --default-light-blue: 3, 169, 244;
    --default-cyan: 0, 188, 212;
    --default-teal: 0, 150, 136;
    --default-green: 76, 175, 80;
    --default-light-green: 139, 195, 74;
    --default-lime: 205, 220, 57;
    --default-yellow: 255, 235, 59;
    --default-amber: 255, 193, 7;
    --default-orange: 255, 152, 0;
    --default-deep-orange: 255, 87, 34;
    --default-brown: 121, 85, 72;
    --default-grey: 158, 158, 158;
    --default-blue-grey: 96, 125, 139;
    --default-black: 0, 0, 0;
    --default-white: 255, 255, 255;
    --rgb-red: var(--mush-theme-red, var(--default-red));
    --rgb-pink: var(--mush-theme-pink, var(--default-pink));
    --rgb-purple: var(--mush-theme-purple, var(--default-purple));
    --rgb-deep-purple: var(
        --mush-theme-deep-purple,
        var(--default-deep-purple)
    );
    --rgb-indigo: var(--mush-theme-indigo, var(--default-indigo));
    --rgb-blue: var(--mush-theme-blue, var(--default-blue));
    --rgb-light-blue: var(--mush-theme-light-blue, var(--default-light-blue));
    --rgb-cyan: var(--mush-theme-cyan, var(--default-cyan));
    --rgb-teal: var(--mush-theme-teal, var(--default-teal));
    --rgb-green: var(--mush-theme-green, var(--default-green));
    --rgb-light-green: var(
        --mush-theme-light-green,
        var(--default-light-green)
    );
    --rgb-lime: var(--mush-theme-lime, var(--default-lime));
    --rgb-yellow: var(--mush-theme-yellow, var(--default-yellow));
    --rgb-amber: var(--mush-theme-amber, var(--default-amber));
    --rgb-orange: var(--mush-theme-orange, var(--default-orange));
    --rgb-deep-orange: var(
        --mush-theme-deep-orange,
        var(--default-deep-orange)
    );
    --rgb-brown: var(--mush-theme-brown, var(--default-brown));
    --rgb-grey: var(--mush-theme-grey, var(--default-grey));
    --rgb-blue-grey: var(--mush-theme-blue-grey, var(--default-blue-grey));
    --rgb-black: var(--mush-theme-black, var(--default-black));
    --rgb-white: var(--mush-theme-white, var(--default-white));

    /* Card colors */
    --rgb-cover-color: var(--rgb-blue);
    --rgb-fan-color: var(--rgb-blue);
    --rgb-light-color: var(--rgb-orange);
    --rgb-sensor-color: var(--rgb-blue);
    --rgb-switch-color: var(--rgb-blue);
    --rgb-template-color: var(--rgb-blue);
`;
