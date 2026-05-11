import { LovelaceCardConfig } from "../../ha";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Select Card → Tile Card Migration
 *
 * Mapped:
 *   icon_color → color
 *   (auto)     → feature: select-options
 *
 * Not mapped (no tile equivalent):
 *   (none — all options are mapped)
 */
export function migrateSelectCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  result.features = [{ type: "select-options" }];
  return result;
}
