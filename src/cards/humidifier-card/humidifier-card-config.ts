import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface HumidifierCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    layout?: Layout;
    fill_container?: boolean;
    hide_state?: boolean;
    show_target_humidity_control?: boolean;
    collapsible_controls?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const humidifierCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        layout: optional(layoutStruct),
        fill_container: optional(boolean()),
        hide_state: optional(boolean()),
        show_target_humidity_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
