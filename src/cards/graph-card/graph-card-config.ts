import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import {
    assign,
    boolean,
    intersection,
    max,
    min,
    number,
    object,
    optional,
    string,
} from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";

export interface GraphCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    hours_to_show?: number;
    graph_color?: string;
    fill?: boolean;
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
        hours_to_show: intersection([
            min(number(), 1),
            max(number(), 48),
        ]),
        graph_color: optional(string()),
        fill: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
