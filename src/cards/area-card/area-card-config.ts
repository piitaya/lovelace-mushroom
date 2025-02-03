import {
  array,
  assign,
  boolean,
  dynamic,
  Infer,
  literal,
  object,
  optional,
  string,
} from "superstruct";
import {
  ActionsSharedConfig,
  actionsSharedConfigStruct,
} from "../../shared/config/actions-config";
import {
  appearanceSharedConfigStruct,
  AppearanceSharedConfig,
} from "../../shared/config/appearance-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { actionConfigStruct, LovelaceCardConfig } from "../../ha";
import {
  AreaSharedConfig,
  areaSharedConfigStruct,
} from "../../shared/config/area-config";
import { ChipsCardConfig } from "../chips-card/chips-card";
import { LovelaceChipConfig } from "../../utils/lovelace/chip/types";

export type AreaCardConfig = LovelaceCardConfig &
  AreaSharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig &
  ChipsCardConfig & {
    icon_color?: string;
  };

const entityChipConfigStruct = object({
  type: literal("entity"),
  entity: optional(string()),
  name: optional(string()),
  content_info: optional(string()),
  icon: optional(string()),
  icon_color: optional(string()),
  use_entity_picture: optional(boolean()),
  tap_action: optional(actionConfigStruct),
  hold_action: optional(actionConfigStruct),
  double_tap_action: optional(actionConfigStruct),
});

const chipsConfigStruct = dynamic<any>((value) => {
  if (value && typeof value === "object" && "type" in value) {
    switch ((value as LovelaceChipConfig).type!) {
      case "entity":
        return entityChipConfigStruct;
    }
  }
  return object();
});

export const areaCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    areaSharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    icon_color: optional(string()),
    chips: array(chipsConfigStruct),
    alignment: optional(string()),
  })
);
