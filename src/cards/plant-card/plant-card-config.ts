import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string, number } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface PlantCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    use_plantbook_picture?: boolean;
    min_temperature?: number;
    max_temperature?: number;
    min_moisture?: number;
    max_moisture?: number;
    min_conductivity?: number;
    max_conductivity?: number;
    min_brightness?: number;
    max_brightness?: number;
    layout?: Layout;
    hide_state?: boolean;
    hide_name?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const flowerCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        use_plantbook_picture: optional(boolean()),
        min_temperature: optional(number()),
        max_temperature: optional(number()),
        min_moisture: optional(number()),
        max_moisture: optional(number()),
        min_conductivity: optional(number()),
        max_conductivity: optional(number()),
        min_brightness: optional(number()),
        max_brightness: optional(number()),
        layout: optional(layoutStruct),
        hide_state: optional(boolean()),
        hide_name: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
