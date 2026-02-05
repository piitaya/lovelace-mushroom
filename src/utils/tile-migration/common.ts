import { LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";

export interface TileCardConfig extends LovelaceCardConfig {
  type: "tile";
  entity?: string;
  name?: string;
  icon?: string;
  color?: string;
  show_entity_picture?: boolean;
  vertical?: boolean;
  hide_state?: boolean;
  state_content?: string | string[];
  tap_action?: any;
  hold_action?: any;
  double_tap_action?: any;
  icon_tap_action?: any;
  icon_hold_action?: any;
  icon_double_tap_action?: any;
  features?: LovelaceCardFeatureConfig[];
  features_position?: "bottom" | "inline";
}

/**
 * Migrate common mushroom card config fields to native tile card config.
 *
 * Mapped:
 *   entity         → entity
 *   name           → name
 *   icon           → icon (when icon_type is "icon" or default)
 *   icon_type      → show_entity_picture (when "entity-picture")
 *   icon_color     → color
 *   layout         → vertical (when "vertical")
 *   secondary_info → state_content / hide_state
 *   tap_action     → tap_action
 *   hold_action    → hold_action
 *   double_tap_action → double_tap_action
 *
 * Not mapped:
 *   primary_info   - tile card always shows entity name as primary
 *   fill_container - handled by grid_options in tile card
 *   icon_type:"none" - tile card always shows an icon
 */
/**
 * Wrap multiple features in a compact combine feature so they display
 * as a single row with a toggle button. If there is only one feature
 * (or none), returns the array unchanged.
 */
export function wrapInCombine(
  features: LovelaceCardFeatureConfig[]
): LovelaceCardFeatureConfig[] {
  if (features.length <= 1) return features;
  return [
    {
      type: "custom:mushroom-combine-card-feature",
      layout: "compact",
      features,
    },
  ];
}

export function migrateCommonConfig(
  config: LovelaceCardConfig
): TileCardConfig {
  const result: TileCardConfig = {
    type: "tile",
  };

  if (config.entity) result.entity = config.entity;
  if (config.name) result.name = config.name;

  // Icon
  if (config.icon_type === "entity-picture") {
    result.show_entity_picture = true;
  } else if (config.icon_type !== "none" && config.icon) {
    result.icon = config.icon;
  }

  // Color
  if (config.icon_color) result.color = config.icon_color;

  // Layout
  if (config.layout === "vertical") result.vertical = true;

  // Secondary info → state_content
  switch (config.secondary_info) {
    case "last-changed":
      result.state_content = "last-changed";
      break;
    case "last-updated":
      result.state_content = "last-updated";
      break;
    case "none":
      result.hide_state = true;
      break;
    case "name":
      result.state_content = "name";
      break;
    // "state" is the default — no change needed
  }

  // Actions
  if (config.tap_action) result.tap_action = config.tap_action;
  if (config.hold_action) result.hold_action = config.hold_action;
  if (config.double_tap_action)
    result.double_tap_action = config.double_tap_action;

  return result;
}
