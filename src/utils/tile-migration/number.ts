import { LovelaceCardConfig } from "../../ha";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Number Card → Tile Card Migration
 *
 * Mapped:
 *   icon_color    → color
 *   display_mode  → feature: numeric-input
 *
 * Not mapped (no tile equivalent):
 *   (none — all options are mapped)
 */
export function migrateNumberCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  result.features = [{ type: "numeric-input" }];
  return result;
}
