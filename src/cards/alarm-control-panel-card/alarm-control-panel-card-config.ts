import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { array, assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface AlarmControlPanelCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    states?: string[];
    show_keypad?: boolean;
    layout?: Layout;
    fill_container?: boolean;
    hide_state?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const alarmControlPanelCardCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        name: optional(string()),
        icon: optional(string()),
        states: optional(array()),
        show_keypad: optional(boolean()),
        layout: optional(layoutStruct),
        fill_container: optional(boolean()),
        hide_state: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
