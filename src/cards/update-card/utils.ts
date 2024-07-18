import {
  UPDATE_CARD_DEFAULT_STATE_COLOR,
  UPDATE_CARD_STATE_COLOR,
} from "./const";

export function getStateColor(state: string, isInstalling: boolean): string {
  if (isInstalling) {
    return UPDATE_CARD_STATE_COLOR["installing"];
  } else {
    return UPDATE_CARD_STATE_COLOR[state] || UPDATE_CARD_DEFAULT_STATE_COLOR;
  }
}
