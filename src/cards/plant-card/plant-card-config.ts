import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface PlantCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    use_entity_picture?: boolean;
    layout?: Layout;
    hide_state?: boolean;
    hide_name?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const plantCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        use_entity_picture: optional(boolean()),
        layout: optional(layoutStruct),
        hide_state: optional(boolean()),
        hide_name: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
