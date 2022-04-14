import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import {
    assign,
    enums,
    instance,
    integer,
    map,
    object,
    optional,
    set,
    string,
} from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { DISPLAY_MODE, GRAPH_MODE } from "./const";

export type GraphMode = typeof GRAPH_MODE[number];
export type DisplayMode = typeof DISPLAY_MODE[number];

export interface GraphCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    hours_to_show?: number;
    graph_color?: string;
    graph_mode?: GraphMode;
    display_mode?: DisplayMode;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const graphCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        hours_to_show: optional(integer()),
        graph_color: optional(string()),
        graph_mode: optional(enums(GRAPH_MODE)),
        display_mode: optional(enums(DISPLAY_MODE)),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
