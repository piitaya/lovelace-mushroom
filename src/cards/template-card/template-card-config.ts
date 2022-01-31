import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import {
    array,
    assign,
    boolean,
    object,
    optional,
    string,
    union,
} from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";

export interface TemplateCardConfig extends LovelaceCardConfig {
    name?: string;
    icon?: string;
    state?: string;
    vertical?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    entity_id?: string | string[];
}

export const templateCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        name: optional(string()),
        icon: optional(string()),
        state: optional(string()),
        vertical: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        entity_id: optional(union([string(), array(string())])),
    })
);
