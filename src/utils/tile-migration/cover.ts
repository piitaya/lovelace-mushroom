import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig, wrapInCombine } from "./common";

/**
 * Cover Card → Tile Card Migration
 *
 * Mapped:
 *   show_buttons_control       → feature: cover-open-close
 *   show_position_control      → feature: cover-position
 *   show_tilt_position_control → feature: cover-tilt-position
 *
 * Not mapped (no tile equivalent):
 *   (none — all options are fully mapped)
 */
export function migrateCoverCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.show_buttons_control) {
    features.push({ type: "cover-open-close" });
  }
  if (config.show_position_control) {
    features.push({ type: "cover-position" });
  }
  if (config.show_tilt_position_control) {
    features.push({ type: "cover-tilt-position" });
  }

  if (features.length > 0) result.features = wrapInCombine(features);
  return result;
}
