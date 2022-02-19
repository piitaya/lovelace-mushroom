import { HassEntity } from "home-assistant-js-websocket";
import Color from "color";
import { HomeAssistant } from "custom-card-helpers";

export function getBrightness(entity: HassEntity): number | undefined {
    return entity.attributes.brightness != null
        ? Math.round((entity.attributes.brightness * 100) / 255)
        : undefined;
}

export function getColorTemp(entity: HassEntity): number | undefined {
    return entity.attributes.color_temp != null
        ? Math.round(entity.attributes.color_temp)
        : undefined;
}

export function getRGBColor(entity: HassEntity): number[] | undefined {
    return entity.attributes.rgb_color != null ? entity.attributes.rgb_color : undefined;
}

export function isLight(rgb: number[]): boolean {
    const color = Color.rgb(rgb);
    return color.l() > 96;
}
export function isSuperLight(rgb: number[]): boolean {
    const color = Color.rgb(rgb);
    return color.l() > 97;
}

export const enum LightColorModes {
    UNKNOWN = "unknown",
    ONOFF = "onoff",
    BRIGHTNESS = "brightness",
    COLOR_TEMP = "color_temp",
    WHITE = "white",
    HS = "hs",
    XY = "xy",
    RGB = "rgb",
    RGBW = "rgbw",
    RGBWW = "rgbww",
}

const modesSupportingColorTemp = [LightColorModes.COLOR_TEMP];

const modesSupportingColor = [
    LightColorModes.HS,
    LightColorModes.XY,
    LightColorModes.RGB,
    LightColorModes.RGBW,
    LightColorModes.RGBWW,
];

const modesSupportingDimming = [
    ...modesSupportingColor,
    ...modesSupportingColorTemp,
    LightColorModes.BRIGHTNESS,
];

export function supportsColorTempControl(entity: HassEntity): boolean {
    return entity.attributes.supported_color_modes?.some((m) =>
        modesSupportingColorTemp.includes(m)
    );
}

export function supportsColorControl(entity: HassEntity): boolean {
    return entity.attributes.supported_color_modes?.some((m) => modesSupportingColor.includes(m));
}

export function supportsBrightnessControl(entity: HassEntity): boolean {
    return entity.attributes.supported_color_modes?.some((m) => modesSupportingDimming.includes(m));
}
