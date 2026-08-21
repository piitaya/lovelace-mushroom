import { array, assign, object, optional, string, union } from "superstruct";
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

/*
 * Advanced (YAML-only) form of a `states` entry, allowing a custom icon to be
 * set for a single arm mode button.
 */
export type AlarmModeConfig = {
  state: AlarmMode;
  icon?: string;
};

/*
 * A `states` entry is either a plain mode string (default icon) or an object
 * with a per-mode icon override.
 */
export type AlarmStateConfig = AlarmMode | AlarmModeConfig;

export type AlarmControlPanelCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
    states?: AlarmStateConfig[];
  };

/*
 * `state` is validated as a plain string rather than an enum of `AlarmMode`
 * values: the previous struct was `array()` (unconstrained), so tightening it
 * to an enum would reject configs that used to be accepted.
 */
const alarmStateConfigStruct = union([
  string(),
  object({
    state: string(),
    icon: optional(string()),
  }),
]);

export const alarmControlPanelCardCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  assign(
    entitySharedConfigStruct,
    appearanceSharedConfigStruct,
    actionsSharedConfigStruct
  ),
  object({
    states: optional(array(alarmStateConfigStruct)),
  })
);

/*
 * Normalize a `states` entry to its object form, so callers don't have to
 * handle the string/object union.
 */
export function normalizeAlarmStateConfig(
  state: AlarmStateConfig
): AlarmModeConfig {
  return typeof state === "string" ? { state } : state;
}
