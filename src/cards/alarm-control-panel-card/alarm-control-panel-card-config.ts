import {
  array,
  assign,
  boolean,
  deprecated,
  object,
  optional,
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
import { AlarmMode } from "../../ha/data/alarm_control_panel";

export type AlarmControlPanelCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
    states?: AlarmMode[];
  };

export const alarmControlPanelCardCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    entitySharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    states: optional(array()),
    show_keypad: deprecated(optional(boolean()), (_value, ctx) => {
      console.warn(
        `🍄 "${ctx.path}" option is deprecated and no longer available. Remove it from your YAML configuration or use the built-in Home Assistant alarm panel card if you want keypad.`
      );
    }),
  })
);
