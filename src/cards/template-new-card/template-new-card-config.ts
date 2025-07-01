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

export type MushroomBadgeConfig = {
  icon?: string;
  color?: string;
  position?: "top-start" | "top-end" | "bottom-start" | "bottom-end";
};

export type TemplateNewCardConfig = LovelaceCardConfig & {
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
};

export const templateNewCardConfigStruct = assign(
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
  })
);
