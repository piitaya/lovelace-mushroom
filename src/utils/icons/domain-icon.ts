import { HassEntity } from "home-assistant-js-websocket";
import { UpdateEntity, updateIsInstalling } from "../../ha/data/update";
import { alarmPanelIcon } from "./alarm-panel-icon";
import { binarySensorIcon } from "./binary-sensor-icon";
import { coverIcon } from "./cover-icon";
import { sensorIcon } from "./sensor-icon";

const DEFAULT_DOMAIN_ICON = "mdi:bookmark";

const FIXED_DOMAIN_ICONS = {
    alert: "mdi:alert",
    air_quality: "mdi:air-filter",
    automation: "mdi:robot",
    calendar: "mdi:calendar",
    camera: "mdi:video",
    climate: "mdi:thermostat",
    configurator: "mdi:cog",
    conversation: "mdi:text-to-speech",
    counter: "mdi:counter",
    fan: "mdi:fan",
    google_assistant: "mdi:google-assistant",
    group: "mdi:google-circles-communities",
    homeassistant: "mdi:home-assistant",
    homekit: "mdi:home-automation",
    image_processing: "mdi:image-filter-frames",
    input_button: "mdi:gesture-tap-button",
    input_datetime: "mdi:calendar-clock",
    input_number: "mdi:ray-vertex",
    input_select: "mdi:format-list-bulleted",
    input_text: "mdi:form-textbox",
    light: "mdi:lightbulb",
    mailbox: "mdi:mailbox",
    notify: "mdi:comment-alert",
    number: "mdi:ray-vertex",
    persistent_notification: "mdi:bell",
    person: "mdi:account",
    plant: "mdi:flower",
    proximity: "mdi:apple-safari",
    remote: "mdi:remote",
    scene: "mdi:palette",
    script: "mdi:script-text",
    select: "mdi:format-list-bulleted",
    sensor: "mdi:eye",
    siren: "mdi:bullhorn",
    simple_alarm: "mdi:bell",
    sun: "mdi:white-balance-sunny",
    timer: "mdi:timer-outline",
    updater: "mdi:cloud-upload",
    vacuum: "mdi:robot-vacuum",
    water_heater: "mdi:thermometer",
    weather: "mdi:weather-cloudy",
    zone: "mdi:map-marker-radius",
};

export function domainIcon(domain: string, entity?: HassEntity, state?: string): string {
    switch (domain) {
        case "alarm_control_panel":
            return alarmPanelIcon(state);

        case "binary_sensor":
            return binarySensorIcon(state, entity);

        case "button":
            switch (entity?.attributes.device_class) {
                case "restart":
                    return "mdi:restart";
                case "update":
                    return "mdi:package-up";
                default:
                    return "mdi:gesture-tap-button";
            }

        case "cover":
            return coverIcon(state, entity);

        case "device_tracker":
            if (entity?.attributes.source_type === "router") {
                return state === "home" ? "mdi:lan-connect" : "mdi:lan-disconnect";
            }
            if (["bluetooth", "bluetooth_le"].includes(entity?.attributes.source_type)) {
                return state === "home" ? "mdi:bluetooth-connect" : "mdi:bluetooth";
            }
            return state === "not_home" ? "mdi:account-arrow-right" : "mdi:account";

        case "humidifier":
            return state && state === "off" ? "mdi:air-humidifier-off" : "mdi:air-humidifier";

        case "input_boolean":
            return state === "on" ? "mdi:check-circle-outline" : "mdi:close-circle-outline";

        case "lock":
            switch (state) {
                case "unlocked":
                    return "mdi:lock-open";
                case "jammed":
                    return "mdi:lock-alert";
                case "locking":
                case "unlocking":
                    return "mdi:lock-clock";
                default:
                    return "mdi:lock";
            }

        case "media_player":
            return state === "playing" ? "mdi:cast-connected" : "mdi:cast";

        case "switch":
            switch (entity?.attributes.device_class) {
                case "outlet":
                    return state === "on" ? "mdi:power-plug" : "mdi:power-plug-off";
                case "switch":
                    return state === "on" ? "mdi:toggle-switch" : "mdi:toggle-switch-off";
                default:
                    return "mdi:flash";
            }

        case "zwave":
            switch (state) {
                case "dead":
                    return "mdi:emoticon-dead";
                case "sleeping":
                    return "mdi:sleep";
                case "initializing":
                    return "mdi:timer-sand";
                default:
                    return "mdi:z-wave";
            }

        case "sensor": {
            const icon = sensorIcon(entity);
            if (icon) {
                return icon;
            }

            break;
        }

        case "input_datetime":
            if (!entity?.attributes.has_date) {
                return "mdi:clock";
            }
            if (!entity.attributes.has_time) {
                return "mdi:calendar";
            }
            break;

        case "sun":
            return entity?.state === "above_horizon"
                ? FIXED_DOMAIN_ICONS[domain]
                : "mdi:weather-night";

        case "update":
            return entity?.state === "on"
                ? updateIsInstalling(entity as UpdateEntity)
                    ? "mdi:package-down"
                    : "mdi:package-up"
                : "mdi:package";
    }

    if (domain in FIXED_DOMAIN_ICONS) {
        return FIXED_DOMAIN_ICONS[domain];
    }

    // eslint-disable-next-line
    console.warn(`Unable to find icon for domain ${domain}`);
    return DEFAULT_DOMAIN_ICON;
}
