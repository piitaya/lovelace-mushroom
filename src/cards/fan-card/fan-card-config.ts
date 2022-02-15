import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";

export interface FanCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    vertical?: boolean;
    hide_state?: boolean;
    icon_animation?: boolean;
    show_percentage_control?: boolean;
    show_oscillate_control?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const fanCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        name: optional(string()),
        icon: optional(string()),
        icon_animation: optional(boolean()),
        vertical: optional(boolean()),
        hide_state: optional(boolean()),
        show_percentage_control: optional(boolean()),
        show_oscillate_control: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
