import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface LightCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    layout?: Layout;
    hide_state?: boolean;
    show_brightness_control?: boolean;
    show_color_temp_control?: boolean;
    show_color_control?: boolean;
    collapsible_controls?: boolean;
    use_light_color?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const lightCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        layout: optional(layoutStruct),
        hide_state: optional(boolean()),
        show_brightness_control: optional(boolean()),
        show_color_temp_control: optional(boolean()),
        show_color_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
        use_light_color: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
