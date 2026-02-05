import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Climate Card → Tile Card Migration
 *
 * Mapped:
 *   hvac_modes                → feature: climate-hvac-modes (with hvac_modes)
 *   show_temperature_control  → feature: target-temperature
 *
 * Not mapped (no tile equivalent):
 *   collapsible_controls      - not supported by tile card
 */
export function migrateClimateCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.hvac_modes?.length) {
    features.push({
      type: "climate-hvac-modes",
      hvac_modes: config.hvac_modes,
    });
  }
  if (config.show_temperature_control) {
    features.push({ type: "target-temperature" });
  }

  if (features.length > 0) result.features = features;
  return result;
}
