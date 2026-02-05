import { LovelaceCardConfig } from "../../ha";
import { migrateCommonConfig, TileCardConfig } from "./common";

/**
 * Lock Card → Tile Card Migration
 *
 * Mapped:
 *   (auto) → feature: lock-commands
 *
 * Not mapped (no tile equivalent):
 *   (none — lock card has no card-specific config options)
 */
export function migrateLockCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  result.features = [{ type: "lock-commands" }];
  return result;
}
