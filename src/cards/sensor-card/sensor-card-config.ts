import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, enums, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";

export const PRIMARY_INFOS = ["name", "state"] as const;

export const SECONDARY_INFOS = [
    "name",
    "state",
    "last-changed",
    "last-updated",
    "none",
] as const;

export type PrimaryInfo = typeof PRIMARY_INFOS[number];
export type SecondaryInfo = typeof SECONDARY_INFOS[number];
export type Info = PrimaryInfo | SecondaryInfo;

export interface SensorCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    icon_color?: string;
    vertical?: boolean;
    primary_info?: PrimaryInfo;
    secondary_info?: SecondaryInfo;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

export const sensorCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: string(),
        icon: optional(string()),
        name: optional(string()),
        icon_color: optional(string()),
        vertical: optional(boolean()),
        primary_info: optional(enums(PRIMARY_INFOS)),
        secondary_info: optional(enums(SECONDARY_INFOS)),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
    })
);
