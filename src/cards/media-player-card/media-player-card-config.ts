import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { array, assign, boolean, enums, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export const MEDIA_LAYER_MEDIA_CONTROLS = [
    "on_off",
    "shuffle",
    "previous",
    "play_pause_stop",
    "next",
    "repeat",
] as const;

export type MediaPlayerMediaControl = typeof MEDIA_LAYER_MEDIA_CONTROLS[number];

export const MEDIA_PLAYER_VOLUME_CONTROLS = [
    "volume_mute",
    "volume_set",
    "volume_buttons",
] as const;

export type MediaPlayerVolumeControl = typeof MEDIA_PLAYER_VOLUME_CONTROLS[number];

export interface MediaPlayerCardConfig extends LovelaceCardConfig {
    entity?: string;
    name?: string;
    icon?: string;
    use_media_info?: boolean;
    use_media_artwork?: boolean;
    volume_controls?: MediaPlayerVolumeControl[];
    media_controls?: MediaPlayerMediaControl[];
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
        use_media_info: optional(boolean()),
        use_media_artwork: optional(boolean()),
        volume_controls: optional(array(enums(MEDIA_PLAYER_VOLUME_CONTROLS))),
        media_controls: optional(array(enums(MEDIA_LAYER_MEDIA_CONTROLS))),
        layout: optional(layoutStruct),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
