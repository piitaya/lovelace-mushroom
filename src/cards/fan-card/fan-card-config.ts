import { assign, boolean, object, optional } from "superstruct";
import {
  actionsSharedConfigStruct,
  ActionsSharedConfig,
} from "../../shared/config/actions-config";
import {
  appearanceSharedConfigStruct,
  AppearanceSharedConfig,
} from "../../shared/config/appearance-config";
import {
  entitySharedConfigStruct,
  EntitySharedConfig,
} from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export type FanCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
    icon_animation?: boolean;
    show_percentage_control?: boolean;
    show_oscillate_control?: boolean;
    show_direction_control?: boolean;
    collapsible_controls?: boolean;
  };

export const fanCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    entitySharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    icon_animation: optional(boolean()),
    show_percentage_control: optional(boolean()),
    show_oscillate_control: optional(boolean()),
    show_direction_control: optional(boolean()),
    collapsible_controls: optional(boolean()),
  })
);
