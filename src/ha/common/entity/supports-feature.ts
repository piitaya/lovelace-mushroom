import { HassEntity } from "home-assistant-js-websocket";

export const supportsFeature = (stateObj: HassEntity, feature: number): boolean =>
    (stateObj.attributes.supported_features! & feature) !== 0;
