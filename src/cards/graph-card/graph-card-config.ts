import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import {
    assign,
    enums,
    integer,
    object,
    optional,
    string,
} from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { GRAPH_MODE } from "./const";

export type GraphMode = typeof GRAPH_MODE[number];

export interface GraphCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    hours_to_show?: number;
    graph_color?: string;
    graph_mode?: GraphMode;
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
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
