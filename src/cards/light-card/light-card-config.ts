import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, number, object, optional, string } from "superstruct";
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
    use_light_color?: boolean;
    brightness_control_set_min?: number;
    brightness_control_set_max?: number;
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
        use_light_color: optional(boolean()),
        brightness_control_set_min: optional(number()),
        brightness_control_set_max: optional(number()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
