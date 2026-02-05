import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Humidifier Card → Tile Card Migration
 *
 * Mapped:
 *   show_target_humidity_control → feature: target-humidity
 *
 * Not mapped (no tile equivalent):
 *   collapsible_controls         - not supported by tile card
 */
export function migrateHumidifierCard(
  config: LovelaceCardConfig
): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.show_target_humidity_control) {
    features.push({ type: "target-humidity" });
  }

  if (features.length > 0) result.features = features;
  return result;
}
