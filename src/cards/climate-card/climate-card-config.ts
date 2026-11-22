import {
  array,
  assign,
  boolean,
  object,
  optional,
  string,
  union,
} from "superstruct";
import { HvacMode, LovelaceCardConfig } from "../../ha";
import {
  ActionsSharedConfig,
  actionsSharedConfigStruct,
} from "../../shared/config/actions-config";
import {
  AppearanceSharedConfig,
  appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import {
  EntitySharedConfig,
  entitySharedConfigStruct,
} from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export const HVAC_MODES: HvacMode[] = [
  "auto",
  "heat_cool",
  "heat",
  "cool",
  "dry",
  "fan_only",
  "off",
];

export type ClimateCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
    show_temperature_control?: boolean;
    hvac_modes?: HvacMode[];
    fun_speed_controls?: boolean | string[];
    fun_direction_control?: boolean | string[];
    special_modes_control?: boolean | string[];
    collapsible_controls?: boolean;
    use_entity_icon?: boolean;
  };

export const climateCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    entitySharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    show_temperature_control: optional(boolean()),
    hvac_modes: optional(array(string())),
    fun_speed_controls: optional(union([boolean(), array(string())])),
    fun_direction_control: optional(union([boolean(), array(string())])),
    special_modes_control: optional(union([boolean(), array(string())])),
    collapsible_controls: optional(boolean()),
    use_entity_icon: optional(boolean()),
  })
);
