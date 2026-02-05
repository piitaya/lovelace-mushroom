import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Alarm Control Panel Card → Tile Card Migration
 *
 * Mapped:
 *   states → feature: alarm-modes (with modes list)
 *
 * Not mapped (no tile equivalent):
 *   (none — all options are mapped)
 */
export function migrateAlarmControlPanelCard(
  config: LovelaceCardConfig
): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.states?.length) {
    features.push({
      type: "alarm-modes",
      modes: config.states,
    });
  }

  if (features.length > 0) result.features = features;
  return result;
}
