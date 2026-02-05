import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig, wrapInCombine } from "./common";

/**
 * Media Player Card → Tile Card Migration
 *
 * Mapped:
 *   use_media_info                   → state_content: ["media_title", "media_artist"]
 *   media_controls (any)             → feature: media-player-playback
 *   volume_controls (volume_set)     → feature: media-player-volume-slider
 *   volume_controls (volume_buttons) → feature: media-player-volume-buttons
 *
 * Not mapped (no tile equivalent):
 *   show_volume_level               - no direct tile equivalent
 *   volume_controls (volume_mute)   - no tile feature for mute toggle
 *   collapsible_controls            - not supported by tile card
 */
export function migrateMediaPlayerCard(
  config: LovelaceCardConfig
): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  // use_media_info → show media title and artist as state content
  if (config.use_media_info) {
    result.state_content = ["media_title", "media_artist"];
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
