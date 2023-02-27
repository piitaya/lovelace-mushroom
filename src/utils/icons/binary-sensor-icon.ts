import { HassEntity } from "home-assistant-js-websocket";

export const binarySensorIcon = (state?: string, stateObj?: HassEntity) => {
    const isOff = state === "off";
    switch (stateObj?.attributes.device_class) {
        case "battery":
            return isOff ? "mdi:battery" : "mdi:battery-outline";
        case "battery_charging":
            return isOff ? "mdi:battery" : "mdi:battery-charging";
        case "carbon_monoxide":
            return isOff ? "mdi:smoke-detector" : "mdi:smoke-detector-alert";
        case "cold":
            return isOff ? "mdi:thermometer" : "mdi:snowflake";
        case "connectivity":
            return isOff ? "mdi:close-network-outline" : "mdi:check-network-outline";
        case "door":
            return isOff ? "mdi:door-closed" : "mdi:door-open";
        case "garage_door":
            return isOff ? "mdi:garage" : "mdi:garage-open";
        case "power":
            return isOff ? "mdi:power-plug-off" : "mdi:power-plug";
        case "gas":
        case "problem":
        case "safety":
        case "tamper":
            return isOff ? "mdi:check-circle" : "mdi:alert-circle";
        case "smoke":
            return isOff ? "mdi:smoke-detector-variant" : "mdi:smoke-detector-variant-alert";
        case "heat":
            return isOff ? "mdi:thermometer" : "mdi:fire";
        case "light":
            return isOff ? "mdi:brightness-5" : "mdi:brightness-7";
        case "lock":
            return isOff ? "mdi:lock" : "mdi:lock-open";
        case "moisture":
            return isOff ? "mdi:water-off" : "mdi:water";
        case "motion":
            return isOff ? "mdi:motion-sensor-off" : "mdi:motion-sensor";
        case "occupancy":
            return isOff ? "mdi:home-outline" : "mdi:home";
        case "opening":
            return isOff ? "mdi:square" : "mdi:square-outline";
        case "plug":
            return isOff ? "mdi:power-plug-off" : "mdi:power-plug";
        case "presence":
            return isOff ? "mdi:home-outline" : "mdi:home";
        case "running":
            return isOff ? "mdi:stop" : "mdi:play";
        case "sound":
            return isOff ? "mdi:music-note-off" : "mdi:music-note";
        case "update":
            return isOff ? "mdi:package" : "mdi:package-up";
        case "vibration":
            return isOff ? "mdi:crop-portrait" : "mdi:vibrate";
        case "window":
            return isOff ? "mdi:window-closed" : "mdi:window-open";
        default:
            return isOff ? "mdi:radiobox-blank" : "mdi:checkbox-marked-circle";
    }
};
