import { array, assign, enums, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { ALARM_CONTROL_PANEL_CARD_SHOW_KEYPAD_OPTIONS } from "./const";

export type AlarmControlPanelCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        states?: string[];
        show_keypad?: string;
    };

export const alarmControlPanelCardCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        states: optional(array()),
        show_keypad: optional(enums(ALARM_CONTROL_PANEL_CARD_SHOW_KEYPAD_OPTIONS)),
    })
);
