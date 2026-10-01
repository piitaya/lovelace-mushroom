import { assign, boolean, enums, object, optional } from "superstruct";
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

export const COVER_CONTROLS = [
  "buttons_control",
  "position_control",
  "tilt_position_control",
] as const;

export type CoverCardControl = (typeof COVER_CONTROLS)[number];

export type CoverCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
    show_buttons_control?: false;
    show_position_control?: false;
    show_tilt_position_control?: false;
    default_control?: CoverCardControl;
  };

export const coverCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    entitySharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    show_buttons_control: optional(boolean()),
    show_position_control: optional(boolean()),
    show_tilt_position_control: optional(boolean()),
    default_control: optional(enums(COVER_CONTROLS)),
  })
);
