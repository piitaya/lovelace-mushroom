import { PREFIX_NAME } from "../../const";

export const GRAPH_CARD_NAME = `${PREFIX_NAME}-graph-card`;
export const GRAPH_CARD_EDITOR_NAME = `${GRAPH_CARD_NAME}-editor`;
export const GRAPH_ENTITY_DOMAINS = ["counter", "input_number", "number", "sensor"];

export const GRAPH_MODE = ["line", "fill"] as const;

export const GRAPH_MINUTE = 60000;
export const GRAPH_HOUR = GRAPH_MINUTE * 60;
export const GRAPH_DEFAULT_HOURS = 24;