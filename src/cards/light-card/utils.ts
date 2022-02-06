import { HassEntity } from "home-assistant-js-websocket";

export function getBrightness(entity: HassEntity) {
    return entity.attributes.brightness != null
        ? Math.round((entity.attributes.brightness * 100) / 255)
        : undefined;
}

export function getColorTemp(entity: HassEntity) {
    return entity.attributes.color_temp != null
        ? Math.round(entity.attributes.color_temp)
        : undefined;
}

export function getRGBColor(entity: HassEntity) {
    return entity.attributes.rgb_color != null
        ? entity.attributes.rgb_color.join(',')
        : undefined;
}

export function isActive(entity: HassEntity) {
    return entity.state === "on";
}
