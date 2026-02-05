import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig, wrapInCombine } from "./common";

/**
 * Light Card → Tile Card Migration
 *
 * Mapped:
 *   icon_color                → color
 *   show_brightness_control   → feature: light-brightness
 *   show_color_temp_control   → feature: light-color-temp
 *   show_color_control        → features: mushroom-light-hue-card-feature
 *                               + mushroom-light-saturation-card-feature
 *
 * Not mapped (no tile equivalent):
 *   use_light_color           - tile card uses entity color natively
 *   collapsible_controls      - not supported by tile card
 */
export function migrateLightCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);
  const features: LovelaceCardFeatureConfig[] = [];

  if (config.show_brightness_control) {
    features.push({ type: "light-brightness" });
  }
  if (config.show_color_temp_control) {
    features.push({ type: "light-color-temp" });
  }
  if (config.show_color_control) {
    features.push({
      type: "custom:mushroom-light-hue-card-feature",
    });
    features.push({
      type: "custom:mushroom-light-saturation-card-feature",
    });
  }

  if (features.length > 0) result.features = wrapInCombine(features);
  return result;
}
