import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, number, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface ThermostatCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    layout?: Layout;
    hide_state?: boolean;
    use_action_color?: true;
    use_action_icon?: true;
    show_mode_control?: boolean;
    show_temp_control?: boolean;
    show_temp_indicators?: boolean;
    temperature_gap?: number;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const thermostatCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        layout: optional(layoutStruct),
        hide_state: optional(boolean()),
        use_action_color: optional(boolean()),
        use_action_icon: optional(boolean()),
        show_mode_control: optional(boolean()),
        show_temp_control: optional(boolean()),
        show_temp_indicators: optional(boolean()),
        temperature_gap: optional(number()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
