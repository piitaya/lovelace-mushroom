import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig, wrapInCombine } from "./common";

/**
 * Media Player Card → Tile Card Migration
 *
 * Mapped:
 *   use_media_info                   → state_content: append "media_title",
 *                                       "media_artist"
 *   show_volume_level                → state_content: append "volume_level"
 *   media_controls (any)             → feature: media-player-playback
 *   volume_controls (volume_set)     → feature: media-player-volume-slider
 *   volume_controls (volume_buttons) → feature: media-player-volume-buttons
 *
 * Not mapped (no tile equivalent):
 *   volume_controls (volume_mute)   - no tile feature for mute toggle
 *   collapsible_controls            - not supported by tile card
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
    features.push({ type: "media-player-playback" });
  }

  // volume_controls
  if (config.volume_controls?.includes("volume_set")) {
    features.push({ type: "media-player-volume-slider" });
  }
  if (config.volume_controls?.includes("volume_buttons")) {
    features.push({ type: "media-player-volume-buttons" });
  }

  if (features.length > 0) result.features = wrapInCombine(features);
  return result;
}
