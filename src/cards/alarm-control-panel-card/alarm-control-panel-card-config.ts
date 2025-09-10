import { array, assign, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { AlarmMode } from "../../ha/data/alarm_control_panel";
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
  })
);
