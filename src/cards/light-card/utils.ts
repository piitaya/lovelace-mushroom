import { HassEntity } from "home-assistant-js-websocket";
import * as Color from "color";
import {
    LightColorModes,
    LightEntity,
    lightSupportsColor,
    lightSupportsDimming,
} from "../../ha/data/light";

export function getBrightness(entity: LightEntity): number | undefined {
    return entity.attributes.brightness != null
        ? Math.max(Math.round((entity.attributes.brightness * 100) / 255), 1)
        : undefined;
}

export function getColorTemp(entity: LightEntity): number | undefined {
    return entity.attributes.color_temp != null
        ? Math.round(entity.attributes.color_temp)
        : undefined;
}

export function getRGBColor(entity: LightEntity): number[] | undefined {
    return entity.attributes.rgb_color != null ? entity.attributes.rgb_color : undefined;
}

export function isColorLight(rgb: number[]): boolean {
    const color = Color.rgb(rgb);
    return color.l() > 96;
}
export function isColorSuperLight(rgb: number[]): boolean {
    const color = Color.rgb(rgb);
    return color.l() > 97;
}

export function supportsColorTempControl(entity: LightEntity): boolean {
    return entity.attributes.supported_color_modes?.some((m) =>
        [LightColorModes.COLOR_TEMP].includes(m)
    );
}

export function supportsColorControl(entity: LightEntity): boolean {
    return lightSupportsColor(entity);
}

export function supportsBrightnessControl(entity: LightEntity): boolean {
    return lightSupportsDimming(entity);
}
