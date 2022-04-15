import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { array, assign, boolean, enums, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export const MEDIA_PLAYER_COMMANDS = [
    "on_off",
    "shuffle",
    "previous",
    "play_pause_stop",
    "next",
    "repeat",
] as const;

export type MediaPlayerCommand = typeof MEDIA_PLAYER_COMMANDS[number];

export const MEDIA_PLAYER_VOLUME_CONTROLS = [
    "volume_mute",
    "volume_set",
    "volume_buttons",
] as const;

export type MediaPlayerVolumeControlMode = typeof MEDIA_PLAYER_VOLUME_CONTROLS[number];

export interface MediaPlayerCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    volume_controls?: MediaPlayerVolumeControlMode[];
    commands?: MediaPlayerCommand[];
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
        volume_controls: optional(array(enums(MEDIA_PLAYER_VOLUME_CONTROLS))),
        commands: optional(array(enums(MEDIA_PLAYER_COMMANDS))),
        layout: optional(layoutStruct),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
