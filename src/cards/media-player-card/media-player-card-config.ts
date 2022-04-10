import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface MediaPlayerCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    show_buttons_control?: boolean;
    show_volume_control?: boolean;
    layout?: Layout;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const mediaPlayerCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        show_buttons_control: optional(boolean()),
        show_volume_control: optional(boolean()),
        layout: optional(layoutStruct),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
