import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface VacuumCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    layout?: Layout;
    hide_state?: boolean;
    show_buttons_control?: false;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const vacuumCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        name: optional(string()),
        icon: optional(string()),
        layout: optional(layoutStruct),
        hide_state: optional(boolean()),
        show_buttons_control: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
