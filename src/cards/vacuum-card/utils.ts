import { HassEntity } from "home-assistant-js-websocket";
import { STATE_CLEANING } from "./const";

export function isCleaning(entity: HassEntity) {
    return entity.state.toLowerCase() === STATE_CLEANING;
}

export function isStopped(entity: HassEntity) {
    return entity.state.toLowerCase() !== STATE_CLEANING;
}
