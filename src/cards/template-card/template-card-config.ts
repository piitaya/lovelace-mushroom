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
    icon?: string;
    icon_color?: string;
    primary?: string;
    secondary?: string;
    wrap_secondary?: boolean;
    vertical?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    entity_id?: string | string[];
}

export const templateCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        icon: optional(string()),
        icon_color: optional(string()),
        primary: optional(string()),
        secondary: optional(string()),
        wrap_secondary: optional(boolean()),
        vertical: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        entity_id: optional(union([string(), array(string())])),
    })
);
