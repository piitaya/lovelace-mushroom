import { LovelaceCardConfig } from "../../ha";
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
  result.features = [
    {
      type: "numeric-input",
      ...(config.display_mode ? { style: config.display_mode } : {}),
    },
  ];
  return result;
}
