import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Update Card → Tile Card Migration
 *
 * Mapped:
 *   show_buttons_control → feature: update-actions
 *
 * Not mapped (no tile equivalent):
 *   collapsible_controls - not supported by tile card
 */
export function migrateUpdateCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.show_buttons_control) {
    features.push({ type: "update-actions" });
  }

  if (features.length > 0) result.features = features;
  return result;
}
