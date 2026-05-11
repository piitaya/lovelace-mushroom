import { LovelaceCardConfig } from "../../ha";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Entity Card → Tile Card Migration
 *
 * Mapped:
 *   icon_color → color
 *
 * Not mapped (no tile equivalent):
 *   (none — icon_color is handled by migrateCommonConfig)
 */
export function migrateEntityCard(config: LovelaceCardConfig): TileCardConfig {
  return migrateCommonConfig(config);
}
