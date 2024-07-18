import { assign, object, optional, string } from "superstruct";
import { ActionConfig, actionConfigStruct, LovelaceCardConfig } from "../../ha";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export interface TitleCardConfig extends LovelaceCardConfig {
  title?: string;
  subtitle?: string;
  alignment?: string;
  title_tap_action?: ActionConfig;
  subtitle_tap_action?: ActionConfig;
}

export const titleCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    title: optional(string()),
    subtitle: optional(string()),
    alignment: optional(string()),
    title_tap_action: optional(actionConfigStruct),
    subtitle_tap_action: optional(actionConfigStruct),
  })
);
