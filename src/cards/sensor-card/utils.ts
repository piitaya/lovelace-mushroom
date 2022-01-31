import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { html } from "lit";
import { Info } from "./sensor-card-config";

export function isActive(entity: HassEntity) {
    const domain = entity.entity_id.split(".")[0];
    const state = entity.state;
    return domain === "binary_sensor"
        ? state === "on"
        : state !== "unavailable";
}

export function getInfo(
    info: Info,
    name: string,
    state: string,
    entity: HassEntity,
    hass: HomeAssistant
) {
    switch (info) {
        case "name":
            return name;
        case "state":
            return state;
        case "last-changed":
            return html`
                <ha-relative-time
                    .hass=${hass}
                    .datetime=${entity.last_changed}
                    capitalize
                ></ha-relative-time>
            `;
        case "last-updated":
            return html`
                <ha-relative-time
                    .hass=${hass}
                    .datetime=${entity.last_updated}
                    capitalize
                ></ha-relative-time>
            `;
        case "none":
            return undefined;
    }
}
