import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";

export interface SensorCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    vertical?: boolean;
    hide_state?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

export const sensorCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: string(),
        icon: optional(string()),
        name: optional(string()),
        vertical: optional(boolean()),
        hide_state: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
    })
);
