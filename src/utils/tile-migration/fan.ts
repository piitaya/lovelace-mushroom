import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Fan Card → Tile Card Migration
 *
 * Mapped:
 *   show_percentage_control   → feature: fan-speed
 *
 * Not mapped (no tile equivalent):
 *   icon_animation            - not supported by tile card
 *   show_oscillate_control    - no tile card feature for oscillation
 *   show_direction_control    - no tile card feature for direction
 *   collapsible_controls      - not supported by tile card
 */
export function migrateFanCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.show_percentage_control) {
    features.push({ type: "fan-speed" });
  }

  if (features.length > 0) result.features = features;
  return result;
}
