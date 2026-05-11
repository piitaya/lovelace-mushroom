import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { migrateCommonConfig, TileCardConfig, wrapInCombine } from "./common";

/**
 * Light Card → Tile Card Migration
 *
 * Mapped:
 *   icon_color                → color (fixed color when use_light_color is false)
 *   use_light_color           → omit color (tile auto-derives from entity state)
 *   show_brightness_control   → feature: light-brightness
 *   show_color_temp_control   → feature: light-color-temp
 *   show_color_control        → features: mushroom-light-hue-card-feature
 *                               + mushroom-light-saturation-card-feature
 *
 * Not mapped (no tile equivalent):
 *   collapsible_controls      - not supported by tile card
 */
export function migrateLightCard(config: LovelaceCardConfig): TileCardConfig {
  const result = migrateCommonConfig(config);

  // When use_light_color is enabled, remove fixed color so tile card
  // auto-derives color from the light entity's current state.
  if (config.use_light_color) {
    delete result.color;
  }

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
