import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig, wrapInCombine } from "./common";

const PLAYBACK_CONTROLS: Record<string, string> = {
  on_off: "power",
  shuffle: "shuffle",
  previous: "media_previous_track",
  play_pause_stop: "media_play_pause",
  next: "media_next_track",
  repeat: "repeat",
};

/**
 * Media Player Card → Tile Card Migration
 *
 * Mapped:
 *   use_media_info                   → state_content: append "media_title",
 *                                       "media_artist"
 *   show_volume_level                → state_content: append "volume_level"
 *   media_controls                   → feature: media-player-playback (with
 *                                       controls)
 *   volume_controls (volume_set)     → feature: media-player-volume-slider
 *   volume_controls (volume_buttons) → feature: media-player-volume-buttons
 *   volume_controls (volume_mute)    → show_mute_button on the volume feature
 *
 * Not mapped (no tile equivalent):
 *   volume_controls (volume_mute) alone - mute needs a volume feature to sit on
 *   collapsible_controls                - not supported by tile card
 */
export function migrateMediaPlayerCard(
  config: LovelaceCardConfig
): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  // Build state_content by appending media-specific entries to whatever
  // migrateCommonConfig produced from secondary_info.
  const extraContent: string[] = [];
  if (config.use_media_info) {
    extraContent.push("media_title", "media_artist");
  }
  if (config.show_volume_level) {
    extraContent.push("volume_level");
  }
  if (extraContent.length > 0) {
    const existing = result.state_content;
    const base = Array.isArray(existing)
      ? existing
      : existing
        ? [existing]
        : [];
    result.state_content = [...base, ...extraContent];
  }

  // media_controls → playback feature
  if (config.media_controls?.length) {
    const controls = config.media_controls
      .map((control: string) => PLAYBACK_CONTROLS[control])
      .filter(Boolean);
    features.push({
      type: "media-player-playback",
      ...(controls.length ? { controls } : {}),
    });
  }

  // volume_controls
  const showMuteButton = config.volume_controls?.includes("volume_mute");
  if (config.volume_controls?.includes("volume_set")) {
    features.push({
      type: "media-player-volume-slider",
      ...(showMuteButton ? { show_mute_button: true } : {}),
    });
  }
  if (config.volume_controls?.includes("volume_buttons")) {
    features.push({
      type: "media-player-volume-buttons",
      ...(showMuteButton ? { show_mute_button: true } : {}),
    });
  }

  if (features.length > 0) result.features = wrapInCombine(features);
  return result;
}
