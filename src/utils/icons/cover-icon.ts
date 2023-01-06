import { HassEntity } from "home-assistant-js-websocket";

export const coverIcon = (state?: string, stateObj?: HassEntity): string => {
    const open = state !== "closed";

    switch (stateObj?.attributes.device_class) {
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
            return open ? "mdi:circle" : "mdi:circle-slice-8";
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
            switch (state) {
                case "opening":
                    return "mdi:arrow-up-box";
                case "closing":
                    return "mdi:arrow-down-box";
                case "closed":
                    return "mdi:blinds-horizontal-closed";
                default:
                    return "mdi:blinds-horizontal";
            }
        case "shade":
            switch (state) {
                case "opening":
                    return "mdi:arrow-up-box";
                case "closing":
                    return "mdi:arrow-down-box";
                case "closed":
                    return "mdi:roller-shade-closed";
                default:
                    return "mdi:roller-shade";
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
