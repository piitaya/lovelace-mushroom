import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { html } from "lit";
import { isAvailable, isUnknown } from "./entity";

export const ATTRIBUTES = ["battery", "temperature", "device_class","none"] as const;
const TIMESTAMP_STATE_DOMAINS = ["button", "input_button", "scene"];

export type Attributes = typeof ATTRIBUTES[number];

export function getAttributes(
    attributes: Attributes,
    entity: HassEntity,
    hass: HomeAssistant
) {
    switch (attributes) {
        case "battery":
            return entity.attributes.battery ? `${entity.attributes.battery}%` : null;
        case "temperature":
            return entity.attributes.temperature ? `${entity.attributes.temperature} ${hass.config.unit_system.temperature}`: null;
        case "device_class":
            return entity.attributes.device_class ? entity.attributes.device_class: null;
        case "none":
            return undefined;
    }
}
