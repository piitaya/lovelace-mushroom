import { PREFIX_NAME } from "../../const";

export const UPDATE_CARD_NAME = `${PREFIX_NAME}-update-card`;
export const UPDATE_CARD_EDITOR_NAME = `${UPDATE_CARD_NAME}-editor`;
export const UPDATE_ENTITY_DOMAINS = ["update"];

export const UPDATE_CARD_DEFAULT_STATE_COLOR = "var(--rgb-grey)";

export const UPDATE_CARD_STATE_COLOR = {
  on: "var(--rgb-state-update-on)",
  off: "var(--rgb-state-update-off)",
  installing: "var(--rgb-state-update-installing)",
};
