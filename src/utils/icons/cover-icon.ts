import { HassEntity } from "home-assistant-js-websocket";

import { UNAVAILABLE, UNKNOWN, OFF } from "../../ha/data/entity";
import { DeviceClasses, States } from "../../ha/data/cover";

export const coverIcon = (state?: string, entity?: HassEntity): string => {
    const open = state !== States.CLOSED;

    switch (entity?.attributes.device_class) {
        case DeviceClasses.GARAGE:
            switch (state) {
                case States.OPENING:
                    return "mdi:arrow-up-box";
                case States.CLOSING:
                    return "mdi:arrow-down-box";
                case States.CLOSED:
                    return "mdi:garage";
                default:
                    return "mdi:garage-open";
            }
        case DeviceClasses.GATE:
            switch (state) {
                case States.OPENING:
                case States.CLOSING:
                    return "mdi:gate-arrow-right";
                case States.CLOSED:
                    return "mdi:gate";
                default:
                    return "mdi:gate-open";
            }
        case DeviceClasses.DOOR:
            return open ? "mdi:door-open" : "mdi:door-closed";
        case DeviceClasses.DAMPER:
            return open ? "md:circle" : "mdi:circle-slice-8";
        case DeviceClasses.SHUTTER:
            switch (state) {
                case States.OPENING:
                    return "mdi:arrow-up-box";
                case States.CLOSING:
                    return "mdi:arrow-down-box";
                case States.CLOSED:
                    return "mdi:window-shutter";
                default:
                    return "mdi:window-shutter-open";
            }
        case DeviceClasses.CURTAIN:
            switch (state) {
                case States.OPENING:
                    return "mdi:arrow-split-vertical";
                case States.CLOSING:
                    return "mdi:arrow-collapse-horizontal";
                case States.CLOSED:
                    return "mdi:curtains-closed";
                default:
                    return "mdi:curtains";
            }
        case DeviceClasses.BLIND:
        case DeviceClasses.SHADE:
            switch (state) {
                case States.OPENING:
                    return "mdi:arrow-up-box";
                case States.CLOSING:
                    return "mdi:arrow-down-box";
                case States.CLOSED:
                    return "mdi:blinds";
                default:
                    return "mdi:blinds-open";
            }
        case DeviceClasses.WINDOW:
            switch (state) {
                case States.OPENING:
                    return "mdi:arrow-up-box";
                case States.CLOSING:
                    return "mdi:arrow-down-box";
                case States.CLOSED:
                    return "mdi:window-closed";
                default:
                    return "mdi:window-open";
            }
    }

    switch (state) {
        case States.OPENING:
            return "mdi:arrow-up-box";
        case States.CLOSING:
            return "mdi:arrow-down-box";
        case States.CLOSED:
            return "mdi:window-closed";
        default:
            return "mdi:window-open";
    }
};

export const computeOpenIcon = (stateObj: HassEntity): string => {
    switch (stateObj.attributes.device_class) {
        case DeviceClasses.AWNING:
        case DeviceClasses.CURTAIN:
        case DeviceClasses.DOOR:
        case DeviceClasses.GATE:
            return "mdi:arrow-expand-horizontal";
        default:
            return "mdi:arrow-up";
    }
};

export const computeCloseIcon = (stateObj: HassEntity): string => {
    switch (stateObj.attributes.device_class) {
        case DeviceClasses.AWNING:
        case DeviceClasses.CURTAIN:
        case DeviceClasses.DOOR:
        case DeviceClasses.GATE:
            return "mdi:arrow-collapse-horizontal";
        default:
            return "mdi:arrow-down";
    }
};