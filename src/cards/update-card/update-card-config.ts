import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface UpdateCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    use_entity_picture?: boolean;
    layout?: Layout;
    fill_container?: boolean;
    show_buttons_control?: boolean;
    collapsible_controls?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const updateCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        name: optional(string()),
        icon: optional(string()),
        use_entity_picture: optional(boolean()),
        layout: optional(layoutStruct),
        fill_container: optional(boolean()),
        show_buttons_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
