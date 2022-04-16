import { HassEntity } from "home-assistant-js-websocket";
import { UNAVAILABLE } from "../../ha/data/entity";
import {
    ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_COLOR,
    ALARM_CONTROL_PANEL_CARD_STATE_COLOR,
    ALARM_CONTROL_PANEL_CARD_STATE_SERVICE,
} from "./const";

export function getStateColor(state: string): string {
    return (
        ALARM_CONTROL_PANEL_CARD_STATE_COLOR[state.split("_")[0]] ??
        ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_COLOR
    );
}

export function getStateService(state: string): string | undefined {
    return ALARM_CONTROL_PANEL_CARD_STATE_SERVICE[state];
}

export function shouldPulse(state: string): boolean {
    return ["arming", "triggered", "pending", UNAVAILABLE].indexOf(state) >= 0;
}

export function isActionsAvailable(entity: HassEntity) {
    return UNAVAILABLE !== entity.state;
}

export function isDisarmed(entity: HassEntity) {
    return entity.state === "disarmed";
}

export function hasCode(entity: HassEntity): boolean {
    return entity.attributes.code_format && entity.attributes.code_format !== "no_code";
}
