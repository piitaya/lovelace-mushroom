import { array, assign, boolean, enums, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
	AppearanceSharedConfig,
	appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export const MEDIA_LAYER_MEDIA_CONTROLS = [
	"on_off",
	"shuffle",
	"previous",
	"play_pause_stop",
	"next",
	"repeat",
] as const;

export type MediaPlayerMediaControl = (typeof MEDIA_LAYER_MEDIA_CONTROLS)[number];

export const MEDIA_PLAYER_VOLUME_CONTROLS = [
	"volume_mute",
	"volume_set",
	"volume_buttons",
] as const;

export type MediaPlayerVolumeControl = (typeof MEDIA_PLAYER_VOLUME_CONTROLS)[number];

export type MediaPlayerCardConfig = LovelaceCardConfig &
	EntitySharedConfig &
	AppearanceSharedConfig &
	ActionsSharedConfig & {
	use_media_info?: boolean;
	show_volume_level?: boolean;
	volume_controls?: MediaPlayerVolumeControl[];
	media_controls?: MediaPlayerMediaControl[];
	collapsible_controls?: boolean;
	artwork?: MediaPlayerArtworkMode;
};

export const MEDIA_PLAYER_ARTWORK_MODES = [
	"none",
	"cover",
	"full_cover",
] as const;

export type MediaPlayerArtworkMode = (typeof MEDIA_PLAYER_ARTWORK_MODES)[number];

export const mediaPlayerCardConfigStruct = assign(
	lovelaceCardConfigStruct,
	assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
	object({
		use_media_info: optional(boolean()),
		show_volume_level: optional(boolean()),
		volume_controls: optional(array(enums(MEDIA_PLAYER_VOLUME_CONTROLS))),
		media_controls: optional(array(enums(MEDIA_LAYER_MEDIA_CONTROLS))),
		collapsible_controls: optional(boolean()),
		artwork: optional(enums(MEDIA_PLAYER_ARTWORK_MODES)),
	})
);