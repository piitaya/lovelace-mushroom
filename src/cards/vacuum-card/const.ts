import { PREFIX_NAME } from "../../const";

export const VACUUM_CARD_NAME = `${PREFIX_NAME}-vacuum-card`;
export const VACUUM_CARD_EDITOR_NAME = `${VACUUM_CARD_NAME}-editor`;
export const VACUUM_ENTITY_DOMAINS = ["vacuum"];

export const STATE_CLEANING = "cleaning";
export const STATE_DOCKED = "docked";
export const STATE_IDLE = "idle";
export const STATE_PAUSED = "paused";
export const STATE_RETURNING = "returning";
export const STATE_ERROR = "error";