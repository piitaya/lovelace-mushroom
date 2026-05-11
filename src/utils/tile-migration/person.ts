import { LovelaceCardConfig } from "../../ha";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Person Card → Tile Card Migration
 *
 * Mapped:
 *   (common fields only — entity, name, icon, actions, appearance)
 *
 * Not mapped (no tile equivalent):
 *   (none — person card has no card-specific config options)
 */
export function migratePersonCard(config: LovelaceCardConfig): TileCardConfig {
  return migrateCommonConfig(config);
}
