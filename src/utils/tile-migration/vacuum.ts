import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Vacuum Card → Tile Card Migration
 *
 * Mapped:
 *   commands → feature: vacuum-commands (with commands list)
 *
 * Not mapped (no tile equivalent):
 *   icon_animation - not supported by tile card
 */
export function migrateVacuumCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.commands?.length) {
    features.push({
      type: "vacuum-commands",
      commands: config.commands,
    });
  }

  if (features.length > 0) result.features = features;
  return result;
}
