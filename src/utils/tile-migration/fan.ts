import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig, wrapInCombine } from "./common";

/**
 * Fan Card → Tile Card Migration
 *
 * Mapped:
 *   show_percentage_control   → feature: fan-speed
 *   show_oscillate_control    → feature: fan-oscillate
 *   show_direction_control    → feature: fan-direction
 *
 * Not mapped (no tile equivalent):
 *   icon_animation            - not supported by tile card
 *   collapsible_controls      - not supported by tile card
 */
export function migrateFanCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.show_percentage_control) {
    features.push({ type: "fan-speed" });
  }
  if (config.show_oscillate_control) {
    features.push({ type: "fan-oscillate" });
  }
  if (config.show_direction_control) {
    features.push({ type: "fan-direction" });
  }

  if (features.length > 0) result.features = wrapInCombine(features);
  return result;
}
