import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Media Player Card → Tile Card Migration
 *
 * Mapped:
 *   volume_controls (volume_set)    → feature: media-player-volume-slider
 *
 * Not mapped (no tile equivalent):
 *   use_media_info                  - tile card shows state natively
 *   show_volume_level               - no direct tile equivalent
 *   volume_controls (volume_mute)   - no tile feature for mute toggle
 *   volume_controls (volume_buttons) - no tile feature for volume buttons
 *   media_controls (all)            - no tile features for media transport
 *   collapsible_controls            - not supported by tile card
 */
export function migrateMediaPlayerCard(
  config: LovelaceCardConfig
): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.volume_controls?.includes("volume_set")) {
    features.push({ type: "media-player-volume-slider" });
  }

  if (features.length > 0) result.features = features;
  return result;
}
