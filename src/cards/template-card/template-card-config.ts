import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { array, assign, boolean, object, optional, string, union } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface TemplateCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    icon_color?: string;
    primary?: string;
    secondary?: string;
    multiline_secondary?: boolean;
    layout?: Layout;
    fill_container?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
    entity_id?: string | string[];
}

export const templateCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        icon_color: optional(string()),
        primary: optional(string()),
        secondary: optional(string()),
        multiline_secondary: optional(boolean()),
        layout: optional(layoutStruct),
        fill_container: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
        entity_id: optional(union([string(), array(string())])),
    })
);
