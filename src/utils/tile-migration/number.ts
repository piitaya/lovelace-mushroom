import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Number Card → Tile Card Migration
 *
 * Mapped:
 *   icon_color    → color
 *   display_mode  → feature: numeric-input with style ("slider" | "buttons")
 *
 * Not mapped (no tile equivalent):
 *   (none — all options are mapped)
 */
export function migrateNumberCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const feature: LovelaceCardFeatureConfig = { type: "numeric-input" };
  if (config.display_mode) {
    (feature as any).style = config.display_mode;
  }
  result.features = [feature];
  return result;
}
