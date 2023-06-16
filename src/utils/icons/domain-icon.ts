import { HassEntity } from "home-assistant-js-websocket";
import { UpdateEntity, updateIsInstalling } from "../../ha";
import { alarmPanelIcon } from "./alarm-panel-icon";
import { binarySensorIcon } from "./binary-sensor-icon";
import { coverIcon } from "./cover-icon";
import { sensorIcon } from "./sensor-icon";
import { weatherIcon } from "./weather-icon";

const DEFAULT_DOMAIN_ICON = "mdi:bookmark";

const FIXED_DOMAIN_ICONS = {
    air_quality: "mdi:air-filter",
    alert: "mdi:alert",
    calendar: "mdi:calendar",
    climate: "mdi:thermostat",
    configurator: "mdi:cog",
    conversation: "mdi:microphone-messafe",
    counter: "mdi:counter",
    demo: "mdi:home-assistant",
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
    plant: "mdi:flower",
    proximity: "mdi:apple-safari",
    remote: "mdi:remote",
    scene: "mdi:palette",
    schedule: "mdi:calendar-clock",
    script: "mdi:script-text",
    select: "mdi:format-list-bulleted",
    sensor: "mdi:eye",
    simple_alarm: "mdi:bell",
    siren: "mdi:bullhorn",
    stt: "mdi:microphone-message",
    text: "mdi:form-text-box",
    timer: "mdi:timer-outline",
    tts: "mdi:speaker-message",
    updater: "mdi:cloud-upload",
    vacuum: "mdi:robot-vacuum",
    zone: "mdi:map-marker-radius",
};

export function domainIcon(domain: string, stateObj?: HassEntity, state?: string): string {
    const compareState = state !== undefined ? state : stateObj?.state;

    switch (domain) {
        case "alarm_control_panel":
            return alarmPanelIcon(compareState);

        case "automation":
            return compareState === "off" ? "mdi:robot-off" : "mdi:robot";

        case "binary_sensor":
            return binarySensorIcon(compareState, stateObj);

        case "button":
            switch (stateObj?.attributes.device_class) {
                case "restart":
                    return "mdi:restart";
                case "update":
                    return "mdi:package-up";
                default:
                    return "mdi:gesture-tap-button";
            }

        case "camera":
            return compareState === "off" ? "mdi:video-off" : "mdi:video";

        case "cover":
            return coverIcon(compareState, stateObj);

        case "device_tracker":
            if (stateObj?.attributes.source_type === "router") {
                return compareState === "home" ? "mdi:lan-connect" : "mdi:lan-disconnect";
            }
            if (["bluetooth", "bluetooth_le"].includes(stateObj?.attributes.source_type)) {
                return compareState === "home" ? "mdi:bluetooth-connect" : "mdi:bluetooth";
            }
            return compareState === "not_home" ? "mdi:account-arrow-right" : "mdi:account";

        case "fan":
            return compareState === "off" ? "mdi:fan-off" : "mdi:fan";

        case "humidifier":
            return compareState && compareState === "off"
                ? "mdi:air-humidifier-off"
                : "mdi:air-humidifier";

        case "input_boolean":
            return compareState === "on" ? "mdi:check-circle-outline" : "mdi:close-circle-outline";

        case "input_datetime":
            if (!stateObj?.attributes.has_date) {
                return "mdi:clock";
            }
            if (!stateObj.attributes.has_time) {
                return "mdi:calendar";
            }
            break;

        case "lock":
            switch (compareState) {
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
            switch (stateObj?.attributes.device_class) {
                case "speaker":
                    switch (compareState) {
                        case "playing":
                            return "mdi:speaker-play";
                        case "paused":
                            return "mdi:speaker-pause";
                        case "off":
                            return "mdi:speaker-off";
                        default:
                            return "mdi:speaker";
                    }
                case "tv":
                    switch (compareState) {
                        case "playing":
                            return "mdi:television-play";
                        case "paused":
                            return "mdi:television-pause";
                        case "off":
                            return "mdi:television-off";
                        default:
                            return "mdi:television";
                    }
                case "receiver":
                    switch (compareState) {
                        case "off":
                            return "mdi:audio-video-off";
                        default:
                            return "mdi:audio-video";
                    }
                default:
                    switch (compareState) {
                        case "playing":
                        case "paused":
                            return "mdi:cast-connected";
                        case "off":
                            return "mdi:cast-off";
                        default:
                            return "mdi:cast";
                    }
            }

        case "person":
            return compareState === "not_home" ? "mdi:account-arrow-right" : "mdi:account";

        case "switch":
            switch (stateObj?.attributes.device_class) {
                case "outlet":
                    return compareState === "on" ? "mdi:power-plug" : "mdi:power-plug-off";
                case "switch":
                    return compareState === "on"
                        ? "mdi:toggle-switch-variant"
                        : "mdi:toggle-switch-variant-off";
                default:
                    return "mdi:toggle-switch-variant";
            }

        case "sensor": {
            const icon = sensorIcon(stateObj);
            if (icon) {
                return icon;
            }

            break;
        }

        case "sun":
            return stateObj?.state === "above_horizon"
                ? "mdi:white-balance-sunny"
                : "mdi:weather-night";

        case "switch_as_x":
            return "mdi:swap-horizontal";

        case "threshold":
            return "mdi:chart-sankey";

        case "update":
            return stateObj?.state === "on"
                ? updateIsInstalling(stateObj as UpdateEntity)
                    ? "mdi:package-down"
                    : "mdi:package-up"
                : "mdi:package";

        case "water_heater":
            return compareState === "off" ? "mdi:water-boiler-off" : "mdi:water-boiler";

        case "weather":
            return weatherIcon(stateObj?.state);
    }

    if (domain in FIXED_DOMAIN_ICONS) {
        return FIXED_DOMAIN_ICONS[domain];
    }

    return DEFAULT_DOMAIN_ICON;
}
