import { HassEntityAttributeBase, HassEntityBase } from "home-assistant-js-websocket";

export type InputNumberEntity = HassEntityBase & {
    attributes: HassEntityAttributeBase & {
        min?: number;
        max?: number;
        step?: number;
        value?: number;
    };
};
