import {
  assign,
  boolean,
  defaulted,
  enums,
  integer,
  object,
  optional,
  string,
} from "superstruct";
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

export const COLOR_SEVERITY_DIRECTION= ["forward", "reverse"]
export type ColorSeverityDirection = (typeof COLOR_SEVERITY_DIRECTION)[number];

export type BarCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
    min?: number;
    max?: number;
    icon_color?: string;
    enable_color_severity?: boolean;
    severity_direction?: ColorSeverityDirection;
  };

export const BarCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    entitySharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    icon_color: optional(string()),
    min: optional(integer()),
    max: optional(integer()),
    enable_color_severity: optional(boolean()),
    severity_direction: optional(enums(COLOR_SEVERITY_DIRECTION))
  })
);
