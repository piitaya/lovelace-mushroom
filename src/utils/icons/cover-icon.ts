import { HassEntity } from "home-assistant-js-websocket";

export const coverIcon = (state?: string, entity?: HassEntity): string => {
    const open = state !== "closed";

    switch (entity?.attributes.device_class) {
        case "garage":
            switch (state) {
                case "opening":
                    return "mdi:arrow-up-box";
                case "closing":
                    return "mdi:arrow-down-box";
                case "closed":
                    return "mdi:garage";
                default:
                    return "mdi:garage-open";
            }
        case "gate":
            switch (state) {
                case "opening":
                case "closing":
                    return "mdi:gate-arrow-right";
                case "closed":
                    return "mdi:gate";
                default:
                    return "mdi:gate-open";
            }
        case "door":
            return open ? "mdi:door-open" : "mdi:door-closed";
        case "damper":
            return open ? "md:circle" : "mdi:circle-slice-8";
        case "shutter":
            switch (state) {
                case "opening":
                    return "mdi:arrow-up-box";
                case "closing":
                    return "mdi:arrow-down-box";
                case "closed":
                    return "mdi:window-shutter";
                default:
                    return "mdi:window-shutter-open";
            }
        case "curtain":
            switch (state) {
                case "opening":
                    return "mdi:arrow-split-vertical";
                case "closing":
                    return "mdi:arrow-collapse-horizontal";
                case "closed":
                    return "mdi:curtains-closed";
                default:
                    return "mdi:curtains";
            }
        case "blind":
        case "shade":
            switch (state) {
                case "opening":
                    return "mdi:arrow-up-box";
                case "closing":
                    return "mdi:arrow-down-box";
                case "closed":
                    return "mdi:blinds";
                default:
                    return "mdi:blinds-open";
            }
        case "window":
            switch (state) {
                case "opening":
                    return "mdi:arrow-up-box";
                case "closing":
                    return "mdi:arrow-down-box";
                case "closed":
                    return "mdi:window-closed";
                default:
                    return "mdi:window-open";
            }
    }

    switch (state) {
        case "opening":
            return "mdi:arrow-up-box";
        case "closing":
            return "mdi:arrow-down-box";
        case "closed":
            return "mdi:window-closed";
        default:
            return "mdi:window-open";
    }
};

export const computeOpenIcon = (stateObj: HassEntity): string => {
    switch (stateObj.attributes.device_class) {
        case "awning":
        case "curtain":
        case "door":
        case "gate":
            return "mdi:arrow-expand-horizontal";
        default:
            return "mdi:arrow-up";
    }
};

export const computeCloseIcon = (stateObj: HassEntity): string => {
    switch (stateObj.attributes.device_class) {
        case "awning":
        case "curtain":
        case "door":
        case "gate":
            return "mdi:arrow-collapse-horizontal";
        default:
            return "mdi:arrow-down";
    }
};
