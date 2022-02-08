import { HassEntity } from "home-assistant-js-websocket";
import Color from "color";

export function getBrightness(entity: HassEntity):number|undefined {
    return entity.attributes.brightness != null
        ? Math.round((entity.attributes.brightness * 100) / 255)
        : undefined;
}

export function getColorTemp(entity: HassEntity):number|undefined {
    return entity.attributes.color_temp != null
        ? Math.round(entity.attributes.color_temp)
        : undefined;
}

export function getRGBColor(entity: HassEntity):number[]|undefined {
    return entity.attributes.rgb_color != null
        ? entity.attributes.rgb_color
        : undefined;
}

export function isLight(rgb:number[]):boolean {
    const color = Color.rgb(rgb);
    return color.l() > 97;
}

export function isActive(entity: HassEntity) {
    return entity.state === "on";
}
