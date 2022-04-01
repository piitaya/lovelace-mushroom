export const clamp = (value: number, min = 0, max = 1): number =>
    Math.max(min, Math.min(value, max));

export const isNumber = (value: any) => typeof value === "number" && isFinite(value);
