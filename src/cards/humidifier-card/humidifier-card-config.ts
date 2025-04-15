import { assign, boolean, object, optional, array, string } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
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

export type HumidifierCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
    show_target_humidity_control?: boolean;
    show_mode_control?: boolean;
    collapsible_controls?: boolean;
    available_modes?: string[];
  };

export const humidifierCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    entitySharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    show_target_humidity_control: optional(boolean()),
    show_mode_control: optional(boolean()),
    collapsible_controls: optional(boolean()),
    available_modes: optional(array(string())),
  })
);
