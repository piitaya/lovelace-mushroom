import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { array, assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export const VACUUM_COMMANDS = [
    "start_pause",
    "stop",
    "locate",
    "clean_spot",
    "return_home",
] as const;

export type VacuumCommand = typeof VACUUM_COMMANDS[number];

export interface VacuumCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    layout?: Layout;
    hide_state?: boolean;
    commands?: VacuumCommand[];
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
        commands: optional(array(string())),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
