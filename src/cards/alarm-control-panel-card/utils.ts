import { HassEntity } from "home-assistant-js-websocket";
import { UNAVAILABLE } from "../../ha";
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

export function isActionsAvailable(stateObj: HassEntity) {
  return UNAVAILABLE !== stateObj.state;
}

export function isDisarmed(stateObj: HassEntity) {
  return stateObj.state === "disarmed";
}

export function hasCode(stateObj: HassEntity): boolean {
  return (
    stateObj.attributes.code_format &&
    stateObj.attributes.code_format !== "no_code"
  );
}
