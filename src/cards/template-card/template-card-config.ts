import {
  any,
  array,
  assign,
  boolean,
  enums,
  object,
  optional,
  string,
  union,
} from "superstruct";
import { ActionConfig, actionConfigStruct, LovelaceCardConfig } from "../../ha";
import { LovelaceCardFeatureConfig } from "../../ha/panels/lovelace/card-features/types";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { layoutStruct } from "../../utils/layout";

export type TemplateCardConfig = LovelaceCardConfig & {
  entity?: string;
  area?: string;
  // Content
  primary?: string;
  secondary?: string;
  color?: string;
  icon?: string;
  picture?: string;
  // Badges
  badge_icon?: string;
  badge_text?: string;
  badge_color?: string;
  // Style
  vertical?: boolean;
  multiline_secondary?: boolean;
  // Interactions
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  icon_tap_action?: ActionConfig;
  icon_hold_action?: ActionConfig;
  icon_double_tap_action?: ActionConfig;
  // Features
  features?: LovelaceCardFeatureConfig[];
  features_position?: "bottom" | "inline";
  // Entity IDs for template
  entity_id?: string | string[];
  // Backwards compatibility from legacy template card
  /**
   * @deprecated Use color instead
   */
  icon_color?: string;
  /**
   * @deprecated Use vertical instead
   */
  layout?: string;
};

export const templateCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    // Context
    entity: optional(string()),
    area: optional(string()),
    // Content
    primary: optional(string()),
    secondary: optional(string()),
    color: optional(string()),
    icon: optional(string()),
    picture: optional(string()),
    // Badges
    badge_icon: optional(string()),
    badge_text: optional(string()),
    badge_color: optional(string()),
    // Style
    vertical: optional(boolean()),
    multiline_secondary: optional(boolean()),
    // Interactions
    tap_action: optional(actionConfigStruct),
    hold_action: optional(actionConfigStruct),
    double_tap_action: optional(actionConfigStruct),
    icon_tap_action: optional(actionConfigStruct),
    icon_hold_action: optional(actionConfigStruct),
    icon_double_tap_action: optional(actionConfigStruct),
    // Features
    features: optional(array(any())),
    features_position: optional(enums(["bottom", "inline"])),
    // Entity IDs for template
    entity_id: optional(union([string(), array(string())])),
    // Backwards compatibility from legacy template card
    icon_color: optional(string()),
    layout: optional(string()),
  })
);

export const migrateTemplateCardConfig = (
  config: TemplateCardConfig
): TemplateCardConfig => {
  const newConfig = { ...config };
  if (newConfig.icon_color) {
    delete newConfig.icon_color;
    if (newConfig.color == null) {
      newConfig.color = config.icon_color;
    }
  }
  if (newConfig.layout) {
    delete newConfig.layout;
    if (newConfig.vertical == null) {
      newConfig.vertical = config.layout === "vertical";
    }
  }
  return newConfig;
};
